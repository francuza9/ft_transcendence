import { refreshLobbyDetails } from '/static/src/js/lobby.js';
import { ensureUsername } from '/static/src/js/utils.js';
import { handleRouting } from '/static/routers/router.js';
import { Pong } from '/static/views/pong_view.js';
import { initTournamentSocket } from '/static/src/js/socket_handling/tournament_socket.js';

export async function initLobbySocket(variables, aiGame = false) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(`wss://${window.location.host}/ws/${variables.lobbyId}`);

        socket.onopen = function() {
            ensureUsername().then(() => {
				variables.aiGame = aiGame;
                socket.send(JSON.stringify({ type: 'init', content: variables }));
                resolve(socket);
            });
        };

		socket.onmessage = function(event) {
			const message = JSON.parse(event.data);

			if (message.type === 'refresh') {
				const content = message.content;

				if (content && content.players) {
					variables.players = content.players;
					variables.admin = content.admin;
					variables.map = content.map;
					variables.maxPlayerCount = content.maxPlayerCount;
					variables.roomName = content.roomName;
					variables.isTournament = content.isTournament;
					variables.pointsToWin = content.winning_score;
					if (!content.aiGame) {
						refreshLobbyDetails(variables);
					}
					console.log("refreshing")
				} else {
					console.error('Lobby: Content or players undefined!', content);
				}
			} else if (message.type === 'redirect') {
				history.pushState(null, '', `/join`);
				handleRouting();
			} else if (message.type === 'start') {
				Pong(message.content);
				socket.close();
			} else if (message.type === 'start_tournament') {
				initTournamentSocket(variables).then((tournamentSocket) => {
					tournamentSocket.send(JSON.stringify({ type: 'init', content: message.content }));
				});
			} else if (message.type === 'error') {
				console.error('Error:', message.content);
			}
		};

        socket.onerror = function(error) {
            console.error('Lobby: WebSocket error:', error);
            setTimeout(() => initLobbySocket(variables).then(resolve).catch(reject), 2000);
        };

        socket.onclose = function() {
            console.log('Lobby: WebSocket connection closed.');
        };
    });
}
