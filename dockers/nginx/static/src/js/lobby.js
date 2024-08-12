import { variables } from '/static/src/js/variables.js';

function updateLobbyDetails(document, title, Players, map, mode) {
	console.log('title: ', title);
	document.getElementById('lobbyTitle').innerText = title;
	document.getElementById('lobbyDetails').innerText = `Players: ${Players} | Map: ${map} | Mode: ${mode}`;
}

export function viewProfile(playerId) {
	console.log('Viewing profile of:', playerId);
}

export function initLobby() {
	console.log('Initializing lobby...');
	fetchLobbyInfo();
	//hide start button if user is not admin

	//show loading screen
	//connect to websocket
}

export async function fetchLobbyInfo() {
	const currentUrl = new URL(window.location.href);
	const lobbyId = currentUrl.pathname.split('/')[1];

	console.log('Lobby ID:', lobbyId);
    try {
        const response = await fetch(`/api/lobby/${lobbyId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

		
        const result = await response.json();

        if (result.success) {
            const lobbyInfo = result.lobby_info;
			console.log('Lobby Info: ', lobbyInfo);
            updateLobbyDetails(document, lobbyInfo.lobby_name, `${lobbyInfo.players.length} / ${lobbyInfo.player_count}`, lobbyInfo.map_name, lobbyInfo.mode);
            renderPlayerList(lobbyInfo.players);
            console.log('admin: ', lobbyInfo.admin);
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error fetching lobby info:', error);
        alert('An error occurred while fetching lobby information.');
    }
}

function renderPlayerList(players) {
    const playerListElement = document.getElementById('playerList');
    playerListElement.innerHTML = '';

    players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.classList.add('player-row');
        row.setAttribute('data-player-id', `player${index + 1}`);

        row.innerHTML = `
            <td><img src="${player.profile_picture || 'https://via.placeholder.com/40'}" alt="${player.username}" class="player-img"></td>
            <td>${player.username}</td>
            <td>${player.level}</td>
        `;

        playerListElement.appendChild(row);
    });
}

export const startButton = () => {
	console.log('starting game...');
	//start game
}
