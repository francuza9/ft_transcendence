import { replaceHTML } from '/static/src/js/utils.js';
import { variables } from '/static/src/js/variables.js';
import { initLobbySocket } from '/static/src/js/socket_handling/lobby_socket.js';

let socket;

export async function Lobby([lobbyId]) {
	variables.roomId = lobbyId;
	replaceHTML('/static/src/html/lobby.html', false);
	
	
	try {
        socket = await initLobbySocket(lobbyId);
	} catch (error) {
        console.error('Failed to initialize WebSocket:', error);
    }
}

export function getSocket()
{
	return socket;
}
