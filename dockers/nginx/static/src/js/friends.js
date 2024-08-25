import { getSocket } from '/static/src/js/socket_handling/global_socket.js';

export function addFriend(player) {
	const socket = getSocket();

	console.log('adding friend', player);

	socket.send(JSON.stringify({type: 'friend_request', target: player}));
}

export function unfriendUser(player) {
	const socket = getSocket();

	console.log('unfriending', player);

	socket.send(JSON.stringify({type: 'friend_removal', target: player}));
}

export function blockUser(player) {
	const socket = getSocket();

	console.log('blocking', player);

	socket.send(JSON.stringify({type: 'block', target: player}));
}

export function unblockUser(player) {
	const socket = getSocket();

	console.log('unblocking', player);

	socket.send(JSON.stringify({type: 'unblock', target: player}));
}
