import { updatePlayerCount } from '/static/src/js/play.js';

export const variables = {
    playerCount: 2,
	pageHistory: [],
	nextPage: 'profile'
};

export function updateVariable(document, variableName, value) {
	switch (variableName) {
		case 'playerCount':
			updatePlayerCount(document, value);
			break;
		default:
			console.warn(`Unknown variable: ${variableName}`);
	}
}
