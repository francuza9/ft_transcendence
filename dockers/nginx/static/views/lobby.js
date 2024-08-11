import { replaceHTML } from '/static/src/js/utils.js';

export async function Lobby() {
	replaceHTML('/static/src/html/lobby.html', false);
}
