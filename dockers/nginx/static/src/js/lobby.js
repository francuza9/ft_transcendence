import { variables } from '/static/src/js/variables.js';

function updateLobbyDetails(document, title, Players, map, mode) {
	document.getElementById('lobbyTitle').innerText = title;
	document.getElementById('lobbyDetails').innerText = `Players: ${Players} | Map: ${map} | Mode: ${mode}`;
}

export function viewProfile(playerId) {
	console.log('Viewing profile of:', playerId);
}

export function initLobby() {
	console.log('script initialized');
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
		
		console.log('waiting');
        const result = await response.json();
		console.log('done waiting');

        if (result.success) {
            const lobbyInfo = result.lobby_info;

			updateLobbyDetails(document, lobbyInfo.lobby_name, `${lobbyInfo.players.length} / ${lobbyInfo.player_count}` , lobbyInfo.map_name, lobbyInfo.mode);
            //document.getElementById('admin').innerText = lobbyInfo.admin;
			console.log('admin: ', lobbyInfo.admin);

            // Todo: Render the list of players
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error fetching lobby info:', error);
        alert('An error occurred while fetching lobby information.');
    }
}
