import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { expenseRouter } from './routes/expenses';
import { chartRouter } from './routes/charts';
import { currencyRouter } from './routes/currency';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/expenses', expenseRouter);
app.use('/api/charts', chartRouter);
app.use('/api/currency', currencyRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});