import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import enquiryRouter from './routes/enquiry.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, cb) => {
    const allowed = ['http://localhost:3000', 'https://your-frontend-domain.com'];
    if (!origin || allowed.includes(origin)) cb(null, true);
    else cb(new Error('CORS blocked'));
  },
}));
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/enquiry', enquiryRouter);

// 404
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
