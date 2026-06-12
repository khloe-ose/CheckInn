const express = require('express');
const { z } = require('zod');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { authenticate } = require('../middleware/auth');
const { extractQrToken } = require('../utils/qr');
const { getEventForUser } = require('../services/eventAccess');

const router = express.Router();

router.use(authenticate);

const checkInParticipant = async ({ participant, user, method, notes = null }) => {
  await getEventForUser(participant.event_id, user);

  if (participant.attendance_status !== 'attended') {
    await pool.query(
      `UPDATE participants
       SET attendance_status = 'attended', check_in_time = NOW()
       WHERE id = ?`,
      [participant.id],
    );
  }

  await pool.query(
    `INSERT INTO attendance_logs (event_id, participant_id, checked_in_by, method, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [participant.event_id, participant.id, user.id, method, notes],
  );

  const [[updated]] = await pool.query(
    `SELECT p.*, e.title AS event_title
     FROM participants p
     JOIN events e ON e.id = p.event_id
     WHERE p.id = ?`,
    [participant.id],
  );

  return updated;
};

router.post('/qr', asyncHandler(async (req, res) => {
  const schema = z.object({
    qrToken: z.string().optional(),
    qrData: z.string().optional(),
  });
  const payload = schema.parse(req.body);
  const token = extractQrToken(payload.qrToken || payload.qrData);

  if (!token) throw new HttpError(400, 'QR token or QR payload is required.');

  const [rows] = await pool.query(
    `SELECT p.*
     FROM participants p
     WHERE p.qr_token = ?
     LIMIT 1`,
    [token],
  );

  if (!rows.length) throw new HttpError(404, 'Participant QR code was not found.');

  const alreadyAttended = rows[0].attendance_status === 'attended';
  const participant = await checkInParticipant({
    participant: rows[0],
    user: req.user,
    method: 'qr',
    notes: alreadyAttended ? 'Duplicate QR check-in attempt.' : null,
  });

  res.json({
    message: alreadyAttended ? 'Participant was already checked in.' : 'QR check-in successful.',
    participant,
  });
}));

router.post('/manual', asyncHandler(async (req, res) => {
  const schema = z.object({
    participantId: z.coerce.number().int().positive(),
    notes: z.string().optional().nullable(),
  });
  const payload = schema.parse(req.body);

  const [rows] = await pool.query(
    'SELECT * FROM participants WHERE id = ? LIMIT 1',
    [payload.participantId],
  );

  if (!rows.length) throw new HttpError(404, 'Participant not found.');

  const alreadyAttended = rows[0].attendance_status === 'attended';
  const participant = await checkInParticipant({
    participant: rows[0],
    user: req.user,
    method: 'manual',
    notes: payload.notes || (alreadyAttended ? 'Duplicate manual check-in attempt.' : null),
  });

  res.json({
    message: alreadyAttended ? 'Participant was already checked in.' : 'Manual check-in successful.',
    participant,
  });
}));

router.get('/event/:eventId/logs', asyncHandler(async (req, res) => {
  await getEventForUser(req.params.eventId, req.user);

  const [logs] = await pool.query(
    `SELECT l.*, p.full_name, p.email, u.name AS checked_in_by_name
     FROM attendance_logs l
     JOIN participants p ON p.id = l.participant_id
     LEFT JOIN users u ON u.id = l.checked_in_by
     WHERE l.event_id = ?
     ORDER BY l.created_at DESC`,
    [req.params.eventId],
  );

  res.json({ logs });
}));

module.exports = router;
