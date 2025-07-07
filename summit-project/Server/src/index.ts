import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import usersRouter from './controllers/users.router';
import tasksRouter from "./controllers/tasks.router";
import teamsRouter from "./controllers/teams.router";
import calendarRouter from "./controllers/calendar.router";
import { initializeSocketIo } from "./socketIo/socketIo";
import messagesRouter from "./controllers/messages.router";
import { authMiddleware } from "./middlewares/authMiddleware";
import https from 'https';
import fs from 'fs';
import path from 'path';
import Utils from "./services/utils.services";

dotenv.config();
const app = express();
const port = 3000;




Utils.connectWithFallback().catch((err) => {
  console.error('Unhandled MongoDB connection error:', err);
  process.exit(1);
});

/*const mongoURI = process.env.MONGO_URI || process.env.MONGO_CONTAINER_URI;
console.log(mongoURI)
//const mongoURI = 'mongodb://admin:admin123@localhost:27017/test?authSource=admin'
mongoose.connect(mongoURI as string).then(() => {
  console.log("MongoDB is connected!");
}).catch((err) => console.error('Error5',err));*/

app.use(cors({
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
app.use('/api/chat', messagesRouter);
app.use('/uploads',authMiddleware, express.static("./uploads"));

// Read the .pfx file
const pfxPath = path.resolve('./ssl/fs-summit.pfx');
const pfxPassword = '123456'; // Set the password if required
const options = {
  pfx: fs.readFileSync(pfxPath),
  passphrase: pfxPassword, // Optional: Only if your .pfx file is password-protected
};

const options1 = {
  key: fs.readFileSync('./ssl/private.key'),
  cert: fs.readFileSync('./ssl/certificate.pem'),
}


// Create an HTTP server for both Express and Socket.IO
const server = https.createServer(options1,app);
initializeSocketIo(server);

// Start the server on the specified port
server.listen(port, () => {
  console.log(`✅ Server is listening on port ${port}`);
});
