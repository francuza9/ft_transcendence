import { create2Pgame } from './2pGame/create2p.js';
import { createMultigame } from './multigame/createMultigame.js';

const socket = new WebSocket('wss://localhost/ws/pong/');

socket.onopen = function() {
	console.log('Connected to server');
};

socket.onmessage = function(event) {
	const data = JSON.parse(event.data);
	console.log(data.message);
};

socket.onerror = function(error) {
    console.log("WebSocket error:", error);
};

document.addEventListener('keypress', function(event) {
	if (event.key === 'r' || event.key === 'R') {
		console.log("Sending message: R");
		socket.send(JSON.stringify({ 'action': 'r' }));
	}
});

socket.onclose = function() {
	console.log('Disconnected from server');
};

// make player names centered
export function startGame(playerCount, mappov, map, score)
{
	if (playerCount == 2 && mappov < 3)
		create2Pgame(mappov, score);
	else if (playerCount > 2 && playerCount <= 8)
		createMultigame(playerCount, mappov, map);
}
