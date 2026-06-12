const { pool } = require('../config/db');

const baseSlug = (value) =>
  String(value || 'event')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'event';

const uniqueEventSlug = async (title, ignoredId = null) => {
  const base = baseSlug(title);
  let candidate = base;
  let suffix = 1;

  while (true) {
    const params = ignoredId ? [candidate, ignoredId] : [candidate];
    const ignoredSql = ignoredId ? ' AND id <> ?' : '';
    const [rows] = await pool.query(
      `SELECT id FROM events WHERE slug = ?${ignoredSql} LIMIT 1`,
      params,
    );

    if (!rows.length) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
};

module.exports = { uniqueEventSlug };
