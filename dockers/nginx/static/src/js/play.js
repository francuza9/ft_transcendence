import { replaceHTML } from '/static/src/js/utils.js';
import { variables } from '/static/src/js/variables.js';
import { handleRouting } from '/static/routers/router.js';

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


export const localButton = () => {
	replaceHTML('/static/src/html/local.html', false);
    variables.pageHistory.push('play');
}

export const onlineButton = () => {
	replaceHTML('/static/src/html/online.html', false);
    variables.pageHistory.push('play');
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

export const createButton = () => {
    variables.pageHistory.push('room');
	replaceHTML('/static/src/html/createRoom.html', false);
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

export const joinRoomButton = () => {
	console.log('joining Room: ');
	//console.log('id: ', roomId);
}

export const createRoomButton = () => {
	console.log('creating Room: ');
	console.log('player count: ', variables.playerCount);
}
