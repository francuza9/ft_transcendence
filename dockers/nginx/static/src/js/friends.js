import { getSocket } from '/static/src/js/socket_handling/global_socket.js';

export function addFriend(player) {
	const socket = getSocket();

	console.log('adding friend', player);

	socket.send(JSON.stringify({type: 'friend_request', target: player}));
}

export function unfriendUser(player) {
	console.log('unfriending', player);
}

export function blockUser(player) {
	console.log('blocking', player);
}
