import { startGame } from '../src/js/3d.js';
import { initializeWebSocket } from '../src/js/socket_handling/main_socket.js';

const NO_MAP = 0;
const MOUNTAIN_MAP = 1;
const DESERT_MAP = 2;
const HELL_MAP = 3;
const SPACE_MAP = 4;

export async function Pong([roomId]) {
	const element = document.createElement('div');
	element.innerHTML = `
		<h1>Pong Game Room: ${roomId}</h1>
		<!-- Include the script directly or ensure it's loaded via your build system -->
		<script type="module" src="{% static 'src/js/3d.js' %}"></script>
	`;

	// Initialize the Pong game

	try {
        const { pov, socket } = await initializeWebSocket(roomId);
        startGame(2, pov, MOUNTAIN_MAP, socket);
		// startGame(7, 1, SPACE_MAP, socket);
	} catch (error) {
        console.error('Failed to initialize WebSocket:', error);
    }

	// pov = initializeWebSocket(roomId);
	// startGame(2, pov, MOUNTAIN_MAP, [0, 0]);

	return element;
}