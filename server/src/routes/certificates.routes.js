const express = require('express');
const PDFDocument = require('pdfkit');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { authenticate } = require('../middleware/auth');
const { getEventForUser } = require('../services/eventAccess');

const router = express.Router();

router.use(authenticate);

router.get('/participants/:participantId', asyncHandler(async (req, res) => {
  const [[participant]] = await pool.query(
    `SELECT p.*, e.title AS event_title, e.date AS event_date, e.venue, e.organizer_id,
            u.organization, u.name AS organizer_name
     FROM participants p
     JOIN events e ON e.id = p.event_id
     JOIN users u ON u.id = e.organizer_id
     WHERE p.id = ?
     LIMIT 1`,
    [req.params.participantId],
  );

  if (!participant) throw new HttpError(404, 'Participant not found.');
  await getEventForUser(participant.event_id, req.user);

  if (participant.attendance_status !== 'attended') {
    throw new HttpError(400, 'Certificates can only be generated for attended participants.');
  }

  let [[certificate]] = await pool.query(
    'SELECT * FROM certificates WHERE participant_id = ? LIMIT 1',
    [participant.id],
  );

  if (!certificate) {
    const code = `CHK-${participant.event_id}-${participant.id}-${Date.now().toString(36).toUpperCase()}`;
    await pool.query(
      `INSERT INTO certificates (event_id, participant_id, certificate_code, issued_by)
       VALUES (?, ?, ?, ?)`,
      [participant.event_id, participant.id, code, req.user.id],
    );
    [[certificate]] = await pool.query(
      'SELECT * FROM certificates WHERE participant_id = ? LIMIT 1',
      [participant.id],
    );
  }

  const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 56 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${participant.full_name.replace(/[^a-z0-9]/gi, '-')}-certificate.pdf"`,
  );

  doc.pipe(res);

  doc
    .rect(28, 28, doc.page.width - 56, doc.page.height - 56)
    .lineWidth(2)
    .stroke('#1d4ed8');

  doc
    .fontSize(16)
    .fillColor('#2563eb')
    .text(participant.organization || 'CheckInn Event Program', { align: 'center' });

  doc.moveDown(1);
  doc.fontSize(34).fillColor('#0f172a').text('Certificate of Attendance', {
    align: 'center',
  });

  doc.moveDown(1.5);
  doc.fontSize(14).fillColor('#475569').text('This certificate is proudly presented to', {
    align: 'center',
  });

  doc.moveDown(0.4);
  doc.fontSize(28).fillColor('#1d4ed8').text(participant.full_name, {
    align: 'center',
  });

  doc.moveDown(0.8);
  doc
    .fontSize(15)
    .fillColor('#334155')
    .text(`for attending "${participant.event_title}" held on ${participant.event_date} at ${participant.venue}.`, {
      align: 'center',
    });

  doc.moveDown(2);
  doc.fontSize(12).fillColor('#64748b').text(`Certificate Code: ${certificate.certificate_code}`, {
    align: 'center',
  });
  doc.text(`Issued by: ${participant.organizer_name}`, { align: 'center' });

  doc.end();
}));

module.exports = router;
