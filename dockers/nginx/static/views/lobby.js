import { replaceHTML } from '/static/src/js/utils.js';
import { variables } from '/static/src/js/variables.js';
import { initLobbySocket } from '/static/src/js/socket_handling/lobby_socket.js';

let socket;

export async function Lobby([lobbyId]) {
	variables.lobbyId = lobbyId;
	replaceHTML('/static/src/html/lobby.html', false).then(() => {
	
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
}

export function getSocket()
{
	return socket;
}
