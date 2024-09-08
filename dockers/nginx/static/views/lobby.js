import {replaceHTML} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';
import {initLobbySocket} from '/static/src/js/socket_handling/lobby_socket.js';
import {updateInLobby} from '/static/src/js/lobby.js';
import {Join} from '/static/views/join.js';
import {getTranslation} from '/static/src/js/lang.js';
import {create2Pgame} from '/static/src/js/2pGame/create2p.js';
import {createMultigame} from '/static/src/js/multigame/createMultigame.js';
import {handleRouting} from '/static/routers/router.js';

let socket;

export async function Lobby([lobbyId], valid=false) {
	let lobby = await getLobbyStatus(lobbyId);

	if (lobby === undefined && !valid) {
		console.error("Ran into error while fetching lobby data");
	} else if ((lobby && lobby === 'free') || valid) {
		variables.lobbyId = lobbyId;
	
		updateInLobby(true);
		replaceHTML('/static/src/html/lobby.html', false).then(() => {

			document.getElementById('confirmation').innerText += ` ${variables.roomName}?`;
		
			const lobbyPromise = new Promise(async (resolve, reject) => {
				try {
					socket = await initLobbySocket(variables);
					resolve();
				} catch (error) {
					console.error('Failed to initialize WebSocket:', error);
					reject(error);
				}
			});
		});
	} else if (lobby === 'full_or_invalid') {
		Join();
		setTimeout(() => alert(getTranslation('pages.lobby.lobbyInvalid')), 500);
	} else if (lobby === 'ingame') {
		variables.lobbyId = lobbyId;
		spectatePong(lobbyId);

	}
}

function spectatePong(lobbyId) {

	const socketPong = new WebSocket(`wss://${window.location.host}/ws/pong/${lobbyId}/`);
	const section = document.getElementsByTagName('section')[0];
	if (section) {
		section.classList.add('hidden');
	}


	socketPong.onopen = function() {
		console.log('Pong Spectator WebSocket connection opened.');
		socketPong.send(JSON.stringify({
			'type': 'spectator',
			'lobby': lobbyId,
		}));
	}

	socketPong.onmessage = function(event) {
		if (typeof event.data === "string") {
			try {
				const data = JSON.parse(event.data);
				if (data.type === 'go') {
					create2Pgame(0, socketPong, [data.names[0], data.names[1]]);
				} else if (data.type === 'multi') {
					createMultigame(data.size, 0, data.map, socketPong);
				}
			} catch (e) {
				console.error('Pong Spectator Failed to parse JSON:', e, 'Received data:', event.data);
			}
		}
	}

}

async function getLobbyStatus(lobbyId) {
	try {
		let response = await fetch(`/api/lobby/status/${lobbyId}/`);
		let data = await response.json();
		
		return data.availability;
	} catch (error) {
		console.error('Error checking lobby status:', error);
		return undefined;
	}
}

export function getSocket()
{
	return socket;
}
