import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authroutes from './routes/authRoute.js';

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(helmet());


// Routes
app.use('/api/auth', authroutes);


// Home Route
app.get('/', (req, res) => {
    res.send('Welcome to the home page');
});


export default app;