const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET || 'development-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  organization: user.organization,
  phone: user.phone,
  is_active: user.is_active,
  created_at: user.created_at,
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  organization: z.string().min(2),
  phone: z.string().optional().nullable(),
});

router.post('/register', asyncHandler(async (req, res) => {
  const payload = registerSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(payload.password, 10);

  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, organization, phone)
     VALUES (?, ?, ?, 'organizer', ?, ?)`,
    [
      payload.name,
      payload.email.toLowerCase(),
      passwordHash,
      payload.organization,
      payload.phone || null,
    ],
  );

  const user = {
    id: result.insertId,
    name: payload.name,
    email: payload.email.toLowerCase(),
    role: 'organizer',
    organization: payload.organization,
    phone: payload.phone || null,
    is_active: 1,
  };

  res.status(201).json({
    user: publicUser(user),
    token: signToken(user),
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const schema = z.object({
    email: z.email(),
    password: z.string().min(1),
  });
  const payload = schema.parse(req.body);

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [
    payload.email.toLowerCase(),
  ]);

  if (!rows.length) throw new HttpError(401, 'Invalid email or password.');

  const user = rows[0];
  const passwordMatches = await bcrypt.compare(payload.password, user.password_hash);

  if (!passwordMatches) throw new HttpError(401, 'Invalid email or password.');
  if (!user.is_active) throw new HttpError(403, 'This account has been deactivated.');

  res.json({
    user: publicUser(user),
    token: signToken(user),
  });
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
}));

module.exports = router;
