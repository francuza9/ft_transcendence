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
	fetchLobbyInfo(variables.lobbyId);
	//show loading screen
	//connect to websocket
}

export async function fetchLobbyInfo(lobbyId) {
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

            // Render the list of players
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
    // Get the tbody element for the player list
    const playerListElement = document.getElementById('playerList');
    playerListElement.innerHTML = ''; // Clear any existing rows

    // Iterate over the players and create a table row for each
    players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.classList.add('player-row');
        row.setAttribute('data-player-id', `player${index + 1}`);

        // Assuming the player object has properties `profile_picture`, `username`, and `level`
        row.innerHTML = `
            <td><img src="${player.profile_picture || 'https://via.placeholder.com/40'}" alt="${player.username}" class="player-img"></td>
            <td>${player.username}</td>
            <td>${player.level}</td>
        `;

        // Append the row to the player list
        playerListElement.appendChild(row);
    });
}