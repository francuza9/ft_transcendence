import { getCookie } from '/static/src/js/cookies.js';
import { getSocket } from '/static/src/js/socket_handling/global_socket.js';

let chatInputListener = null;

export const openChat = () => {
	const chatWindow = document.getElementById("chat-window");
	const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");

	chatWindow.classList.remove("hidden");
	loadFriends();

	if (!chatInputListener) {
		chatInputListener = function(event) {
			if (event.key === "Enter") {
				sendBtn.click();
			}
		};
		console.log('chat event listener added');
	}

    chatInput.addEventListener("keypress", chatInputListener);
};

export const closeChat = () => {
	const chatWindow = document.getElementById("chat-window");
    const chatInput = document.getElementById("chat-input");
	chatWindow.classList.add("hidden");

    if (chatInputListener) {
		console.log('chat event listener removed');
        chatInput.removeEventListener("keypress", chatInputListener);
    }
};

const loadFriends = () => {
	const friendList = document.getElementById("friend-list");

	fetch('/api/friends/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken')
		}
	})
	.then(response => response.json())
	.then(data => {
		friendList.innerHTML = '';
		data.friends.forEach(friend => {
			const friendItem = document.createElement("div");
			friendItem.className = "friend-item";
			friendItem.innerHTML = `
				<img src="${friend.avatar}" alt="${friend.name}" width="40" height="40" class="rounded-circle">
				<span>${friend.name}</span>
			`;
			friendList.appendChild(friendItem);
		});
	})
	.catch(error => {
		console.error("Error loading friends:", error);
	});
};

export const sendMessage = () => {
	const chatInput = document.getElementById("chat-input");
	const message = chatInput.value.trim();
	const targetUser = 'b';
	const socket = getSocket();

	// before / after sending the message also display the message on the screen (only for the sender)

	if (message) {
		socket.send(JSON.stringify({
			'type': 'privmsg',
			'target': targetUser,
			'message': message
		}));
		chatInput.value = '';
	}
	else
		console.log('tried to send empty message');
};
