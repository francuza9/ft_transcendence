import { startGame } from '/static/src/js/3d.js';
import { initPongSocket } from '/static/src/js/socket_handling/pong_socket.js';
import { cleanupBackground } from '/static/src/js/background/background.js';
import { variables } from '/static/src/js/variables.js';

const NO_MAP = 0;
const MOUNTAIN_MAP = 1;
const DESERT_MAP = 2;
const HELL_MAP = 3;
const SPACE_MAP = 4;

export async function Pong(content) {
	const section = document.getElementsByTagName('section')[0];
	section.classList.add('hidden');
	cleanupBackground();

	let roomId = content.roomID;
	let room_size = content.playerCount;
	let map_name = content.map;

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

	if (variables.username && content.player_names && variables.username === content.player_names[1]) {
		await sleep(300);
	}

	try {
        const { pov, socket } = await initPongSocket(content);
		if (room_size < 2 || room_size > 8 || room_size < pov) {
			throw new Error('Invalid room size');
		}
        startGame(room_size, pov, map, socket, content.display_names);
	} catch (error) {
        console.error('Failed to initialize WebSocket:', error);
    }

	return element;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}