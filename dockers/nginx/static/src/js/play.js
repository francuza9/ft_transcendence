import { replaceHTML } from '/static/src/js/utils.js';

export const playButton = () => {
	replaceHTML('/static/src/html/play.html', false);
}

export const createRoomButton = () => {
	replaceHTML('/static/src/html/createRoom.html', false);
}

export const joinRoomButton = () => {
	replaceHTML('/static/src/html/joinRoom.html', false);
}
