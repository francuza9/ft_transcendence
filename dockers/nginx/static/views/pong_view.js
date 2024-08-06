import { startGame } from '../src/js/3d.js';
import { initializeWebSocket } from '../src/js/3d.js';

const NO_MAP = 0;
const MOUNTAIN_MAP = 1;
const DESERT_MAP = 2;
const HELL_MAP = 3;
const SPACE_MAP = 4;

export function Pong([roomId]) {
	const element = document.createElement('div');
	element.innerHTML = `
		<h1>Pong Game Room: ${roomId}</h1>
		<!-- Include the script directly or ensure it's loaded via your build system -->
		<script type="module" src="{% static 'src/js/3d.js' %}"></script>
	`;

	// Initialize the Pong game
	
	initializeWebSocket(roomId);
	startGame(2, 1, MOUNTAIN_MAP, [0, 0]);

	return element;
}