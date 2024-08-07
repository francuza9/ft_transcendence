import { create2Pgame } from './2pGame/create2p.js';
import { createMultigame } from './multigame/createMultigame.js';

export function initializeWebSocket(roomId) {
    const socket = new WebSocket(`wss://localhost/ws/pong/${roomId}/`);
	// const socket = new WebSocket(`wss://localhost/ws/pong/1/`);

    socket.onopen = function() {
        console.log('Connected to server');
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.message);
    };

	socket.onerror = function(error) {
		console.error('WebSocket error:', error);
		setTimeout(initializeWebSocket(roomId), 5000); // Retry after 1 second
	};

	socket.onclose = function() {
		console.log('WebSocket connection closed.');
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

}

// Make player names centered
export function startGame(playerCount, mappov, map, score) {
    if (playerCount === 2 && mappov < 3)
        create2Pgame(mappov, score);
    else if (playerCount > 2 && playerCount <= 8)
        createMultigame(playerCount, mappov, map);
}