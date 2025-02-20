const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);

    ws.on('message', (message) => {
        console.log('Received:', message.toString());
        try {
            const data = JSON.parse(message);
            
            switch(data.action) {
                case 'setName':
                    handleSetName(ws, data);
                    break;
                case 'sendPublic':
                    handlePublicMessage(ws, data);
                    break;
                case 'sendPrivate':
                    handlePrivateMessage(ws, data);
                    break;
                default:
                    console.log('Unknown action:', data.action);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
        broadcastUserList();
    });
});

const NAMES_DB = new Map();

function handleSetName(ws, data) {
    NAMES_DB.set(ws, data.name);
    broadcastUserList();
    broadcastSystemMessage(`${data.name} has joined the chat`);
}

function handlePublicMessage(ws, data) {
    const name = NAMES_DB.get(ws);
    broadcastMessage(`${name}: ${data.message}`);
}

function handlePrivateMessage(ws, data) {
    const senderName = NAMES_DB.get(ws);
    const recipient = Array.from(NAMES_DB.entries())
        .find(([_, name]) => name === data.to)?.[0];
    
    if (recipient) {
        recipient.send(JSON.stringify({
            privateMessage: `${senderName}: ${data.message}`
        }));
    }
}

function broadcastUserList() {
    const users = Array.from(NAMES_DB.values());
    broadcast({ members: users });
}

function broadcastSystemMessage(message) {
    broadcast({ systemMessage: message });
}

function broadcastMessage(message) {
    broadcast({ publicMessage: message });
}

function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 