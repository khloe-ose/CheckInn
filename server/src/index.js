require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const eventsRoutes = require('./routes/events.routes');
const participantsRoutes = require('./routes/participants.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const reportsRoutes = require('./routes/reports.routes');
const certificatesRoutes = require('./routes/certificates.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = Number(process.env.PORT || 5001);
const allowedOrigins = new Set([
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 500 }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'CheckInn API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/participants', participantsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`CheckInn API running on http://localhost:${port}`);
});
