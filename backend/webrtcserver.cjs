const express = require('express');
const https = require('https');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cors = require('cors');

class WebRTCService {
    constructor(app, options = {}) {
        this.app = app;
        this.port = process.env.PORT || 3000;
        this.host = '0.0.0.0';
        this.maxRoomParticipants = options.maxRoomParticipants || 2;
        this.rooms = {};

        this.setupSocketServer(options.sslOptions);
        this.setupRoutes();
        this.setupSocketHandlers();
    }

    setupSocketServer(sslOptions = {}) {
        // If no SSL options provided, use default or generate temporary ones
        if (Object.keys(sslOptions).length === 0) {
            sslOptions = {
                key: fs.readFileSync(path.join(__dirname, 'key.pem')),
                cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
            };
        }

        this.server = https.createServer(sslOptions, this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
    }

    setupRoutes() {
        // API routes for room management
        this.app.get('/api/rooms', this.getRooms.bind(this));
        this.app.post('/api/rooms', this.createRoom.bind(this));
        this.app.get('/api/rooms/:roomId', this.getRoomDetails.bind(this));
    }

    // API endpoint to get all active rooms
    getRooms(req, res) {
        try {
            const roomList = Object.keys(this.rooms).map(roomId => ({
                roomId,
                participants: this.rooms[roomId].length,
                maxParticipants: this.maxRoomParticipants
            }));
            res.json(roomList);
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve rooms' });
        }
    }

    // API endpoint to create a new room (optional)
    createRoom(req, res) {
        const { roomId, userName } = req.body;

        if (!roomId || !userName) {
            return res.status(400).json({ error: 'Room ID and User Name are required' });
        }

        if (this.rooms[roomId] && this.rooms[roomId].length >= this.maxRoomParticipants) {
            return res.status(409).json({ error: 'Room is full' });
        }

        // Initialize the room if it doesn't exist
        this.rooms[roomId] = this.rooms[roomId] || [];

        res.status(201).json({
            roomId,
            participants: this.rooms[roomId].length,
            maxParticipants: this.maxRoomParticipants
        });
    }

    // API endpoint to get details of a specific room
    getRoomDetails(req, res) {
        const { roomId } = req.params;

        if (!this.rooms[roomId]) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json({
            roomId,
            participants: this.rooms[roomId].map(user => ({
                id: user.id,
                name: user.name
            })),
            participantCount: this.rooms[roomId].length,
            maxParticipants: this.maxRoomParticipants
        });
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);
    
            socket.on('join-room', (roomData) => this.handleJoinRoom(socket, roomData));
            socket.on('disconnect', () => this.handleDisconnect(socket));
            socket.on('leave-room', (roomId) => this.handleLeaveRoom(socket, roomId));
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

    // Start the WebSocket server
    start() {
        this.server.listen(this.port, this.host, () => {
            console.log(`WebRTC Socket Server running on port ${this.port}`);
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

// Export a function to initialize the WebRTC service
module.exports = (app, options = {}) => {
    const webrtcService = new WebRTCService(app, options);
    return webrtcService;
};