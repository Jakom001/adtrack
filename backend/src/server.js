import app from './app.js';
import connectDB  from'./config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT
console.log(PORT)

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    });

