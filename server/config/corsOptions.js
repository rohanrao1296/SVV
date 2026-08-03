import dotenv from 'dotenv';
dotenv.config();

export const corsOptions = {
  origin: true, // Dynamically reflect request origin (http://localhost:5173, LAN IPs, Netlify/Render)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

export default corsOptions;
