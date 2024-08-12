import {replaceHTML} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';
import {checkLoginStatus} from '/static/src/js/utils.js';
import {fetchLobbyInfo} from '/static/src/js/lobby.js';

export const updatePlayerCount = (document, value) => {
	variables.playerCount = parseInt(value, 10);
	const dropdownButton = document.getElementById('btnGroupDrop1');
	dropdownButton.textContent = `${variables.playerCount}`;
}

export const updateIsTournament = (document, value) => {
	variables.isTournament = value;
    const radioButtons = document.querySelectorAll('.btn-group .btn-check');
	const classicButton = radioButtons[0].nextElementSibling;
	const tournamentButton = radioButtons[1].nextElementSibling;

	if (value) {
		tournamentButton.classList.add('active');
		classicButton.classList.remove('active');
	} else {
		tournamentButton.classList.remove('active');
		classicButton.classList.add('active');
	}
}

export const editNameButton = () => {
    const displayMode = document.querySelector('.display-mode');
    const editForm = document.getElementById('edit-form');
    const titleInput = document.getElementById('title-input');

	displayMode.style.display = 'none';
	editForm.style.display = 'block';
	titleInput.focus();
}

export const saveNameEditButton = (event) => {
    const displayMode = document.querySelector('.display-mode');
    const editForm = document.getElementById('edit-form');
    const titleInput = document.getElementById('title-input');
    const displayTitle = document.getElementById('display-title');

	event.preventDefault();
	const newTitle = titleInput.value.trim();
	if (newTitle) {
		displayTitle.textContent = newTitle;
	}
	editForm.style.display = 'none';
	displayMode.style.display = 'flex';
}

export const cancelNameEditButton = () => {
    const displayMode = document.querySelector('.display-mode');
    const editForm = document.getElementById('edit-form');

	editForm.style.display = 'none';
	displayMode.style.display = 'flex';
}

export const playerCountDropdownButton = () => {
	var dropdown = new bootstrap.Dropdown(document.getElementById('btnGroupDrop1'));
	dropdown.toggle();
}

export const createRoomButton = () => {
	if (!variables.username)
	{
		checkLoginStatus().then(loggedIn => {
			if (!loggedIn) {
				variables.username = 'Guest';
			}
		}).catch(error => {
			console.error('Error checking login status:', error);
		});
	}

	console.log('creating Room: ');
	console.log('tournament: ', variables.isTournament);
	console.log('player count: ', variables.playerCount);
	console.log('map: ', variables.map);
	console.log('name: ', variables.roomName);
	fetch('/api/create_lobby/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include', // Include session cookie for authentication
		body: JSON.stringify({
			isTournament: variables.isTournament,
			playerCount: variables.playerCount,
			map: variables.map,
			roomName: variables.roomName
		})
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			console.log('Room created successfully:', data.join_code);
			history.pushState(null, '', `/${data.join_code}`);
			replaceHTML('/static/src/html/lobby.html', false).then(() => {
				// Initialize the lobby after the HTML has been replaced
				//initLobby();

				// Fetch the lobby info now that it has been created
				fetchLobbyInfo(data.join_code);
			});

		} else {
			console.error('Failed to create room:', data.message);
		}
	})
}
