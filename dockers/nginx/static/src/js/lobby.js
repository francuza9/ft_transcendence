import {cleanupBackground} from '/static/src/js/background/background.js';
import {handleRouting} from '/static/routers/router.js';
import {getSocket} from '/static/views/lobby.js';
import {replaceHTML} from '/static/src/js/utils.js';
import {checkLoginStatus} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';
import {getSocketAI} from '/static/src/js/local.js';

function updateLobbyDetails(variables) {
	if (variables.roomName)
		document.getElementById('lobbyTitle').innerText = variables.roomName;
	const mode = variables.isTournament ? 'Tournament' : 'Classic';
	document.getElementById('lobbyDetails').innerText = `Players: ${variables.players.length} / ${variables.maxPlayerCount} | Map: ${variables.map} | Wining Score: ${variables.pointsToWin} | Mode: ${mode}`;
}

export const refreshLobbyDetails = (variables) => {
	renderPlayerList(variables);
	updateLobbyDetails(variables);
	if (variables.username === variables.admin) {
		showAdminButtons();

	}
}

export const showAdminButtons = () => {
	const startButton = document.getElementById('start');
	const botButton = document.getElementById('bot');

	startButton.classList.remove('hidden');
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

let tournament_socket;

export const startButton = (self) => {
	if (!variables.isTournament) {
		let socket = getSocket();
		if (!socket) {
			socket = getSocketAI();
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
		// let tournament_socket = ; TODO: WORK HERE
	}
};

export const addBot = (self) => {
	let socket = getSocket();
	if (!socket) {
		socket = getSocketAI();
	}

	if (!socket) {
        console.error('WebSocket is not initialized yet.');
        return;
    }

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'add_bot', address: window.location.host }));
    } else {
        console.error('WebSocket is not open.');
    }
}