import {updatePlayerCount, updatePointsToWin, updateIsTournament} from '/static/src/js/create.js';
import {setLanguage} from '/static/src/js/lang.js';
import {editField, saveField} from '/static/src/js/account.js';
import {addFriend, unfriendUser, blockUser} from '/static/src/js/friends.js';

export const variables = {
	isTournament: false,
	pointsToWin: 3,
    maxPlayerCount: 2,
	map: 'Classic',
	roomName: '',
	nextPage: 'profile',
	previousPage: '/',
	admin: '',
	players: [],
};

export const resetVariables = () => {
	variables.isTournament = false;
    variables.pointsToWin = 3;
    variables.maxPlayerCount = 2;
    variables.map = 'classic';
    variables.roomName = '';
    variables.admin = '';
    variables.players = [];
}

export function updateVariable(document, variableName, value) {
	switch (variableName) {
		case 'playerCount':
			updatePlayerCount(document, value);
			break;
		case 'pointsToWin':
			updatePointsToWin(document, value);
			break;
		case 'tournament':
			updateIsTournament(document, value);
			break;
		case 'lang':
			setLanguage(value);
			break;
		case 'editField':
			editField(value);
			break;
		case 'saveField':
			saveField(value);
			break;
		case 'addFriend':
			addFriend(value);
			break;
		case 'unfriendUser':
			unfriendUser(value);
			break;
		case 'chatWithUser':
			chatWithUser(value);
			break;
		case 'blockUser':
			blockUser(value);
			break;
		default:
			console.warn(`Unknown variable: ${variableName}`);
	}
}
