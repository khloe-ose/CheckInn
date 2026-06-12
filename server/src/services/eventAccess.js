const { pool } = require('../config/db');
const HttpError = require('../utils/httpError');

const getEventForUser = async (eventId, user) => {
  const [rows] = await pool.query(
    `SELECT e.*, u.name AS organizer_name, u.email AS organizer_email, u.organization
     FROM events e
     JOIN users u ON u.id = e.organizer_id
     WHERE e.id = ?
     LIMIT 1`,
    [eventId],
  );

  if (!rows.length) throw new HttpError(404, 'Event not found.');
  const event = rows[0];

  if (user.role !== 'admin' && Number(event.organizer_id) !== Number(user.id)) {
    throw new HttpError(403, 'You do not have access to this event.');
  }

  return event;
};

module.exports = { getEventForUser };
