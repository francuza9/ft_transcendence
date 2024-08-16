import {replaceHTML} from '/static/src/js/utils.js';
import {handleRouting} from '/static/routers/router.js';

export const loadRooms = () => {
	fetch('/api/lobbies/')
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				renderLobbies(data.lobbies);
			} else {
				alert('Failed to load lobbies.');
			}
		})
		.catch(error => {
			console.error('Error loading lobbies:', error);
			alert('An error occurred while loading the lobbies.');
		});
}

function renderLobbies(lobbies) {
	const lobbyListElement = document.getElementById('lobbyList');
	lobbyListElement.innerHTML = '';

	lobbies.forEach(lobby => {
		const row = document.createElement('tr');
		row.classList.add('lobby-row');
		row.dataset.joinCode = lobby.join_code;

		row.innerHTML = `
					<td>${lobby.lobby_name}</td>
					<td>${lobby.players.length} / ${lobby.max_player_count}</td>
					<td>${lobby.map_name}</td>
					<td>${lobby.is_tournament ? 'Tournament' : 'Classic'}</td>
					<td><button class="btn btn-primary btn-sm join-btn">Join</button></td>
				`;

		row.addEventListener('dblclick', () => joinLobby(lobby.join_code));
		row.querySelector('.join-btn').addEventListener('click', () => joinLobby(lobby.join_code));

		lobbyListElement.appendChild(row);
	});
}

function joinLobby(joinCode) {
	history.pushState(null, '', `/${joinCode}`);
	handleRouting();
}