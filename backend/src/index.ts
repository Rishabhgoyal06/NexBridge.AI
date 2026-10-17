import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { authRouter } from './routes/auth.js';
import { ideasRouter } from './routes/ideas.js';
import { outreachRouter } from './routes/outreach.js';
import { talentRouter } from './routes/talent.js';
import { mentorsRouter } from './routes/mentors.js';
import { chatRouter } from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NexBridge.ai Backend API',
    supabaseConnected: true,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/ideas', ideasRouter);
app.use('/api/outreach', outreachRouter);
app.use('/api/candidates', outreachRouter);
app.use('/api/talent', talentRouter);
app.use('/api/mentors', mentorsRouter);
app.use('/api/chat', chatRouter);

app.listen(port, () => {
  console.log(`🚀 NexBridge.ai backend running on http://localhost:${port}`);
});
