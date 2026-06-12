const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/', asyncHandler(async (req, res) => {
  const role = req.query.role;
  const params = [];
  let whereSql = '';

  if (role) {
    whereSql = 'WHERE role = ?';
    params.push(role);
  }

  const [rows] = await pool.query(
    `SELECT id, name, email, role, organization, phone, is_active, created_at, updated_at
     FROM users
     ${whereSql}
     ORDER BY created_at DESC`,
    params,
  );

  res.json({ users: rows });
}));

router.post('/', asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    organization: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    role: z.enum(['admin', 'organizer']).default('organizer'),
  });

  const payload = schema.parse(req.body);
  const passwordHash = await bcrypt.hash(payload.password, 10);

  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, organization, phone)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payload.name,
      payload.email.toLowerCase(),
      passwordHash,
      payload.role,
      payload.organization || null,
      payload.phone || null,
    ],
  );

  res.status(201).json({ id: result.insertId, message: 'User created.' });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const schema = z.object({
    role: z.enum(['admin', 'organizer']).optional(),
    is_active: z.boolean().optional(),
    organization: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
  });

  const payload = schema.parse(req.body);
  const fields = [];
  const params = [];

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    params.push(key === 'is_active' ? Number(value) : value);
  });

  if (!fields.length) throw new HttpError(400, 'No user fields provided.');

  params.push(req.params.id);
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

  res.json({ message: 'User updated.' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (Number(req.params.id) === Number(req.user.id)) {
    throw new HttpError(400, 'You cannot delete your own account.');
  }

  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'User deleted.' });
}));

module.exports = router;
