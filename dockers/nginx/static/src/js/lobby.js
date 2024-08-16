import {getCookie} from '/static/src/js/cookies.js';
import {handleRouting} from '/static/routers/router.js';
import { getSocket } from '/static/views/lobby.js';

function updateLobbyDetails(title, players, maxPlayerCount, map, mode) {
	document.getElementById('lobbyTitle').innerText = title;
	if (mode)
		mode = 'Tournament';
	else
		mode = 'Classic';
	document.getElementById('lobbyDetails').innerText = `Players: ${Players} | Map: ${map} | Mode: ${mode}`;
}

export function viewProfile(playerId) {
	console.log('Viewing profile of:', playerId);
}

export const refreshLobbyDetails = (title, players, maxPlayerCount, map, mode) => {
	renderPlayerList(title, `${players.length} / maxPlayerCount`, map, mode);
	updateLobbyDetails(title, );
}

function renderPlayerList(players, admin) {
    const playerListElement = document.getElementById('playerList');
    playerListElement.innerHTML = '';

    players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.classList.add('player-row');
        row.setAttribute('data-player-id', `player${index + 1}`);

		if (player.username === admin) {
            row.classList.add('admin-row');
        }

        row.innerHTML = `
            <td><img src="${player.profile_picture || 'https://via.placeholder.com/40'}" alt="${player.username}" class="player-img"></td>
            <td>${player.username}${player.username === admin ? '<span class="admin-badge">Room Admin</span>' : ''}</td>
            <td>${player.totalScore}</td>
        `;

        playerListElement.appendChild(row);
    });
}

export const leaveRoom = () => {

}

export const startButton = () => {
    const socket = getSocket();  // Get the most recent socket value

    if (!socket) {
        console.error('WebSocket is not initialized yet.');
        return;
    }

    if (socket.readyState === WebSocket.OPEN) {
        console.log('starting game...');
        socket.send(JSON.stringify({ type: 'start' }));
    } else {
        console.error('WebSocket is not open.');
    }
};
