import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

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
        socket.on('sendMessage', (message: string, teamName: string, userName: string) => {
          console.log(`Message received from ${userName}: ${message} in team: ${teamName}`);
          io.to(teamName).emit('receiveMessage', `${userName}: ${message}`); // Broadcast to all users in the team room
        });
    
        // Notify the user when disconnected
        socket.on('disconnect', () => {
          console.log('A user disconnected:', socket.id);
        });
      });
}