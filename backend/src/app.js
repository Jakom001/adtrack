import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import authroutes from './routes/authRoute.js';
import category from './routes/categoryRoutes.js';
import project from './routes/projectsRoutes.js';
import activity from './routes/activityRoutes.js';
import { isAuthenticated } from './middlewares/authenticateUser.js';


const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-frontend-domain.com' 
    : process.env.FRONTEND_URL,
  credentials: true, // Important for cookies
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(helmet());
app.use(cookieParser());


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
app.use('/api/activity', isAuthenticated, activity)


// Home Route
app.get('/', (req, res) => {
    res.send('Welcome to the home page');
});

// error handler

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'production' 
          ? 'Something went wrong!' 
          : err.message 
  });
});

export default app;


