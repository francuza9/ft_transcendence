import {replaceHTML} from '/static/src/js/utils.js';
import {loadRooms} from '/static/src/js/join.js';

export async function Join() {
	replaceHTML('/static/src/html/joinRoom.html', false);
	loadRooms();
}
