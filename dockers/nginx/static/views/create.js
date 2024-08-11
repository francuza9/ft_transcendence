import { replaceHTML } from '/static/src/js/utils.js';

export async function Create() {
	replaceHTML('/static/src/html/createRoom.html', false);
}
