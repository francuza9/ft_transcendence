import {loginButton, loginWithGithubButton, loginWith42Button, goBackFromLogin, goToRegister, goToLogin} from '/static/src/js/login.js';
import {registerButton} from '/static/src/js/register.js';
import {playButton, cancelButton, localButton, onlineButton, backFromOnlineButton, skipLoginButton, goToLoginButton} from '/static/src/js/play.js';
import {createRoomButton, playerCountDropdownButton, pointsDropdownButton, editNameButton, saveNameEditButton, cancelNameEditButton, selectMapButton} from '/static/src/js/create.js';
import {loadRooms} from '/static/src/js/join.js';
import {saveAvatarButton, removeAvatarButton, uploadAvatarButton, savePasswordButton} from '/static/src/js/account.js';
import {startButton, leaveRoom, addBot} from '/static/src/js/lobby.js';
import {settingsButton, closeButton, langButton, backButton, logoutButton} from '/static/src/js/settings.js';
import {openChat, closeChat, sendMessage, backToFriends, sendInvitation} from '/static/src/js/chat.js';
import {startLocalButton, difficultyDropdown} from '/static/src/js/local.js'

const actionsMap = {
    login: loginButton,
    loginWithGithub: loginWithGithubButton,
    loginWith42: loginWith42Button,
    register: registerButton,
    play: playButton,
    local: localButton,
    online: onlineButton,
	backFromOnline: backFromOnlineButton,
    skipLogin: skipLoginButton,
    goToLoginButton: goToLoginButton,
    createRoom: createRoomButton,
    playerCountDropdown: playerCountDropdownButton,
	difficultyDropdown: difficultyDropdown,
	pointsDropdown: pointsDropdownButton,
    cancel: cancelButton,
	editName: editNameButton,
	saveNameEdit: saveNameEditButton,
	cancelNameEdit: cancelNameEditButton,
	selectMap: selectMapButton,
	loadRooms: loadRooms,
	leave: leaveRoom,
	start: startButton,
	startLocal: startLocalButton,
	settings: settingsButton,
	close: closeButton,
	langButton: langButton,
	back: backButton,
	savePassword: savePasswordButton,
	saveAvatar: saveAvatarButton,
    removeAvatar: removeAvatarButton,
	uploadAvatar: uploadAvatarButton,
	goBackFromLogin: goBackFromLogin,
	goToRegister: goToRegister,
	goToLogin: goToLogin,
	logout: logoutButton,
	addBot: addBot,
	openChat: openChat,
	closeChat: closeChat,
	sendMessage: sendMessage,
	backToFriends: backToFriends,
	sendInvitation: sendInvitation,
};

export const handleButtonAction = (e, action) => {
    const actionFunction = actionsMap[action];

    if (actionFunction) {
        actionFunction(e);
    } else {
        console.log('Unknown action:', action);
    }
};
