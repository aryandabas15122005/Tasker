import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import dashboardRoutes from './routes/dashboard';
import userRoutes from './routes/users';

const app = express();
const port = process.env.PORT || 5000;

// Allow-listed origins. CORS_ORIGINS (comma-separated) overrides the defaults.
const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://frontend-tasker-production.up.railway.app'
];
const allowlist = (process.env.CORS_ORIGINS || DEFAULT_ORIGINS.join(','))
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow tools without an Origin header (curl, health checks, server-to-server).
      if (!origin) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      console.warn(`[cors] blocked origin: ${origin}`);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`[cors] allowed origins: ${allowlist.join(', ')}`);
});
