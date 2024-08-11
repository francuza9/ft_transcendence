import {loginButton, loginWithGithubButton, loginWith42Button} from '/static/src/js/login/login.js';
import {registerButton} from '/static/src/js/register.js';
import {accountButton} from '/static/src/js/account.js';
import {playButton, backButton, cancelButton, localButton, onlineButton, skipLoginButton, goToLoginButton} from '/static/src/js/play.js';
import {joinRoomButton} from '/static/src/js/join.js';
import {createRoomButton, playerCountDropdownButton} from '/static/src/js/create.js';

const actionsMap = {
    login: loginButton,
    loginWithGithub: loginWithGithubButton,
    loginWith42: loginWith42Button,
    register: registerButton,
    account: accountButton,
    play: playButton,
    back: backButton,
    local: localButton,
    online: onlineButton,
    skipLogin: skipLoginButton,
    goToLogin: goToLoginButton,
    join: joinRoomButton,
    createRoom: createRoomButton,
    playerCountDropdown: playerCountDropdownButton,
    cancel: cancelButton,
};

export const handleButtonAction = (e, action) => {
    const actionFunction = actionsMap[action];

    if (actionFunction) {
        actionFunction(e);
    } else {
        console.log('Unknown action');
    }
};
