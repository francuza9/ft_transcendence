import { replaceHTML } from '/static/src/js/utils.js';
import { setDefaultRoomName } from '/static/src/js/create.js';

export async function Create() {
	await replaceHTML('/static/src/html/createRoom.html', false);
	setDefaultRoomName();
}
