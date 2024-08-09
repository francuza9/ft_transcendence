import { replaceHTML } from '/static/src/js/utils.js';
import { variables } from '/static/src/js/variables.js';

export const playButton = () => {
	replaceHTML('/static/src/html/play.html', false);
}

export const createButton = () => {
	replaceHTML('/static/src/html/createRoom.html', false);
}

export const joinButton = () => {
	replaceHTML('/static/src/html/joinRoom.html', false);
}

export const playerCountDropdownButton = () => {
	var dropdown = new bootstrap.Dropdown(document.getElementById('btnGroupDrop1'));
	dropdown.toggle();
}

export const updatePlayerCount = (document, value) => {
	variables.playerCount = parseInt(value, 10);
	const dropdownButton = document.getElementById('btnGroupDrop1');
	dropdownButton.textContent = `Players: ${variables.playerCount}`;
}

export const joinRoomButton = () => {
	console.log('joining Room: ');
	//console.log('id: ', roomId);
}

export const createRoomButton = () => {
	console.log('creating Room: ');
	console.log('player count: ', variables.playerCount);
}

