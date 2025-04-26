import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import authroutes from './routes/authRoute.js';
import category from './routes/categoryRoutes.js';
import project from './routes/projectsRoutes.js';
import task from './routes/taskRoutes.js';
import { isAuthenticated } from './middlewares/authenticateUser.js';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();


const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Important for cookies
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(helmet());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);


const csrfProtection = csrf({ 
  cookie: { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
})

// Routes
app.use('/api/auth', authroutes);
app.use('/api/category', isAuthenticated, category)
app.use('/api/project', isAuthenticated, project)
app.use('/api/task', isAuthenticated, task)

// Home Route
app.get('/', (req, res) => {
    res.send('Welcome to the home page');
});


// Use 'combined' in production, 'dev' in development
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 404 Route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});
// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.stack);
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? statusCode === 500 ? 'Something went wrong!' : err.message
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

export default app;


