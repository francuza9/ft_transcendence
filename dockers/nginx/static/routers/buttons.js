import {loginButton, loginWithGithubButton, loginWith42Button} from '/static/src/js/login/login.js'
import {accountButton} from '/static/src/js/account.js'

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
		case 'account':
			accountButton(e);
			break;
        default:
            console.log('Unknown action');
    }
};
