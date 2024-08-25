import { getUsername } from '/static/src/js/utils.js';

let socket;

export function goActive() {
	const username = getUsername();
	socket = new WebSocket(`wss://${window.location.host}/ws/chat/?username=${encodeURIComponent(username)}`);

	socket.onopen = function(e) {
		console.log('Global WebSocket connection established 🟢');
	};

	socket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		if (data.type === 'online_status') {
			console.log(data.active_users);
		} else if (data.type === 'privmsg') {
			console.log(data.sender, ": ", data.message);
		} else if (data.type === 'friend_request') {
			console.log(data.sender, "wants to be your friend");
		} else if (data.type === 'friend_removal') {
			console.log(data.sender, "Removed you from their friends list");
		} else if (data.type === 'block') {
			console.log(data.sender, "Blocked you");
		} else if (data.type === 'unblock') {
			console.log(data.sender, "Unblocked you");
		} else if (data.type === 'game_invitation') {
			console.log(data.sender, "Invited you to a game, link: ", data.link);
		}
	};

	socket.onerror = function(e) {
		console.error('WebSocket error 🔴:', e);
	};

	socket.onclose = function(e) {
		console.log('WebSocket connection closed 🔴');
	};
}

export function getSocket() {
	return socket;
}
