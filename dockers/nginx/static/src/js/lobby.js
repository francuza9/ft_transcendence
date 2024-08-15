import {getCookie} from '/static/src/js/cookies.js';
import {handleRouting} from '/static/routers/router.js';

function updateLobbyDetails(document, title, Players, map, mode) {
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

export function initLobby() {
	//show loading transition screen
	fetchLobbyInfo();
	//connect to websocket
}

export async function fetchLobbyInfo() {
	const currentUrl = new URL(window.location.href);
	const lobbyId = currentUrl.pathname.split('/')[1];

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
            updateLobbyDetails(document, lobbyInfo.lobby_name, `${lobbyInfo.players.length} / ${lobbyInfo.player_count}`, lobbyInfo.map_name, lobbyInfo.is_tournament);
            renderPlayerList(lobbyInfo.players, lobbyInfo.admin);

			const currentUser = result.current_user;
			const startButton = document.querySelector('button[data-action="start"]');
			//console.log(currentUser, ' === ', lobbyInfo.admin, currentUser === lobbyInfo.admin);
			if (currentUser !== lobbyInfo.admin) {
				startButton.style.display = 'none';
			}
        } else {
			history.pushState(null, '', '/join');
			handleRouting();
            alert(result.message);
        }
    } catch (error) {
        console.error('Error fetching lobby info:', error);
        alert('An error occurred while fetching lobby information.');
    }
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
    const csrftoken = getCookie('csrftoken');
	const currentUrl = new URL(window.location.href);
	const lobbyId = currentUrl.pathname.split('/')[1];

	fetch(`/api/lobby/leave/${lobbyId}/`, {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken,
		}
	})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				history.pushState(null, '', '/join');
				handleRouting();
			} else {
				console.error('Error leaving the lobby: ' + data.message);
			}
		});
}

export const startButton = () => {
	console.log('starting game...');
	//start game
}
