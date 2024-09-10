import {cleanupBackground} from '/static/src/js/background/background.js';
import {handleRouting} from '/static/routers/router.js';
import {getSocket} from '/static/views/lobby.js';
import {replaceHTML} from '/static/src/js/utils.js';
import {checkLoginStatus} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';
import {getSocketAI} from '/static/src/js/local.js';
import {getTranslation} from '/static/src/js/lang.js';

export let in_lobby = false;

export const updateInLobby = (value) => {
	in_lobby = value;
}

function updateLobbyDetails(variables) {
	if (variables.roomName)
		document.getElementById('lobbyTitle').innerText = variables.roomName;
	const mode = variables.isTournament ? getTranslation('pages.createRoom.tournamentMode') : getTranslation('pages.createRoom.classicMode');
	document.getElementById('lobbyDetails').innerText = `${getTranslation('pages.createRoom.players')}: ${variables.players.length} / ${variables.maxPlayerCount} | ${getTranslation('pages.createRoom.map')}: ${variables.map} | ${getTranslation('pages.createRoom.winningScore')}: ${variables.pointsToWin} | ${getTranslation('pages.createRoom.mode')}: ${mode}`;
}

export const refreshLobbyDetails = (variables) => {
	if (in_lobby) {
		renderPlayerList(variables);
		updateLobbyDetails(variables);
		if (variables.username === variables.admin) {
			showAdminButtons();
		}
	}
}

export const showAdminButtons = () => {
	const startButton = document.getElementById('start');
	const botButton = document.getElementById('bot');

	startButton.classList.remove('hidden');
	if (variables.isTournament)
		botButton.classList.remove('hidden');
}

function renderPlayerList(variables) {
    const playerListElement = document.getElementsByClassName('playerList')[0];
	playerListElement.innerHTML = '';

	let highestIndex = -1;
    variables.players.forEach((player, index) => {
		highestIndex = index;
        const row = document.createElement('tr');
        row.classList.add('player-row');
        row.setAttribute('data-player-id', `${player}`);

		if (player === variables.username) {
            row.classList.add('highlighted-row');
        }

        row.innerHTML = `
			<!-- 
			<td><img src="${player.profile_picture || 'https://via.placeholder.com/40'}" alt="${player}" class="player-img"></td>
			<td>${player.gamesWon}</td>
			-->
            <td>${player}${player === variables.admin ? '<span class="admin-badge">Room Admin</span>' : ''}</td>
        `;

        playerListElement.appendChild(row);
    });
	if (highestIndex >= 0) {
		const lastRow = playerListElement.children[highestIndex];
		lastRow.classList.add('no-bottom-border');
	}
}

export const leaveRoom = () => {
	const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

	history.pushState(null, '', `/`);
	replaceHTML('/static/src/html/room.html');

	const socket = getSocket();
	if (!socket) {
		console.error('WebSocket is not initialized yet.');
		return;
	}

	if (socket.readyState === WebSocket.OPEN) {
		checkLoginStatus().then(loggedIn => {
			socket.send(JSON.stringify({ type: 'exit', content: { username: variables.username } }));
		});
	} else {
		console.error('WebSocket is not open.');
	}
};


export const startButton = (self, tournamentSocket) => {
	if (!variables.isTournament) {
		let socket = getSocket();
		if (!socket) {
			socket = getSocketAI();
		}
		if (tournamentSocket != undefined) {
			socket = tournamentSocket;
		}

		if (!socket) {
			console.error('WebSocket is not initialized yet.');
			return;
		}

		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ type: 'start' }));
		} else {
			console.error('WebSocket is not open.');
		}
	} else {
		const lobbySocket = getSocket();
		if (lobbySocket) {
			lobbySocket.send(JSON.stringify({ type: 'start_tournament' }));
		}
	}
};

export const addBot = (self, tournamentSocket, botName=undefined) => {
	let socket = getSocket();
	if (!socket) {
		socket = getSocketAI();
	}
	if (tournamentSocket != undefined) {
		socket = tournamentSocket;
	}

	if (!socket) {
        console.error('WebSocket is not initialized yet.');
        return;
    }

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'add_bot', address: window.location.host, botName: botName }));
	} else {
        console.error('WebSocket is not open.');
    }
}
