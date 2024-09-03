import { getUsername } from '/static/src/js/utils.js';
import { variables } from '/static/src/js/variables.js';
import { loadFriends } from '/static/src/js/chat.js';

let socket;

const SUCCESS = 0
const YOURE_USER = 1
const USER_DOESNT_EXIST = 2
const ALREADY_FRIENDS = 3
const ALREADY_SENT = 4
const ALREADY_RECEIVED = 5
const BLOCKED = 6
const BLOCKED_YOU = 7

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
			const paragraph = document.createElement("p");

			paragraph.innerText = data.message;
			messageItem.className = "message-item recipient";
			messageItem.appendChild(paragraph);
			chatWindow.appendChild(messageItem);
			chatWindow.scrollTop = chatWindow.scrollHeight;
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
		} else if (data.type === 'friend_request_sent') {
			const usernameInput = document.getElementById('add-friend-input');
			const successMessage = document.getElementById('request-success');
			const failMessage1 = document.getElementById('request-fail1');
			const failMessage2 = document.getElementById('request-fail2');
			const failMessage3 = document.getElementById('request-fail3');
			const failMessage4 = document.getElementById('request-fail4');
			const failMessage5 = document.getElementById('request-fail5');
			const failMessage6 = document.getElementById('request-fail6');

			switch(data.content) {
				case SUCCESS:
					successMessage.classList.remove('hidden');
					usernameInput.value = '';
					break;
				case YOURE_USER:
					failMessage1.classList.remove('hidden');
					break;
				case USER_DOESNT_EXIST:
					failMessage2.classList.remove('hidden');
					break;
				case ALREADY_FRIENDS:
					failMessage3.classList.remove('hidden');
					break;
				case ALREADY_SENT:
					failMessage4.classList.remove('hidden');
					break;
				case ALREADY_RECEIVED:
					failMessage4.classList.remove('hidden');
					break;
				case BLOCKED:
					failMessage5.classList.remove('hidden');
					break;
				case BLOCKED_YOU:
					failMessage6.classList.remove('hidden');
					break;
			}
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
