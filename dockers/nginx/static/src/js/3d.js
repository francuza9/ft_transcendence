import { create2Pgame } from './2pGame/create2p.js';
import { createMultigame } from './multigame/createMultigame.js';

export function initializeWebSocket(roomId) {
    const socket = new WebSocket(`wss://localhost/ws/pong/${roomId}`);

    socket.onopen = function() {
        console.log('Connected to server');
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.message);
    };

    socket.onerror = function(error) {
        console.log("WebSocket error:", error);
    };

    // Adding a debug log to ensure event listener is set
    console.log('Setting up keypress event listener');

    document.addEventListener('keypress', function(event) {
        console.log('Key pressed:', event.key);
        if ((event.key === 'r' || event.key === 'R') && socket.readyState === WebSocket.OPEN) {
            console.log("Sending message: R");
            socket.send(JSON.stringify({ 'action': 'r' }));
        } else if (socket.readyState !== WebSocket.OPEN) {
            console.log('Cannot send message, WebSocket is not open.');
        }
    });

    socket.onclose = function(event) {
        console.log('Disconnected from server', event);
        if (!event.wasClean) {
            console.log('Connection closed unexpectedly');
        }
    };
}

// Make player names centered
export function startGame(playerCount, mappov, map, score) {
    if (playerCount === 2 && mappov < 3)
        create2Pgame(mappov, score);
    else if (playerCount > 2 && playerCount <= 8)
        createMultigame(playerCount, mappov, map);
}