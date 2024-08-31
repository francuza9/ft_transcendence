import {variables} from '/static/src/js/variables.js';
import {startLocal} from '/static/src/js/localgame/localgame.js';
import {replaceHTML} from '/static/src/js/utils.js';
import {cleanupBackground} from '/static/src/js/background/background.js';
import {addBot,startButton} from '/static/src/js/lobby.js';
import {checkLoginStatus, guestLogin} from '/static/src/js/utils.js';
import {initLobbySocket} from '/static/src/js/socket_handling/lobby_socket.js';

let socket;

export const isAI = (value) => {
    variables.isAI = value === "true";
	replaceHTML('/static/src/html/createLocal.html', false).then(() => {
		const difficultyDropdown = document.getElementById('difficulty')
		if (difficultyDropdown) {
			if (!variables.isAI)
				difficultyDropdown.classList.add('hidden');
		}
	});
}

export const startLocalButton = () => {
	const section = document.getElementsByTagName('section')[0];
	section.classList.add('hidden');
	cleanupBackground();

	const element = document.createElement('div');
	element.innerHTML = `
		<h1>${variables.isAI ? "Pong Against AI!" : "Pong Local Game!"}</h1>
		<script type="module" src="{% static 'src/js/${variables.isAI ? '3d.js' : 'localgame/localgame.js'}' %}"></script>
	`;
	variables.isAI ? play_with_ai() : startLocal(variables.pointsToWin);
};


export const setDifficulty = (difficulty) => {
	variables.AIDifficulty = difficulty;
	const dropdownButton = document.getElementById('btnGroupDrop1');
	dropdownButton.textContent = variables.AIDifficulty;
}

export const difficultyDropdown = () => {
	var dropdown = new bootstrap.Dropdown(document.getElementById('btnGroupDrop1'));
	dropdown.toggle();
}

async function play_with_ai() {
	if (!variables.username) {
		try {
			const loggedIn = await checkLoginStatus();
			if (!loggedIn) {
				await guestLogin();
			}
		} catch (error) {
			console.error('Error checking login status:', error); 
		}
	}

	try {
		const response = await fetch('/api/create_lobby/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
		});

		const data = await response.json();

		if (data.success) {
			variables.lobbyId = data.join_code;
			history.pushState(null, '', `/${data.join_code}`);
			variables.players = [variables.username];

			// Inline the logic from the Lobby function
			try {
				socket = await initLobbySocket(variables, true);
				if (socket) {
					addBot();
					startButton();
				} else {
					console.error('Failed to initialize socket.');
				}
			} catch (error) {
				console.error('Failed to initialize WebSocket:', error);
			}
		} else {
			console.error('Failed to create room:', data.message);	
		}
	} catch (error) {
		console.error('Error during lobby creation:', error);
	}
}

export function getSocketAI()
{
	return socket;
}
