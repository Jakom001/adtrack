import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authroutes from './routes/authRoute.js';
import category from './routes/categoryRoutes.js';
import project from './routes/projectsRoutes.js';

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(helmet());


// Routes
app.use('/api/auth', authroutes);
app.use('/api/category', category)
app.use('/api/project', project)


// Home Route
app.get('/', (req, res) => {
    res.send('Welcome to the home page');
});


export default app;