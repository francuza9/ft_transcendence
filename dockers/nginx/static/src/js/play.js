import { replaceHTML } from '/static/src/js/utils.js';
import { variables } from '/static/src/js/variables.js';
import { handleRouting } from '/static/routers/router.js';
import { checkLoginStatus } from '/static/src/js/utils.js';

export const playButton = () => {
	replaceHTML('/static/src/html/play.html', false);
    variables.pageHistory.push('index');
}

export const backButton = () => {
    if (variables.pageHistory.length > 0) {
        const lastPage = variables.pageHistory.pop();
        replaceHTML(`/static/src/html/${lastPage}.html`, false);
    } else {
        console.warn("No more pages in history to go back to.");
    }
}

export const cancelButton = () => {
	history.pushState(null, '', '/');
	replaceHTML('/static/src/html/room.html', false);
}

export const localButton = () => {
	replaceHTML('/static/src/html/local.html', false);
    variables.pageHistory.push('play');
}

export const onlineButton = () => {
	checkLoginStatus().then(loggedIn => {
		variables.pageHistory.push('play');
		if (loggedIn) {
			replaceHTML('/static/src/html/room.html', false);
		} else {
			replaceHTML('/static/src/html/online.html', false);
		}
	}).catch(error => {
		console.error('Error checking login status:', error);
		replaceHTML('/static/src/html/online.html', false);
	});
}

export const skipLoginButton = () => {
	replaceHTML('/static/src/html/room.html', false);
    variables.pageHistory.push('online');
}

export const goToLoginButton = () => {
    variables.pageHistory.push('online');
	variables.nextPage = 'room';
	history.pushState(null, '', '/login');
	handleRouting();
}

export const joinButton = () => {
	replaceHTML('/static/src/html/joinRoom.html', false);
    variables.pageHistory.push('room');
}

export const playerCountDropdownButton = () => {
	var dropdown = new bootstrap.Dropdown(document.getElementById('btnGroupDrop1'));
	dropdown.toggle();
}

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

export const joinRoomButton = () => {
	console.log('joining Room: ');
	//console.log('id: ', roomId);
}

export const createRoomButton = () => {
	console.log('creating Room: ');
	console.log('tournament: ', variables.isTournament);
	console.log('player count: ', variables.playerCount);
	console.log('map: ', variables.map);
	console.log('admin: ', )
	console.log('name: ', )
	replaceHTML('/static/src/html/lobby.html', false);
}
