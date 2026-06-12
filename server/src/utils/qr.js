const crypto = require('crypto');

const createQrToken = () => crypto.randomBytes(24).toString('hex');

const createQrPayload = ({ eventId, participantId, token }) =>
  JSON.stringify({
    app: 'CheckInn',
    version: 1,
    eventId,
    participantId,
    token,
  });

const extractQrToken = (value) => {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  try {
    const parsed = JSON.parse(trimmed);
    return parsed.token || parsed.qrToken || null;
  } catch {
    return trimmed;
  }
};

module.exports = { createQrToken, createQrPayload, extractQrToken };
