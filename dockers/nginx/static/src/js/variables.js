import { updatePlayerCount, updateIsTournament } from '/static/src/js/create.js';

export const variables = {
	isTournament: false,
    playerCount: 2,
	map: 'classic',
	roomName: '',
	pageHistory: [],
	nextPage: 'profile',
	selectedRoom: '',
};

export function updateVariable(document, variableName, value) {
	switch (variableName) {
		case 'playerCount':
			updatePlayerCount(document, value);
			break;
		case 'tournament':
			updateIsTournament(document, value);
			break;
		default:
			console.warn(`Unknown variable: ${variableName}`);
	}
}