import {loginButton, loginWithGithubButton, loginWith42Button} from '/static/src/js/login/login.js';
import {registerButton} from '/static/src/js/register.js';
import {accountButton} from '/static/src/js/account.js';
import {playButton, backButton, localButton, onlineButton, skipLoginButton, goToLoginButton, createButton, joinButton, createRoomButton, joinRoomButton, playerCountDropdownButton} from '/static/src/js/play.js';

export const handleButtonAction = (e, action) => {
    switch(action) {
		case 'login':
			loginButton();
			break;
        case 'loginWithGithub':
			loginWithGithubButton();
            break;
        case 'loginWith42':
			loginWith42Button();
            break;
		case 'register':
			registerButton();
			break;
		case 'account':
			accountButton(e);
			break;
		case 'play':
			playButton();
			break;
		case 'back':
			backButton();
			break;
		case 'local':
			localButton();
			break;
		case 'online':
			onlineButton();
			break;
		case 'skipLogin':
			skipLoginButton();
			break;
		case 'goToLogin':
			goToLoginButton();
			break;
		case 'join':
			joinButton();
			break;
		case 'create':
			createButton();
			break;
		case 'createRoom':
			createRoomButton();
			break;
		case 'playerCountDropdown':
			playerCountDropdownButton();
			break;
        default:
            console.log('Unknown action');
    }
};
