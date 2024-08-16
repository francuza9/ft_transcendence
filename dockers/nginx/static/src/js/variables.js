import {updatePlayerCount, updateIsTournament} from '/static/src/js/create.js';
import {setLanguage} from '/static/src/js/lang.js';

export const variables = {
	isTournament: false,
    maxPlayerCount: 2,
	map: 'classic',
	roomName: '',
	nextPage: 'profile',
	admin: '',
};

export function updateVariable(document, variableName, value) {
	switch (variableName) {
		case 'maxPlayerCount':
			updatePlayerCount(document, value);
			break;
		case 'tournament':
			updateIsTournament(document, value);
			break;
		case 'lang':
			setLanguage(value);
			break;
		default:
			console.warn(`Unknown variable: ${variableName}`);
	}
}
