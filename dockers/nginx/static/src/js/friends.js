import {getSocket} from '/static/src/js/socket_handling/global_socket.js';
import {loadFriendsModal} from '/static/src/js/chat.js';

export function addFriend(player) {
	const socket = getSocket();

	console.log('adding friend', player);
	setTimeout(() => {
		socket.send(JSON.stringify({type: 'friend_request', target: player}));
	}, 150);
}

export function unfriendUser(player) {
	const socket = getSocket();

	console.log('unfriending', player);
	socket.send(JSON.stringify({type: 'friend_removal', target: player}));
	setTimeout(() => {
		loadFriendsModal();
	}, 150);
}

export function blockUser(player) {
	const socket = getSocket();

	console.log('blocking', player);
	socket.send(JSON.stringify({type: 'block', target: player}));
	setTimeout(() => {
		loadFriendsModal();
	}, 150);
}

export function unblockUser(player) {
	const socket = getSocket();

	console.log('unblocking', player);
	socket.send(JSON.stringify({type: 'unblock', target: player}));
	setTimeout(() => {
		loadFriendsModal();
	}, 150);
}

export function acceptFriendRequest(player) {
	const socket = getSocket();

	console.log('accepting friend request from', player);
	socket.send(JSON.stringify({type: 'friend_accept', target: player}));
	setTimeout(() => {
		loadFriendsModal();
	}, 150);
}

export function declineFriendRequest(player) {
	const socket = getSocket();

	console.log('declining friend request from', player);
	socket.send(JSON.stringify({type: 'friend_decline', target: player}));
	setTimeout(() => {
		loadFriendsModal();
	}, 150);
}

export function unsendFriendRequest(player) {
	const socket = getSocket();

	console.log('unsending friend request from', player);
	socket.send(JSON.stringify({type: 'friend_unsend', target: player}));
	setTimeout(() => {
		loadFriendsModal();
	}, 150);
}
