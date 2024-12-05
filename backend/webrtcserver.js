const express = require('express');
const https = require('https');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const os = require('os');

class WebRTCServer {
    constructor(options = {}) {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.host = '0.0.0.0';
        this.maxRoomParticipants = options.maxRoomParticipants || 2;
        this.rooms = {};

        this.setupServer();
        this.configureMiddleware();
        this.setupSocketHandlers();
    }

    setupServer() {
        const sslOptions = {
            key: fs.readFileSync(path.join(__dirname, 'key.pem')),
            cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
        };

        this.server = https.createServer(sslOptions, this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
    }

    configureMiddleware() {
        this.app.use(express.static(path.join(__dirname, '../public')));
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../public', 'call-page.html'));
        });
    }


    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);
    
            socket.on('join-room', (roomData) => this.handleJoinRoom(socket, roomData));
            socket.on('disconnect', () => this.handleDisconnect(socket));
            socket.on('leave-room', () => this.handleLeaveRoom(socket));
        });
    }
    handleJoinRoom(socket, roomData) {
        const { roomId, userName } = roomData;
    
        if (!roomId || !userName) {
            socket.emit('error', 'Room ID and User Name are required');
            return;
        }
    
        if (this.rooms[roomId] && this.rooms[roomId].length >= this.maxRoomParticipants) {
            socket.emit('room-full', roomId);
            return;
        }
    
        socket.join(roomId);
        this.rooms[roomId] = this.rooms[roomId] || [];
    
        const userInfo = { id: socket.id, name: userName };
    
        // Notify other participants in the room
        socket.to(roomId).emit('user-connected', userInfo);
    
        // Add the new participant to the room
        this.rooms[roomId].push(userInfo);
    
        // Send the current room participants to the newly joined user
        const otherParticipants = this.rooms[roomId]
            .filter(user => user.id !== socket.id)
            .map(user => ({ id: user.id, name: user.name }));
    
        socket.emit('room-participants', otherParticipants);
    
        // Listen for signaling events
        socket.on('offer', (offer) => {
            socket.to(roomId).emit('offer', offer, { id: socket.id, name: userName });
        });
    
        socket.on('answer', (answer) => {
            socket.to(roomId).emit('answer', answer, { id: socket.id, name: userName });
        });
    
        socket.on('ice-candidate', (candidate) => {
            socket.to(roomId).emit('ice-candidate', candidate, { id: socket.id, name: userName });
        });
    }
    

    handleLeaveRoom(socket, roomId) {
        socket.leave(roomId);
        if (this.rooms[roomId]) {
            const leavingUser = this.rooms[roomId].find(user => user.id === socket.id);
            this.rooms[roomId] = this.rooms[roomId].filter(user => user.id !== socket.id);
            
            if (leavingUser) {
                socket.to(roomId).emit('user-disconnected', {
                    id: socket.id,
                    name: leavingUser.name
                });
            }

            if (this.rooms[roomId].length === 0) {
                delete this.rooms[roomId];
            }
        }
    }


    handleDisconnect(socket) {
        Object.keys(this.rooms).forEach((roomId) => {
            const room = this.rooms[roomId];
    
            if (room) {
                const leavingUser = room.find(user => user.id === socket.id);
    
                if (leavingUser) {
                    // Notify others in the room about the user disconnecting
                    socket.to(roomId).emit('user-disconnected', {
                        id: leavingUser.id,
                        name: leavingUser.name
                    });
    
                    // Remove the user from the room
                    this.rooms[roomId] = room.filter(user => user.id !== socket.id);
    
                    // Delete room if empty
                    if (this.rooms[roomId].length === 0) {
                        delete this.rooms[roomId];
                    }
                }
            }
        });
    }
    

    start() {
        this.server.listen(this.port, this.host, () => {
            console.log(`Server running on port ${this.port}`);
            console.log(`Access via localhost: https://localhost:${this.port}`);

            const networkInterfaces = os.networkInterfaces();
            Object.keys(networkInterfaces).forEach(interfaceName => {
                networkInterfaces[interfaceName].forEach(details => {
                    if (details.family === 'IPv4' && !details.internal) {
                        console.log(`Access via local network: https://${details.address}:${this.port}`);
                    }
                });
            });
        });
    }
}

module.exports = WebRTCServer;