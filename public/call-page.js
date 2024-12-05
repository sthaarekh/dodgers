// Ensure this code runs in the context of the popup
window.addEventListener('message', (event) => {
    // Verify the origin for security
    if (event.origin !== 'https://192.168.1.7:5173') {
      alert('Origin mismatch, message discarded:', event.origin);

    }
  
    // Access and process the data
    const receivedData = event.data;
    alert('Data received:', receivedData);
  
    // You can now use the received data
  }, true);
class VideoCall {
    constructor(config = {}) {
        this.configuration = {
            iceServers: [
                { 
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:stun1.l.google.com:19302',
                        'stun:stun2.l.google.com:19302'
                    ]
                }
            ],
            ...config
        };

        this.localStream = null;
        this.peerConnection = null;
        this.roomId = null;
        this.userName = null;
        this.remoteUserName = null;

        // Connect to the backend server on localhost:3000
        this.socket = io('https://192.168.1.7:3000', {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.initializeSocketListeners();
    }

    initializeSocketListeners() {
        this.socket.on('user-connected', this.handleUserConnected.bind(this));
        this.socket.on('offer', this.handleOffer.bind(this));
        this.socket.on('answer', this.handleAnswer.bind(this));
        this.socket.on('ice-candidate', this.handleIceCandidate.bind(this));
        this.socket.on('user-disconnected', this.handleUserDisconnected.bind(this));
        this.socket.on('connect_error', this.handleConnectionError.bind(this));
        this.socket.on('remote-user-info', this.handleRemoteUserInfo.bind(this));
    }

    async startCall(roomId, userName, localVideoElement, remoteVideoElement, localUserNameElement, remoteUserNameElement, roomIdElement) {
        this.roomId = roomId;
        this.userName = userName;
        this.localVideoElement = localVideoElement;
        this.remoteVideoElement = remoteVideoElement;
        this.localUserNameElement = localUserNameElement;
        this.remoteUserNameElement = remoteUserNameElement;
    
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            this.localVideoElement.srcObject = this.localStream;
    
            // Update the local user name and room ID
            this.localUserNameElement.textContent = this.userName;
            roomIdElement.textContent = this.roomId;
    
            // Emit join-room event with user details
            this.socket.emit('join-room', { 
                roomId: this.roomId, 
                userName: this.userName 
            });
        } catch (error) {
            console.error('Call start error:', error);
            throw error;
        }
    }
    
    async createPeerConnection() {
        if (this.peerConnection) {
            this.peerConnection.close();
        }

        this.peerConnection = new RTCPeerConnection(this.configuration);

        this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
        });

        this.peerConnection.ontrack = (event) => {
            this.remoteVideoElement.srcObject = event.streams[0];
        };

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('ice-candidate', event.candidate, this.roomId);
            }
        };

        return this.peerConnection;
    }

    async handleUserConnected(userData) {
        const peerConn = await this.createPeerConnection();
        
        try {
            const offer = await peerConn.createOffer();
            await peerConn.setLocalDescription(offer);
            
            // Send offer with user name
            this.socket.emit('offer', {
                offer: offer, 
                roomId: this.roomId, 
                userName: this.userName
            });
        } catch (error) {
            console.error('Offer creation error:', error);
        }
    }

    async handleOffer(offerData) {
        try {
            const peerConn = await this.createPeerConnection();
            await peerConn.setRemoteDescription(new RTCSessionDescription(offerData.offer));
            
            const answer = await peerConn.createAnswer();
            await peerConn.setLocalDescription(answer);
            
            // Send answer with user name
            this.socket.emit('answer', {
                answer: answer, 
                roomId: this.roomId, 
                userName: this.userName
            });
        } catch (error) {
            console.error('Offer handling error:', error);
        }
    }

    handleRemoteUserInfo(userData) {
        this.remoteUserName = userData.userName;
        this.remoteUserNameElement.textContent = this.remoteUserName;
    }

    async handleAnswer(answerData) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerData.answer));
        } catch (error) {
            console.error('Answer handling error:', error);
        }
    }

    async handleIceCandidate(candidate, userId) {
        try {
            if (this.peerConnection) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (error) {
            console.error('ICE candidate error:', error);
        }
    }

    handleUserDisconnected(userId) {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
            this.remoteVideoElement.srcObject = null;
            this.remoteUserNameElement.textContent = '';
            this.remoteUserName = null;
        }
    }

    handleConnectionError(error) {
        console.error('Connection error:', error);
    }

    endCall() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        this.localVideoElement.srcObject = null;
        this.remoteVideoElement.srcObject = null;
        this.remoteUserNameElement.textContent = '';
        this.localUserNameElement.textContent = '';
        this.socket.emit('leave-room', this.roomId);
    }
}

// Usage Example
document.addEventListener('DOMContentLoaded', () => {
    const videoCall = new VideoCall();
    const joinBtn = document.getElementById('join-btn');
    const hangupBtn = document.getElementById('hangup-btn');
    const roomInput = document.getElementById('room-input');
    const userNameInput = document.getElementById('username-input');
    const localVideo = document.getElementById('local-video');
    const remoteVideo = document.getElementById('remote-video');
    const localUserName = document.getElementById('local-username');
    const remoteUserName = document.getElementById('remote-username');
    const roomIdDisplay = document.getElementById('room-id-display');
    const lobbySection = document.getElementById('lobby-section');
    const callSection = document.getElementById('call-section');

    joinBtn.addEventListener('click', async () => {
        const roomId = roomInput.value;
        const userName = userNameInput.value;

        if (!roomId) {
            alert('Please enter a room name');
            return;
        }

        if (!userName) {
            alert('Please enter your name');
            return;
        }

        try {
            await videoCall.startCall(
                roomId, 
                userName, 
                localVideo, 
                remoteVideo, 
                localUserName, 
                remoteUserName,
                roomIdDisplay
            );
            lobbySection.style.display = 'none';
            callSection.style.display = 'block';
        } catch (error) {
            alert('Could not start call');
        }
    });

    hangupBtn.addEventListener('click', () => {
        videoCall.endCall();
        callSection.style.display = 'none';
        lobbySection.style.display = 'block';
    });
});

  