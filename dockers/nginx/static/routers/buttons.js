import {loginButton, loginWithGithubButton, loginWith42Button, goBackFromLogin, goToRegister, goToLogin} from '/static/src/js/login/login.js';
import {registerButton} from '/static/src/js/register.js';
import {playButton, cancelButton, localButton, onlineButton, backFromOnlineButton, skipLoginButton, goToLoginButton} from '/static/src/js/play.js';
import {createRoomButton, playerCountDropdownButton, pointsDropdownButton, editNameButton, saveNameEditButton, cancelNameEditButton, selectMapButton} from '/static/src/js/create.js';
import {loadRooms} from '/static/src/js/join.js';
import {startButton, leaveRoom} from '/static/src/js/lobby.js';
import {settingsButton, closeButton, langButton, backButton} from '/static/src/js/settings.js';

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
	pointsDropdown: pointsDropdownButton,
    cancel: cancelButton,
	editName: editNameButton,
	saveNameEdit: saveNameEditButton,
	cancelNameEdit: cancelNameEditButton,
	selectMap: selectMapButton,
	loadRooms: loadRooms,
	leave: leaveRoom,
	start: startButton,
	settings: settingsButton,
	close: closeButton,
	langButton: langButton,
	back: backButton,
	goBackFromLogin: goBackFromLogin,
	goToRegister: goToRegister,
	goToLogin: goToLogin,
};

export const handleButtonAction = (e, action) => {
    const actionFunction = actionsMap[action];

    if (actionFunction) {
        actionFunction(e);
    } else {
        console.log('Unknown action');
    }
};
