import { replaceHTML } from '/static/src/js/utils.js';
import { variables } from '/static/src/js/variables.js';
import { initLobby } from '/static/src/js/lobby.js';

export async function Lobby([roomId]) {
	variables.roomId = roomId;
	console.log(roomId);
	replaceHTML('/static/src/html/lobby.html', false);
	initLobby();
}
