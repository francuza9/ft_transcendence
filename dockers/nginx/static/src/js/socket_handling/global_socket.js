import { getUsername } from '/static/src/js/utils.js';
import { variables } from '/static/src/js/variables.js';
import { loadFriends } from '/static/src/js/chat.js';

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
			variables.activeUsers = data.active_users;
			loadFriends();
		} else if (data.type === 'privmsg') {
			const chatWindow = document.getElementById("messages");
			const messageItem = document.createElement("div");

			messageItem.className = "message-item";
			messageItem.innerHTML = `<strong>${data.sender}:</strong> ${data.message}`;
			chatWindow.appendChild(messageItem);
			chatWindow.scrollTop = chatWindow.scrollHeight;
			console.log(chatWindow);
			console.log(`${data.sender}, ${data.message}`);
		} else if (data.type === 'friend_request') {
			console.log(data.sender, "wants to be your friend");
		} else if (data.type === 'friend_removal') {
			console.log(data.sender, "Removed you from their friends list");
		} else if (data.type === 'block') {
			console.log(data.sender, "Blocked you");
		} else if (data.type === 'unblock') {
			console.log(data.sender, "Unblocked you");
		} else if (data.type === 'game_invitation') {
			const url = data.link;
			console.log(data.sender, "Invited you to a game, link: ", url);
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
