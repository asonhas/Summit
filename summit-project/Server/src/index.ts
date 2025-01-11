import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import socketIo from 'socket.io';
import usersRouter from './controllers/users.router';
import tasksRouter from "./controllers/tasks.router";
import teamsRouter from "./controllers/teams.router";
import calendarRouter from "./controllers/calendar.router";
import { initializeSocketIo } from "./socketIo/socketIo";

dotenv.config();
const app = express();
const port = 3000;

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
mongoose.connect(mongoURI).then(() => {
  console.log("MongoDB is connected!");
}).catch((err) => console.error(err));

app.use(cors({
  //origin: 'http://localhost:5173', // Allow requests from your frontend
  credentials: true, // Allow cookies
  origin: (origin, callback) => {
    callback(null, origin || '*');  // Allow all origins dynamically
  },
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/calendar', calendarRouter);

// Create an HTTP server for both Express and Socket.IO
const server = http.createServer(app);
initializeSocketIo(server);

// Start the server on the specified port
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
