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
