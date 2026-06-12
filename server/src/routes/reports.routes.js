const express = require('express');
const { Parser } = require('json2csv');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const { getEventForUser } = require('../services/eventAccess');

const router = express.Router();

router.use(authenticate);

router.get('/events/:eventId/summary', asyncHandler(async (req, res) => {
  const event = await getEventForUser(req.params.eventId, req.user);
  const [[stats]] = await pool.query(
    `SELECT COUNT(*) AS total_registrations,
            SUM(CASE WHEN attendance_status = 'attended' THEN 1 ELSE 0 END) AS total_attendees
     FROM participants
     WHERE event_id = ?`,
    [event.id],
  );

  const [participants] = await pool.query(
    `SELECT full_name, email, student_number, course_department, registration_date,
            attendance_status, check_in_time
     FROM participants
     WHERE event_id = ?
     ORDER BY full_name ASC`,
    [event.id],
  );

  const registrations = Number(stats.total_registrations || 0);
  const attendees = Number(stats.total_attendees || 0);

  res.json({
    event,
    summary: {
      total_registrations: registrations,
      total_attendees: attendees,
      attendance_rate: registrations ? Math.round((attendees / registrations) * 100) : 0,
    },
    participants,
  });
}));

router.get('/events/:eventId/attendance.csv', asyncHandler(async (req, res) => {
  const event = await getEventForUser(req.params.eventId, req.user);
  const [rows] = await pool.query(
    `SELECT full_name, email, student_number, course_department, registration_date,
            attendance_status, check_in_time
     FROM participants
     WHERE event_id = ?
     ORDER BY full_name ASC`,
    [event.id],
  );

  const parser = new Parser({
    fields: [
      'full_name',
      'email',
      'student_number',
      'course_department',
      'registration_date',
      'attendance_status',
      'check_in_time',
    ],
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${event.slug}-attendance.csv"`,
  );
  res.send(parser.parse(rows));
}));

module.exports = router;
