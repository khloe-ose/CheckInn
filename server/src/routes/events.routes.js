const express = require('express');
const { z } = require('zod');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { authenticate } = require('../middleware/auth');
const { uniqueEventSlug } = require('../utils/slug');
const { getEventForUser } = require('../services/eventAccess');

const router = express.Router();

const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  date: z.string().min(8),
  time: z.string().min(4),
  venue: z.string().min(2),
  capacity: z.coerce.number().int().positive(),
  registration_deadline: z.string().min(8),
  status: z.enum(['Draft', 'Published', 'Completed', 'Cancelled']).default('Draft'),
  organizer_id: z.coerce.number().int().positive().optional(),
});

router.get('/public/:slug', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT e.id, e.title, e.slug, e.description, e.date, e.time, e.venue, e.capacity,
            e.registration_deadline, e.status, u.name AS organizer_name, u.organization,
            COUNT(p.id) AS registrations
     FROM events e
     JOIN users u ON u.id = e.organizer_id
     LEFT JOIN participants p ON p.event_id = e.id
     WHERE e.slug = ? AND e.status = 'Published'
     GROUP BY e.id, e.title, e.slug, e.description, e.date, e.time, e.venue, e.capacity,
              e.registration_deadline, e.status, u.name, u.organization
     LIMIT 1`,
    [req.params.slug],
  );

  if (!rows.length) throw new HttpError(404, 'Published event not found.');
  res.json({ event: rows[0] });
}));

router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const params = [];
  const where = [];

  if (req.user.role !== 'admin') {
    where.push('e.organizer_id = ?');
    params.push(req.user.id);
  }

  if (req.query.status) {
    where.push('e.status = ?');
    params.push(req.query.status);
  }

  if (req.query.q) {
    where.push('(LOWER(e.title) LIKE ? OR LOWER(e.venue) LIKE ?)');
    const term = `%${String(req.query.q).toLowerCase()}%`;
    params.push(term, term);
  }

  const [events] = await pool.query(
    `SELECT e.*, u.name AS organizer_name, u.organization,
            COALESCE(stats.registrations, 0) AS registrations,
            COALESCE(stats.attendees, 0) AS attendees
     FROM events e
     JOIN users u ON u.id = e.organizer_id
     LEFT JOIN (
       SELECT event_id,
              COUNT(*) AS registrations,
              SUM(CASE WHEN attendance_status = 'attended' THEN 1 ELSE 0 END) AS attendees
       FROM participants
       GROUP BY event_id
     ) stats ON stats.event_id = e.id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY e.date DESC, e.time DESC`,
    params,
  );

  res.json({ events });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const event = await getEventForUser(req.params.id, req.user);
  const [[stats]] = await pool.query(
    `SELECT COUNT(*) AS registrations,
            SUM(CASE WHEN attendance_status = 'attended' THEN 1 ELSE 0 END) AS attendees
     FROM participants
     WHERE event_id = ?`,
    [event.id],
  );

  res.json({
    event: {
      ...event,
      registrations: stats.registrations || 0,
      attendees: stats.attendees || 0,
    },
  });
}));

router.post('/', asyncHandler(async (req, res) => {
  const payload = eventSchema.parse(req.body);
  const organizerId = req.user.role === 'admin' && payload.organizer_id
    ? payload.organizer_id
    : req.user.id;
  const slug = await uniqueEventSlug(payload.title);

  const [result] = await pool.query(
    `INSERT INTO events
       (title, slug, description, date, time, venue, organizer_id, capacity, registration_deadline, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.title,
      slug,
      payload.description || null,
      payload.date,
      payload.time,
      payload.venue,
      organizerId,
      payload.capacity,
      payload.registration_deadline,
      payload.status,
    ],
  );

  res.status(201).json({ id: result.insertId, slug, message: 'Event created.' });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  await getEventForUser(req.params.id, req.user);
  const payload = eventSchema.parse(req.body);
  const organizerId = req.user.role === 'admin' && payload.organizer_id
    ? payload.organizer_id
    : req.user.id;
  const slug = await uniqueEventSlug(payload.title, req.params.id);

  await pool.query(
    `UPDATE events
     SET title = ?, slug = ?, description = ?, date = ?, time = ?, venue = ?,
         organizer_id = ?, capacity = ?, registration_deadline = ?, status = ?
     WHERE id = ?`,
    [
      payload.title,
      slug,
      payload.description || null,
      payload.date,
      payload.time,
      payload.venue,
      organizerId,
      payload.capacity,
      payload.registration_deadline,
      payload.status,
      req.params.id,
    ],
  );

  res.json({ slug, message: 'Event updated.' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await getEventForUser(req.params.id, req.user);
  await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
  res.json({ message: 'Event deleted.' });
}));

module.exports = router;
