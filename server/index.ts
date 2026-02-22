import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat';
import { groceryRouter } from './routes/grocery';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

// Rate limiting — prevent abuse of the AI endpoint
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
});

app.use('/api/', apiLimiter);

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/grocery', groceryRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bloom-api' });
});

app.listen(PORT, () => {
  console.log(`Bloom API server running on port ${PORT}`);
});

export default app;
