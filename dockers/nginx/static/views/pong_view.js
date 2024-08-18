import { startGame } from '/static/src/js/3d.js';
import { initPongSocket } from '/static/src/js/socket_handling/pong_socket.js';
import { cleanupBackground } from '/static/src/js/background/background.js';

const NO_MAP = 0;
const MOUNTAIN_MAP = 1;
const DESERT_MAP = 2;
const HELL_MAP = 3;
const SPACE_MAP = 4;

export async function Pong(roomId, room_size, map_name, ) {
	const section = document.getElementsByTagName('section')[0];
	section.remove();
	cleanupBackground();

	const element = document.createElement('div');
	element.innerHTML = `
		<h1>Pong Game Room: ${roomId}</h1>
		<!-- Include the script directly or ensure it's loaded via your build system -->
		<script type="module" src="{% static 'src/js/3d.js' %}"></script>
	`;
	let map = NO_MAP;

	if (map_name === 'Mountain') {
		map = MOUNTAIN_MAP;
	} else if (map_name === 'Desert') {
		map = DESERT_MAP;
	} else if (map_name === 'Hell') {
		map = HELL_MAP;
	} else if (map_name === 'Space') {
		map = SPACE_MAP;
	}

	// Initialize the Pong game
	try {
        const { pov, socket } = await initPongSocket(roomId, room_size);
		if (room_size < 2 || room_size > 8 || room_size < pov) {
			throw new Error('Invalid room size');
		}
        startGame(room_size, pov, map, socket);
	} catch (error) {
        console.error('Failed to initialize WebSocket:', error);
    }

	return element;
}