import { getUsername } from '/static/src/js/utils.js';

export function goActive() {
	const username = getUsername();
	const socket = new WebSocket(`wss://${window.location.host}/ws/chat/?username=${encodeURIComponent(username)}`);

	socket.onopen = function(e) {
		console.log('Global WebSocket connection established 🟢');
		socket.send(JSON.stringify({
			'message': `Hello, server! ${username} has connected.`
		}));
	};

	socket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		if (data.type === 'online_status') {
			console.log(data.active_users);
		}
	};

	socket.onerror = function(e) {
		console.error('WebSocket error 🔴:', e);
	};

	socket.onclose = function(e) {
		console.log('WebSocket connection closed 🔴');
	};

	function sendMessage(message) {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				'message': message
			}));
		} else {
			console.error('WebSocket is not open');
		}
	}
}
