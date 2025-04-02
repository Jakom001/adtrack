import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
      ? process.env.FRONTEND_URL 
      : 'http://localhost:3000',
    credentials: true
  }));
app.use(helmet());


// Routes
app.use('/api/auth', authroutes);
app.use('/api/category', isAuthenticated, category)
app.use('/api/project', isAuthenticated, project)
app.use('/api/activity', isAuthenticated, activity)


// Home Route
app.get('/', (req, res) => {
    res.send('Welcome to the home page');
});


export default app;