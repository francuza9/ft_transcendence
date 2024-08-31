import {getCookie} from '/static/src/js/cookies.js';
import {getSocket} from '/static/src/js/socket_handling/global_socket.js';
import {checkLoginStatus} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';

let chatInputListener = null;
let currentFriend = null;

export async function initChat() {
	const body = document.getElementsByTagName('body')[0];
	const response = await fetch('/static/src/html/chat.html');
	if (!response.ok) throw new Error('Network response was not ok');
	const htmlContent = await response.text();
	body.insertAdjacentHTML('afterbegin', htmlContent);
}

export const openChat = () => {
    const chatWindow = document.getElementById("chat-window");
    const chatInput = document.getElementById("chat-input");
	const chatBtn = document.getElementById("chat-btn");
    const sendBtn = document.getElementById("send-btn");
    const friendList = document.getElementById("friend-list");
    
    chatWindow.classList.remove("hidden");
	chatBtn.classList.add("hidden");

	if (!checkLoginStatus()) {
		friendList.innerHTML = '';
		const noFriendsMessage = document.createElement("div");
		noFriendsMessage.className = "no-friends-message";
		noFriendsMessage.innerText = "Login to chat with friends";
		friendList.appendChild(noFriendsMessage);
	} else
		loadFriends();

    if (!chatInputListener) {
        chatInputListener = function(event) {
            if (event.key === "Enter") {
                sendBtn.click();
            }
        };
    }

    chatInput.addEventListener("keypress", chatInputListener);
};

export const closeChat = () => {
    const chatWindow = document.getElementById("chat-window");
    const chatInput = document.getElementById("chat-input");
	const chatBtn = document.getElementById("chat-btn");

    chatWindow.classList.add("hidden");
	chatBtn.classList.remove("hidden");

    if (chatInputListener) {
        chatInput.removeEventListener("keypress", chatInputListener);
    }
};

export const backToFriends = () => {
    const chatArea = document.getElementById("chat-area");
    const friendList = document.getElementById("friend-list");
    const chatTitle = document.getElementById("chat-title");
    const backBtn = document.getElementById("back-btn");
	const settingsBtn = document.getElementById("manage-friends-btn");

	chatArea.classList.add("hidden");
    friendList.classList.remove("hidden");
	settingsBtn.classList.remove("hidden");

    chatTitle.classList.add("hidden");
    chatTitle.style.display = "none";

    backBtn.classList.add("hidden");
    backBtn.classList.remove("show");
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
		if (data.friends.length === 0) {
			const noFriendsMessage = document.createElement("div");
			noFriendsMessage.className = "no-friends-message";
			noFriendsMessage.innerText = "Add friends to chat with them";
			friendList.appendChild(noFriendsMessage);
		} else {
			data.friends.forEach(friend => {
				const friendItem = document.createElement("div");
				friendItem.className = "friend-item";
				friendItem.dataset.username = friend.username;
				friendItem.innerHTML = `
					<div class="avatar-container">
						<img src="${friend.avatar}" alt="${friend.name}" width="40" height="40" class="rounded-circle">
						<span class="status-indicator"></span>
					</div>
					<span class="friend-name">${friend.name}</span>
				`;
				friendItem.addEventListener('click', () => openChatWithFriend(friend));
				friendList.appendChild(friendItem);
				updateFriendStatus(friend.username);
			});
		}
	})
	.catch(error => {
		console.error("Error loading friends:", error);
	});
};

export const openChatWithFriend = (friend) => {
	const chatWindow = document.getElementById("chat-window");
	const chatArea = document.getElementById("chat-area");
    const friendList = document.getElementById("friend-list");
    const chatTitle = document.getElementById("chat-title");
    const chatName = document.getElementById("chat-name");
    const chatAvatar = document.getElementById("chat-avatar");
    const backBtn = document.getElementById("back-btn");
	const settingsBtn = document.getElementById("manage-friends-btn");

    friendList.classList.add("hidden");
    chatArea.classList.remove("hidden");
	settingsBtn.classList.add("hidden");

    chatTitle.classList.remove("hidden");
	chatTitle.dataset.username = friend.username;
    chatTitle.style.display = "flex";

    backBtn.classList.remove("hidden");
    backBtn.classList.add("show");

    chatName.textContent = friend.name || "Unknown User";
    chatAvatar.src = friend.avatar;

    loadChatMessages(friend.username);
	currentFriend = friend.username;
	updateFriendStatus(friend.username);
};

const loadChatMessages = (friendUsername) => {
    const chatWindow = document.getElementById("messages");
	chatWindow.innerHTML = '';

    fetch(`/api/messages/${friendUsername}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            data.messages.forEach(message => {
                const messageItem = document.createElement("div");
                const messageClass = message.sender === variables.username ? 'sender' : 'recipient';
                messageItem.className = `message-item ${messageClass}`;
                messageItem.innerHTML = message.content;
                chatWindow.appendChild(messageItem);
				chatWindow.scrollTop = chatWindow.scrollHeight;
            });
        } else {
            chatWindow.innerHTML = `<div class="error-message">${data.error}</div>`;
        }
    })
    .catch(error => {
        console.error("Error loading chat messages:", error);
        chatWindow.innerHTML = `<div class="error-message">Failed to load messages. Please try again later.</div>`;
    });
};

export const sendMessage = () => {
    const chatInput = document.getElementById("chat-input");
    const message = chatInput.value.trim();
    const socket = getSocket();
	const chatWindow = document.getElementById("messages");
	const messageItem = document.createElement("div");

    if (message) {
		messageItem.className = "message-item sender";
		messageItem.innerHTML = message;
		chatWindow.appendChild(messageItem);
		chatWindow.scrollTop = chatWindow.scrollHeight;

        socket.send(JSON.stringify({
            'type': 'privmsg',
            'target': currentFriend,
            'message': message
        }));
        chatInput.value = '';
	}
};

export const sendInvitation = () => {
    const socket = getSocket();
    const targetUser = 'b'; // You need to set the target user dynamically
    const lobbyURL = window.location.href;

    console.log('Sending invitation');
	socket.send(JSON.stringify({type: 'game_invitation', target: targetUser, lobby: lobbyURL}));
}

function updateFriendStatus(username) {
    const friendItem = document.querySelector(`.friend-item[data-username="${username}"]`);

	const isOnline = true; //update logic
    if (friendItem) {
        const statusIndicator = friendItem.querySelector('.status-indicator');
        if (isOnline) {
            statusIndicator.classList.add('online');
        } else {
            statusIndicator.classList.remove('online');
        }
    }

	const chatTitle = document.getElementById('chat-title');
    if (chatTitle && chatTitle.dataset.username === username) {
        const chatStatusIndicator = chatTitle.querySelector('#status-indicator');
        if (isOnline) {
            chatStatusIndicator.classList.add('online');
        } else {
            chatStatusIndicator.classList.remove('online');
        }
    }
}
