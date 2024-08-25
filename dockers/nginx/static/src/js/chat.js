import { getCookie } from '/static/src/js/cookies.js';
import { getSocket } from '/static/src/js/socket_handling/global_socket.js';

let chatInputListener = null;

export const openChat = () => {
    const chatWindow = document.getElementById("chat-window");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const friendList = document.getElementById("friend-list");
    const chatArea = document.getElementById("chat-area");
    const chatTitle = document.getElementById("chat-title");
    const chatName = document.getElementById("chat-name");
    const chatAvatar = document.getElementById("chat-avatar");
    const backBtn = document.getElementById("back-btn");

    chatWindow.classList.remove("hidden");
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

    chatWindow.classList.add("hidden");

    if (chatInputListener) {
        chatInput.removeEventListener("keypress", chatInputListener);
    }
};

export const backToFriends = () => {
    const chatArea = document.getElementById("chat-area");
    const friendList = document.getElementById("friend-list");
    const chatTitle = document.getElementById("chat-title");
    const backBtn = document.getElementById("back-btn");
    const chatAvatar = document.getElementById("chat-avatar");

    chatArea.classList.add("hidden");
    friendList.classList.remove("hidden");
    chatTitle.classList.add("hidden");
    backBtn.classList.add("hidden");
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
		console.log(data);
        friendList.innerHTML = '';
        data.friends.forEach(friend => {
            const friendItem = document.createElement("div");
            friendItem.className = "friend-item";
            friendItem.innerHTML = `
                <img src="${friend.avatar}" alt="${friend.name}" width="40" height="40" class="rounded-circle">
                <span>${friend.name}</span>
            `;
            friendItem.dataset.friendId = friend.id; // Add friend ID for future reference
            friendItem.addEventListener('click', () => openChatWithFriend(friend));
            friendList.appendChild(friendItem);
        });
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

    friendList.classList.add("hidden");
    chatArea.classList.remove("hidden");
    chatTitle.classList.remove("hidden");
    backBtn.classList.remove("hidden");

    chatName.textContent = friend.name;
    chatAvatar.src = friend.avatar;

    // Load chat messages with the selected friend
    loadChatMessages(friend.id);
};

const loadChatMessages = (friendId) => {
    // Implement fetching chat messages from backend here
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

export const sendInvitation = () => {
	const socket = getSocket();
	const targetUser = 'b';
	// we need to make actual target

	const lobbyURL = window.location.href;

	console.log('sending invitation');

	socket.send(JSON.stringify({type: 'game_invitation', target: targetUser, lobby: lobbyURL})); //TODO: DO THIS
}
