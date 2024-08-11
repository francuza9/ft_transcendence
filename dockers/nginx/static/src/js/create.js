import {replaceHTML} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';
import {checkLoginStatus} from '/static/src/js/utils.js';

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
	fetch('/api/create_room/', {
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
			replaceHTML('/static/src/html/lobby.html', false);
		} else {
			console.error('Failed to create room:', data.message);
		}
	})
	replaceHTML('/static/src/html/lobby.html', false);
}
