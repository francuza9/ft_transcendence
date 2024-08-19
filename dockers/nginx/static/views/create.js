import {replaceHTML} from '/static/src/js/utils.js';
import {setDefaultRoomName} from '/static/src/js/create.js';
import {resetVariables} from '/static/src/js/variables.js';

export async function Create() {
	await replaceHTML('/static/src/html/createRoom.html', false);
	setDefaultRoomName();
	resetVariables();
}
