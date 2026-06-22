import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',    // Frontend dev
  'http://localhost:3000',    // Frontend alt
  process.env.FRONTEND_URL || ''
].filter(Boolean);

export const corsConfig = cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (ex: curl, postman) seulement en dev
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin as string)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Error: Origin not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'CSRF-Token'],
  credentials: true,
  maxAge: 86400, // Cache preflight requests for 24h
});
