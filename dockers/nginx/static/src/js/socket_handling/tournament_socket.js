import {generateTournamentView, displayWinner} from '/static/src/js/tournament.js';
import {ensureUsername} from '/static/src/js/utils.js';
import {checkLoginStatus, guestLogin} from '/static/src/js/utils.js';
import {initLobbySocket} from '/static/src/js/socket_handling/lobby_socket.js';
import {addBot,startButton} from '/static/src/js/lobby.js';
import {cleanupBackground} from '/static/src/js/background/background.js';
import {spectatePong} from '/static/views/lobby.js';

let socket;

export async function initTournamentSocket(variables) {
	return new Promise((resolve, reject) => {
		ensureUsername().then(() => {
			socket = new WebSocket(`wss://${window.location.host}/ws/tournament/${variables.lobbyId}/?username=${variables.username}`);
			variables.tournamentID = variables.lobbyId;

			socket.onopen = function() {
				console.log('Tournament: WebSocket connection opened.');
				resolve(socket);
			};

			socket.onmessage = function(event) {
				const message = JSON.parse(event.data);
				if (message.type === 'start') {
					variables.lobbyId = message.content.lobbyId;
					variables.aiGame = message.content.aiGame;
					variables.isTournament = false;
					variables.maxPlayerCount = 2;
					variables.partOfTournament = true;
					if (message.content.aiGame === true) {
						let botName = message.content.botName;
						play_with_ai(variables, botName);
					} else if (message.content.aiGame === false && message.content.admin === true) {
						pvp_create(variables);
					} else if (message.content.aiGame === false && message.content.admin === false) {
						pvp_start(variables);
					}
				} else if (message.type === 'matchups') {
					generateTournamentView(message.content.matchups, message.content.firstTime, message.content.displays);
					if (message.content.firstTime) {
						cleanupBackground();
					}
				} else if (message.type === 'winner') {
					displayWinner(message.content.winner);
				}

			socket.onerror = function(error) {
				console.error('Tournament: WebSocket error:', error);
				setTimeout(() => initTournamentSocket(variables).then(resolve).catch(reject), 2000);
			};

			socket.onclose = function() {
				console.log('Tournament: WebSocket connection closed.');
			};
	}});
	});
}

async function play_with_ai(variables, botName) {
	if (!variables.username) {
		try {
			const loggedIn = await checkLoginStatus();
			if (!loggedIn) {
				await guestLogin();
			}
		} catch (error) {
			console.error('Error checking login status:', error); 
		}
	}

	history.pushState(null, '', `/${variables.lobbyId}`);
	variables.players = [variables.username];
	try {
		const socket = await initLobbySocket(variables, true);
		if (socket) {
			addBot(self, socket, botName);
			startButton(self, socket);
		} else {
			console.error('Failed to initialize socket.');
		}
	} catch (error) {
		console.error('Failed to initialize WebSocket:', error);
	}
}

async function pvp_create(variables) {
	if (!variables.username) {
		try {
			const loggedIn = await checkLoginStatus();
			if (!loggedIn) {
				await guestLogin();
			}
		} catch (error) {
			console.error('Error checking login status:', error); 
		}
	}
	history.pushState(null, '', `/${variables.lobbyId}`);
	variables.players = [variables.username];
	try {
		const socket = await initLobbySocket(variables, false);
	} catch (error) {
		console.error('Failed to initialize WebSocket:', error);
	}
}

async function pvp_start(variables) {
	if (!variables.username) {
		try {
			const loggedIn = await checkLoginStatus();
			if (!loggedIn) {
				await guestLogin();
			}
		} catch (error) {
			console.error('Error checking login status:', error); 
		}
	}
	history.pushState(null, '', `/${variables.lobbyId}`);
	variables.players = [variables.username];
	try {
		const socket = await initLobbySocket(variables, false);
		if (socket) {
			startButton(self, socket);
		} else {
			console.error('Failed to initialize socket.');
		}
	} catch (error) {
		console.error('Failed to initialize WebSocket:', error);
	}
}

export function getTournamentSocket() {
	return socket;
}

function sleep(ms, callback) {
    setTimeout(callback, ms);
}
