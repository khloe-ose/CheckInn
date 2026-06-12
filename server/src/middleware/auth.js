const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) throw new HttpError(401, 'Authentication token is required.');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
  } catch {
    throw new HttpError(401, 'Invalid or expired authentication token.');
  }

  const [rows] = await pool.query(
    `SELECT id, name, email, role, organization, phone, is_active, created_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [decoded.id],
  );

  if (!rows.length || !rows[0].is_active) {
    throw new HttpError(401, 'Your account is inactive or no longer exists.');
  }

  req.user = rows[0];
  next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new HttpError(403, 'You do not have permission to perform this action.'));
  }

  return next();
};

module.exports = { authenticate, authorize };
