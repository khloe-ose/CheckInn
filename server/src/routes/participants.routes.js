const express = require('express');
const QRCode = require('qrcode');
const { z } = require('zod');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { authenticate } = require('../middleware/auth');
const { createQrPayload, createQrToken } = require('../utils/qr');
const { getEventForUser } = require('../services/eventAccess');

const router = express.Router();

const participantSchema = z.object({
  full_name: z.string().min(2),
  email: z.email(),
  student_number: z.string().min(2),
  course_department: z.string().min(2),
});

router.post('/public/:slug', asyncHandler(async (req, res) => {
  const payload = participantSchema.parse(req.body);
  const [eventRows] = await pool.query(
    `SELECT e.*, COALESCE(stats.registrations, 0) AS registrations
     FROM events e
     LEFT JOIN (
       SELECT event_id, COUNT(*) AS registrations
       FROM participants
       GROUP BY event_id
     ) stats ON stats.event_id = e.id
     WHERE e.slug = ? AND e.status = 'Published'
     LIMIT 1`,
    [req.params.slug],
  );

  if (!eventRows.length) throw new HttpError(404, 'Published event not found.');

  const event = eventRows[0];
  const deadline = new Date(`${event.registration_deadline}T23:59:59`);
  if (Number.isFinite(deadline.getTime()) && deadline < new Date()) {
    throw new HttpError(400, 'Registration for this event is already closed.');
  }

  if (Number(event.registrations) >= Number(event.capacity)) {
    throw new HttpError(400, 'This event has reached its registration capacity.');
  }

  const token = createQrToken();
  const [result] = await pool.query(
    `INSERT INTO participants
       (event_id, full_name, email, student_number, course_department, qr_token, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, '')`,
    [
      event.id,
      payload.full_name,
      payload.email.toLowerCase(),
      payload.student_number,
      payload.course_department,
      token,
    ],
  );

  const qrPayload = createQrPayload({
    eventId: event.id,
    participantId: result.insertId,
    token,
  });
  const qrCode = await QRCode.toDataURL(qrPayload);

  await pool.query('UPDATE participants SET qr_code = ? WHERE id = ?', [
    qrCode,
    result.insertId,
  ]);

  res.status(201).json({
    message: 'Registration successful.',
    participant: {
      id: result.insertId,
      event_id: event.id,
      ...payload,
      qr_code: qrCode,
      qr_token: token,
    },
  });
}));

router.use(authenticate);

router.get('/event/:eventId', asyncHandler(async (req, res) => {
  await getEventForUser(req.params.eventId, req.user);

  const params = [req.params.eventId];
  const where = ['event_id = ?'];

  if (req.query.status === 'attended') {
    where.push("attendance_status = 'attended'");
  }

  if (req.query.status === 'not_attended') {
    where.push("attendance_status <> 'attended'");
  }

  if (req.query.q) {
    where.push('(LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(student_number) LIKE ?)');
    const term = `%${String(req.query.q).toLowerCase()}%`;
    params.push(term, term, term);
  }

  const [participants] = await pool.query(
    `SELECT *
     FROM participants
     WHERE ${where.join(' AND ')}
     ORDER BY registration_date DESC`,
    params,
  );

  res.json({ participants });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, e.title AS event_title, e.organizer_id
     FROM participants p
     JOIN events e ON e.id = p.event_id
     WHERE p.id = ?
     LIMIT 1`,
    [req.params.id],
  );

  if (!rows.length) throw new HttpError(404, 'Participant not found.');
  await getEventForUser(rows[0].event_id, req.user);

  res.json({ participant: rows[0] });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, event_id FROM participants WHERE id = ? LIMIT 1',
    [req.params.id],
  );

  if (!rows.length) throw new HttpError(404, 'Participant not found.');
  await getEventForUser(rows[0].event_id, req.user);

  await pool.query('DELETE FROM participants WHERE id = ?', [req.params.id]);
  res.json({ message: 'Participant deleted.' });
}));

module.exports = router;
