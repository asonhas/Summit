import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import usersRouter from './controllers/users.router';
import tasksRouter from "./controllers/tasks.router";


dotenv.config();
const app = express();
const port = 3000;

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
console.log('mongoURI:',mongoURI);
mongoose.connect(mongoURI).then(() => {
  console.log("MongoDB is connected!");
}).catch((err) => console.error(err));
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your frontend
  credentials: true, // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());



app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});