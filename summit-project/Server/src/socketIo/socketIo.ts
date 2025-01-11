import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { MessageModel } from '../models/message.model';

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
        socket.on('sendMessage', async ({ message, teamName, userName }: { message: string, teamName: string, userName: string }) => {
          console.log(`Message received from ${userName}: ${message} in team: ${teamName}`);
          io.to(teamName).emit('receiveMessage', { userName, message });
          try {
            const newMessage ={
              teamName,
              userName,
              message,
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
          console.log('A user disconnected:', socket.id);
        });
      });
}