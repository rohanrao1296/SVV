import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import corsOptions from './config/corsOptions.js';
import { connectDB } from './config/db.js';
import loggerMiddleware from './middleware/loggerMiddleware.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorMiddleware.js';
import apiRoutes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection / Store
connectDB();

// Core Express Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(loggerMiddleware);

// Mount API Routes
app.use('/api', apiRoutes);

// Root Welcome Endpoint & Favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Savitri Vidya Vihar API Server',
    version: '1.0.0',
    endpoints: '/api/health'
  });
});


// Error handling middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start server listening on all network interfaces (0.0.0.0) for local Wi-Fi / LAN mobile device access
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on 0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
});

export default app;
