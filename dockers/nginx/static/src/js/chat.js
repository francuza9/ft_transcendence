import {getCookie} from '/static/src/js/cookies.js';
import {getSocket} from '/static/src/js/socket_handling/global_socket.js';
import {isGuest, ensureUsername} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';
import {getTranslation} from '/static/src/js/lang.js';

let chatInputListener = null;
let currentFriend = null;

export async function initChat() {
	const section = document.getElementsByTagName('section')[0];
	const chatDiv = document.createElement("div");
	const response = await fetch('/static/src/html/chat.html');
	if (!response.ok) throw new Error('Network response was not ok');
	chatDiv.innerHTML = await response.text();
	chatDiv.id = "chat";
	section.appendChild(chatDiv);
}

export const openChat = () => {
    const chatWindow = document.getElementById("chat-window");
    const chatInput = document.getElementById("chat-input");
	const chatBtn = document.getElementById("chat-btn");
    const sendBtn = document.getElementById("send-btn");
    const friendList = document.getElementById("friend-list");
    
    chatWindow.classList.remove("hidden");
	chatBtn.classList.add("hidden");

	ensureUsername().then(() => {
		if (isGuest(variables.username) || !variables.username) {
			friendList.innerHTML = '';
			const noFriendsMessage = document.createElement("div");
			noFriendsMessage.className = "error-message";
			noFriendsMessage.innerText = getTranslation('chat.loginMessage');
			noFriendsMessage.dataset.text = "chat.loginMessage";
			friendList.appendChild(noFriendsMessage);
		} else
			loadFriends();
	});

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

export const loadFriends = () => {
	fetch('/api/friends/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken')
		}
	})
	.then(response => response.json())
	.then(data => {
		const friendList = document.getElementById("friend-list");

		friendList.innerHTML = '';
		if (data.friends.length === 0) {
			const noFriendsMessage = document.createElement("div");
			noFriendsMessage.className = "error-message";
			noFriendsMessage.innerText = getTranslation('chat.noFriends');
			noFriendsMessage.dataset.text = "chat.noFriends";
			friendList.appendChild(noFriendsMessage);
		} else {
			ensureUsername().then(() => {
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
        chatWindow.innerHTML = `<div class="error-message" data-text="chat.fail">Failed to load messages. Please try again later.</div>`;
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

	const isOnline = variables.activeUsers[username];

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

export const switchTab = (value) => {
	document.querySelectorAll('.tab-pane').forEach(tabPane => {
		tabPane.classList.remove('show', 'active');
	});

	const selectedTab = document.querySelector(`#tab-pane-${value}`);
	if (selectedTab) {
		selectedTab.classList.add('show', 'active');
	}
}


export const loadFriendsModal = (value) => {
	const usernameInput = document.getElementById('add-friend-input');
    usernameInput.placeholder = getTranslation('friends.addInputFieldPlaceholder');

	loadFriendsTab();
	//load friend requests into friend requests tab
	//load blocked users in blocked users tab
}

export const sendFriendRequest = () => {
	const usernameInput = document.getElementById('add-friend-input');
	const username = usernameInput.value;
	const successMessage = document.getElementById('add-request-success');
	const failMessage = document.getElementById('add-request-fail');
	//send friend request
	if (success) {
		successMessage.classList.remove('hidden');
		usernameInput.value = '';
	} else {
		failMessage.classList.remove('hidden');
	}
}

const loadFriendsTab = () => {
    fetch('/api/friends/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        const friendsList = document.getElementById("friends-list");

        friendsList.innerHTML = '';
        if (data.friends.length === 0) {
			const noFriendsMessage = document.getElementById('noFriendsMessage');
			noFriendsMessage.classList.remove('hidden');
        } else {
			const noFriendsMessage = document.getElementById('noFriendsMessage');
			noFriendsMessage.classList.add('hidden');
            data.friends.forEach(friend => {
                const friendItem = document.createElement("tr");
                friendItem.className = "player-row";
                friendItem.innerHTML = `
                    <td><img src="${friend.avatar}" alt="${friend.username}" class="player-img"></td>
                    <td>${friend.username}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" data-variable="unfriend" data-value="${friend.username}">
                            <i class="ri-user-unfollow-fill"></i>
                        </button>
                        <button class="btn btn-warning btn-sm" data-variable="block" data-value="${friend.username}">
                            <i class="ri-user-forbid-fill"></i>
                        </button>
                    </td>
                `;
                friendsList.appendChild(friendItem);
            });
        }
    })
    .catch(error => {
        console.error("Error loading manage friends:", error);
    });
};
