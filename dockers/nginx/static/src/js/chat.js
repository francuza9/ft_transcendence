import {getCookie} from '/static/src/js/cookies.js';
import {getSocket} from '/static/src/js/socket_handling/global_socket.js';
import {isGuest, ensureUsername} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';
import {getTranslation} from '/static/src/js/lang.js';
import {addFriend, unfriendUser, blockUser, unblockUser, acceptFriendRequest, declineFriendRequest} from '/static/src/js/friends.js';

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
	const manageFriendsBtn = document.getElementById("manage-friends-btn");
    
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
			manageFriendsBtn.classList.add('hidden');
		} else {
			manageFriendsBtn.classList.remove('hidden');
			loadFriends();
		}
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
	removeEnterListener();

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
		const manageFriendsBtn = document.getElementById("manage-friends-btn");

		manageFriendsBtn.classList.remove('hidden');
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
				const paragraph = document.createElement("p");

				paragraph.innerText = message.content;
                messageItem.className = `message-item ${messageClass}`;
                messageItem.appendChild(paragraph);
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
	const paragraph = document.createElement("p");

    if (message) {
		paragraph.innerText = message;
		messageItem.className = "message-item sender";
		messageItem.appendChild(paragraph);
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

export const loadFriendsModal = () => {
	loadEventListeners();
	loadAddFriendTab();
	loadFriendsTab();
	loadFriendRequestsTab();
	loadBlockedUsersTab();
}

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
		tabPane.classList.add('hidden');
	});

	removeEnterListener();
	const selectedTab = document.querySelector(`#tab-pane-${value}`);
	if (selectedTab) {
		selectedTab.classList.add('show', 'active');
		selectedTab.classList.remove('hidden');
		switch(value) {
			case 'add':
				loadAddFriendTab();
				break;
			case 'manage':
				loadFriendsTab();
				break;
			case 'requests':
				loadFriendRequestsTab();
				break;
			case 'blocked':
				loadBlockedUsersTab();
				break;
		}
	}
}

const loadEventListeners = () => {
	document.querySelectorAll('input[data-tab-value]').forEach(element => {
        element.addEventListener('click', (e) => {
            const value = e.target.getAttribute('data-tab-value');
            switchTab(value);
        });
    });

    const addFriendBtn = document.getElementById('add-friend-btn');
    if (addFriendBtn) {
        addFriendBtn.addEventListener('click', () => {
            const username = document.getElementById('add-friend-input').value;
            sendFriendRequest(username);
        });
    }
}

function attachFriendListeners() {
    document.querySelectorAll('button[data-unfriend]').forEach(button => {
        button.addEventListener('click', (e) => {
            const username = e.target.closest('button').getAttribute('data-unfriend');
            unfriendUser(username);
			loadFriendsTab();
			loadFriends();
        });
    });

    document.querySelectorAll('button[data-block]').forEach(button => {
        button.addEventListener('click', (e) => {
            const username = e.target.closest('button').getAttribute('data-block');
            blockUser(username);
			loadFriendsTab();
			loadFriends();
        });
    });
}

function attachFriendRequestListeners() {
    document.querySelectorAll('button[data-accept]').forEach(button => {
        button.addEventListener('click', (e) => {
            const username = e.target.closest('button').getAttribute('data-accept');
            acceptFriendRequest(username);
			loadFriendsTab();
			loadFriends();
        });
    });

    document.querySelectorAll('button[data-decline]').forEach(button => {
        button.addEventListener('click', (e) => {
            const username = e.target.closest('button').getAttribute('data-decline');
            declineFriendRequest(username);
			loadFriendsTab();
			loadFriends();
        });
    });
}

function attachBlockedUserListeners() {
    document.querySelectorAll('button[data-unblock]').forEach(button => {
        button.addEventListener('click', (e) => {
            const username = e.target.closest('button').getAttribute('data-unblock');
            unblockUser(username);
			loadBlockedUsersTab();
			loadFriends();
        });
    });
}

export const sendFriendRequest = () => {
	const usernameInput = document.getElementById('add-friend-input');
	const username = usernameInput.value;

	hideFriendRequestMessages();
	addFriend(username);
}

const loadAddFriendTab = () => {
	const usernameInput = document.getElementById('add-friend-input');

    usernameInput.placeholder = getTranslation('friends.addInputFieldPlaceholder');
	hideFriendRequestMessages();
	addEnterListener();
}

const handleEnterKey = (event) => {
	if (event.key === 'Enter') {
		event.preventDefault();
		sendFriendRequest();
	}
}

const addEnterListener = () => {
    const usernameInput = document.getElementById('add-friend-input');

    if (usernameInput) {
        usernameInput.addEventListener('keyup', handleEnterKey);
    }
};

const removeEnterListener = () => {
    const usernameInput = document.getElementById('add-friend-input');
    if (usernameInput) {
        usernameInput.removeEventListener('keyup', handleEnterKey);
    }
};

const hideFriendRequestMessages = () => {
	const successMessage = document.getElementById('request-success');
	const failMessage1 = document.getElementById('request-fail1');
	const failMessage2 = document.getElementById('request-fail2');
	const failMessage3 = document.getElementById('request-fail3');
	const failMessage4 = document.getElementById('request-fail4');
	const failMessage5 = document.getElementById('request-fail5');
	const failMessage6 = document.getElementById('request-fail6');

	successMessage.classList.add('hidden');
	failMessage1.classList.add('hidden');
	failMessage2.classList.add('hidden');
	failMessage3.classList.add('hidden');
	failMessage4.classList.add('hidden');
	failMessage5.classList.add('hidden');
	failMessage6.classList.add('hidden');
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
		const noFriendsMessage = document.getElementById('noFriendsMessage');
		const friendsTable = document.getElementById('friendsTable');

        friendsList.innerHTML = '';
        if (data.friends.length === 0) {
			noFriendsMessage.classList.remove('hidden');
			friendsTable.classList.add('hidden');
        } else {
			noFriendsMessage.classList.add('hidden');
			friendsTable.classList.remove('hidden');
            data.friends.forEach(friend => {
                const friendItem = document.createElement("tr");
                friendItem.className = "player-row";
                friendItem.innerHTML = `
					<td><img src="${friend.avatar}" alt="${friend.username}" class="player-img"></td>
					<td class="align-middle">${friend.username}</td>
					<td class="align-middle text-center">
						<div class="d-inline-flex align-items-center">
							<button class="btn btn-danger btn-sm me-2" data-unfriend="${friend.username}">
								<i class="ri-user-unfollow-fill"></i>
								<span class="ms-1">Unfriend</span>
							</button>
							<button class="btn btn-warning btn-sm" data-block="${friend.username}">
								<i class="ri-user-forbid-fill"></i>
								<span class="ms-1">Block</span>
							</button>
						</div>
					</td>
                `;
                friendsList.appendChild(friendItem);
            });
			attachFriendListeners();
        }
    })
    .catch(error => {
        console.error("Error loading manage friends:", error);
    });
};

const loadFriendRequestsTab = () => {
    fetch('/api/friend_requests/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        const friendRequestsList = document.getElementById("requests-list");
		const noRequestsMessage = document.getElementById('noRequestsMessage');
		const requestsTable = document.getElementById('requestsTable');

        friendRequestsList.innerHTML = '';
		console.log(data);
        if (data.friend_requests.length === 0) {
			noRequestsMessage.classList.remove('hidden');
			requestsTable.classList.add('hidden');
        } else {
			noRequestsMessage.classList.add('hidden');
			requestsTable.classList.remove('hidden');
            data.friend_requests.forEach(request => {
                const requestItem = document.createElement("tr");
                requestItem.className = "player-row";
                requestItem.innerHTML = `
                    <td><img src="${request.avatar}" alt="${request.name}" class="player-img"></td>
                    <td class="align-middle">${request.name}</td>
					<td class="align-middle text-center">
                        <button class="btn btn-success btn-sm me-2" data-unfriend="${request.username}">
							<i class="ri-check-fill"></i>
							<span class="ms-1">Accept</span>
                        </button>
                        <button class="btn btn-danger btn-sm" data-block="${request.username}">
                            <i class="ri-close-fill"></i>
							<span class="ms-1">Decline</span>
                        </button>
                    </td>
                `;
                friendRequestsList.appendChild(requestItem);
            });
            attachFriendRequestListeners();
        }
    })
    .catch(error => {
        console.error("Error loading friend requests:", error);
    });
};

const loadBlockedUsersTab = () => {
    fetch('/api/blocked/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        const blockedUsersList = document.getElementById("blocked-users-list");
		const noBlockedUsersMessage = document.getElementById('noBlockedUsersMessage');
		const blockedTable = document.getElementById('blockedTable');

        blockedUsersList.innerHTML = '';
        if (data.blocked.length === 0) {
			blockedTable.classList.add('hidden');
			noBlockedUsersMessage.classList.remove('hidden');
        } else {
			blockedTable.classList.remove('hidden');
			noBlockedUsersMessage.classList.add('hidden');
            data.blocked.forEach(blockedUser => {
                const blockedItem = document.createElement("tr");
                blockedItem.className = "blocked-user-row";
                blockedItem.innerHTML = `
                    <td><img src="${blockedUser.avatar}" alt="${blockedUser.username}" class="player-img"></td>
                    <td class="align-middle">${blockedUser.name}</td>
					<td class="align-middle text-center">
                        <button class="btn btn-danger btn-sm" data-unblock="${blockedUser.username}">
                            <i class="ri-close-fill"></i>
							<span class="ms-1">Unblock</span>
                        </button>
                    </td>
                `;
                blockedUsersList.appendChild(blockedItem);
            });
            attachBlockedUserListeners();
        }
    })
    .catch(error => {
        console.error("Error loading blocked users:", error);
    });
};
