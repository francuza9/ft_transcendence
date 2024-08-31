
import { ensureUsername } from '/static/src/js/utils.js';

export async function initTournamentSocket(variables) {
	return new Promise((resolve, reject) => {
		const socket = new WebSocket(`wss://${window.location.host}/ws/tournament/${variables.lobbyId}`);

		socket.onopen = function() {
			console.log('Tournament: WebSocket connection opened.');
			resolve(socket);
		};

		socket.onmessage = function(event) {
			const message = JSON.parse(event.data);
			console.log('type: ', message.type, " content: ", message.content);
		};

		socket.onerror = function(error) {
			console.error('Tournament: WebSocket error:', error);
			setTimeout(() => initTournamentSocket(variables).then(resolve).catch(reject), 2000);
		};

		socket.onclose = function() {
			console.log('Tournament: WebSocket connection closed.');
		};
	});
}
