import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { MessageModel } from '../models/message.model';
import fs from 'fs';
import path from 'path';


export function initializeSocketIo(server: Server){
    const io = new SocketIOServer(server, {
        cors: {
            credentials: true, // Allow cookies
            origin: (origin, callback) => {
              callback(null, origin || '*');  // Allow all origins dynamically
            },
        },
      });
    
      io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
    
        // User joins a team chat room
        socket.on('joinRoom', (teamName: string) => {
          socket.join(teamName);
          console.log(`${socket.id} joined room: ${teamName}`);
        });
    
        // Listen for messages and broadcast them to the team chat room
        socket.on('sendMessage', async ({ message, teamName, userName, isFile }: {message: string | File, teamName: string, userName: string, isFile: boolean }) => {
          const time: number = Date.now();
          
          if (typeof message === 'string') {
            console.log(`Message received from ${userName}: ${message} in team: ${teamName}`);  
            io.to(teamName).emit('receiveMessage', { userName, message, time });
          }else if (message && typeof message === 'object'  && 'name' in message && 'data' in message) {
            console.log(`File received from ${userName}: ${message.name} in team: ${teamName}`);
            let savedFileName;
            console.log('data:',message.data);
            const base64Data = message.data as string; // Type assertion to string
            const buffer = Buffer.from(base64Data.split(",")[1], 'base64');
            // save the file 
            const uploadDir = path.join(__dirname, '../..', `uploads/${teamName}`);
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filePath = path.join(__dirname, '../..', `uploads/${teamName}`, `${Math.floor(time / 1000)}-${message.name}`); 

            // Save file to the uploads directory
            fs.writeFileSync(filePath, buffer);
            console.log(`File saved at: ${filePath}`);
            savedFileName = message.name;

            io.to(teamName).emit('receiveMessage', { userName, message: `File: ${message.name}`, time });
          }
          
          try {
            let fileNme;
            let isFile: boolean = false;
            let path = '';
            if (typeof message === 'object'){
              fileNme = message.name;
              isFile = true;
              path = String(Math.floor(time / 1000))+'-'+fileNme;
            }
            
            const newMessage = {
              teamName,
              userName,
              message: typeof message === 'string' ? message : fileNme,
              dateSent: time,
              path,
              isFile,
            };
            
            await MessageModel.findOneAndUpdate(
              { teamName },
              { $push: { messages: newMessage } },
              { new: true, upsert: true } // upsert creates a new document if none is found
            );

          } catch (error) {console.log(error);}
        });
    
        // Notify the user when disconnected
        socket.on('disconnect', () => {
          console.log(`A user disconnected:`, socket.id);
        });
      });
}