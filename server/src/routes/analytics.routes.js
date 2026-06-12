const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const { getEventForUser } = require('../services/eventAccess');

const router = express.Router();

router.use(authenticate);

const scopedWhere = (user, alias = 'e') => {
  if (user.role === 'admin') return { sql: '1 = 1', params: [] };
  return { sql: `${alias}.organizer_id = ?`, params: [user.id] };
};

router.get('/overview', asyncHandler(async (req, res) => {
  const eventScope = scopedWhere(req.user, 'e');

  const [[eventStats]] = await pool.query(
    `SELECT COUNT(*) AS total_events,
            SUM(CASE WHEN status = 'Published' THEN 1 ELSE 0 END) AS published_events,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_events
     FROM events e
     WHERE ${eventScope.sql}`,
    eventScope.params,
  );

  const [[participantStats]] = await pool.query(
    `SELECT COUNT(p.id) AS total_registrations,
            SUM(CASE WHEN p.attendance_status = 'attended' THEN 1 ELSE 0 END) AS total_attendees
     FROM events e
     LEFT JOIN participants p ON p.event_id = e.id
     WHERE ${eventScope.sql}`,
    eventScope.params,
  );

  const [mostAttended] = await pool.query(
    `SELECT e.id, e.title, e.date,
            SUM(CASE WHEN p.attendance_status = 'attended' THEN 1 ELSE 0 END) AS attendees,
            COUNT(p.id) AS registrations
     FROM events e
     LEFT JOIN participants p ON p.event_id = e.id
     WHERE ${eventScope.sql}
     GROUP BY e.id, e.title, e.date
     ORDER BY attendees DESC, registrations DESC
     LIMIT 6`,
    eventScope.params,
  );

  const [statusBreakdown] = await pool.query(
    `SELECT status, COUNT(*) AS count
     FROM events e
     WHERE ${eventScope.sql}
     GROUP BY status`,
    eventScope.params,
  );

  const registrations = Number(participantStats.total_registrations || 0);
  const attendees = Number(participantStats.total_attendees || 0);

  res.json({
    totals: {
      total_events: Number(eventStats.total_events || 0),
      published_events: Number(eventStats.published_events || 0),
      completed_events: Number(eventStats.completed_events || 0),
      total_registrations: registrations,
      total_attendees: attendees,
      attendance_rate: registrations ? Math.round((attendees / registrations) * 100) : 0,
    },
    most_attended_events: mostAttended,
    status_breakdown: statusBreakdown,
  });
}));

router.get('/events/:eventId', asyncHandler(async (req, res) => {
  const event = await getEventForUser(req.params.eventId, req.user);
  const [rows] = await pool.query(
    `SELECT DATE(registration_date) AS date, COUNT(*) AS registrations
     FROM participants
     WHERE event_id = ?
     GROUP BY DATE(registration_date)
     ORDER BY date ASC`,
    [event.id],
  );

  const [[stats]] = await pool.query(
    `SELECT COUNT(*) AS registrations,
            SUM(CASE WHEN attendance_status = 'attended' THEN 1 ELSE 0 END) AS attendees
     FROM participants
     WHERE event_id = ?`,
    [event.id],
  );

  res.json({ event, trend: rows, stats });
}));

module.exports = router;
