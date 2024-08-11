import {replaceHTML} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';
import {handleRouting} from '/static/routers/router.js';
import {checkLoginStatus} from '/static/src/js/utils.js';

export const playButton = () => {
	replaceHTML('/static/src/html/play.html', false);
    variables.pageHistory.push('index');
}

export const backButton = () => {
    if (variables.pageHistory.length > 0) {
        const lastPage = variables.pageHistory.pop();
        replaceHTML(`/static/src/html/${lastPage}.html`, false);
    } else {
        console.warn("No more pages in history to go back to.");
    }
}

export const cancelButton = () => {
	history.pushState(null, '', '/');
	replaceHTML('/static/src/html/room.html', false);
}

export const localButton = () => {
	replaceHTML('/static/src/html/local.html', false);
    variables.pageHistory.push('play');
}

export const onlineButton = () => {
	checkLoginStatus().then(loggedIn => {
		variables.pageHistory.push('play');
		if (loggedIn) {
			replaceHTML('/static/src/html/room.html', false);
		} else {
			replaceHTML('/static/src/html/online.html', false);
		}
	}).catch(error => {
		console.error('Error checking login status:', error);
		replaceHTML('/static/src/html/online.html', false);
	});
}

export const skipLoginButton = () => {
	replaceHTML('/static/src/html/room.html', false);
    variables.pageHistory.push('online');
}

export const goToLoginButton = () => {
    variables.pageHistory.push('online');
	variables.nextPage = 'room';
	history.pushState(null, '', '/login');
	handleRouting();
}
