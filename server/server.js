import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import settlementRoutes from './routes/settlementRoutes.js';
import balanceRoutes from './routes/balanceRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected successfully to database'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
} else {
  console.warn('⚠️ Warning: MONGO_URI not found in environment variables');
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/balances', balanceRoutes);

// Health check route
app.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = dbStates[mongoose.connection.readyState] || 'unknown';

  res.json({
    status: 'online',
    database: state,
    hasMongoUri: !!process.env.MONGO_URI,
    message: 'WeShare API is running smoothly',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      expenses: '/api/expenses',
      settlements: '/api/settlements',
      balances: '/api/balances',
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));