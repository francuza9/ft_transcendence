import {getCookie} from '/static/src/js/cookies.js';
import {handleRouting} from '/static/routers/router.js';
import { getSocket } from '/static/views/lobby.js';

function updateLobbyDetails(variables) {
	document.getElementById('lobbyTitle').innerText = variables.title;
	const mode = variables.isTournament ? 'Tournament' : 'Classic';
	document.getElementById('lobbyDetails').innerText = `Players: ${variables.players.length} / ${variables.maxPlayerCount} | Map: ${variables.map} | Mode: ${mode}`;
}

export function viewProfile(playerId) {
	console.log('Viewing profile of:', playerId);
}

export const refreshLobbyDetails = (variables) => {
	renderPlayerList(variables.players, variables.admin);
	updateLobbyDetails(variables);
}

function renderPlayerList(players, admin) {
    const playerListElement = document.getElementsByClassName('playerList')[0];
	playerListElement.innerHTML = '';

    players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.classList.add('player-row');
        row.setAttribute('data-player-id', `player${index + 1}`);

		if (player === admin) {
            row.classList.add('admin-row');
        }

        row.innerHTML = `
			<!-- 
            <td><img src="${player.profile_picture || 'https://via.placeholder.com/40'}" alt="${player}" class="player-img"></td>
            <td>${player.totalScore}</td>
			-->
            <td>${player}${player === admin ? '<span class="admin-badge">Room Admin</span>' : ''}</td>
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
