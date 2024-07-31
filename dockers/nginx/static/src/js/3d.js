import { create2Pgame } from './2pGame/create2p.js';
import { createMultigame } from './multigame/createMultigame.js';

const socket = new WebSocket('wss://localhost/ws/pong/');

socket.onopen = function(e) {
	console.log('Connected to WS server');
};

socket.onmessage = function(event) {
	const data = JSON.parse(event.data);
	if (data.messageType == 'startGame')
		startGame(data.playerCount, data.mappov, data.map, data.score);
};

socket.onclose = function(event) {
	if (event.wasClean)
		console.log('Connection closed cleanly');
	else
		console.log('Connection died');
};

socket.onerror = function(error) {
	console.log('Error: ' + error.message);
};

// make player names centered
export function startGame(playerCount, mappov, map, score)
{
	if (playerCount == 2 && mappov < 3)
		create2Pgame(mappov, score);
	else if (playerCount > 2 && playerCount <= 8)
		createMultigame(playerCount, mappov, map);
}
