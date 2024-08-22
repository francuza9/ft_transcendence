import {replaceHTML} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';
import {handleRouting} from '/static/routers/router.js';
import {checkLoginStatus, guestLogin} from '/static/src/js/utils.js';
import {startLocal} from '/static/src/js/localgame/localgame.js';
import {cleanupBackground} from '/static/src/js/background/background.js';

export const playButton = () => {
	replaceHTML('/static/src/html/play.html', false);
}

export const cancelButton = () => {
	history.pushState(null, '', '/');
	replaceHTML('/static/src/html/room.html', false);
}

export const localButton = () => {
	const section = document.getElementsByTagName('section')[0];
	section.remove();
	cleanupBackground();

	const element = document.createElement('div');
	element.innerHTML = `
		<h1>Pong Local Game !/h1>
		<script type="module" src="{% static 'src/js/localgame/localgame.js' %}"></script>
	`;
	startLocal();
}

export const onlineButton = () => {
	checkLoginStatus().then(loggedIn => {
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

export const backFromOnlineButton = () => {
	checkLoginStatus().then(loggedIn => {
		if (loggedIn) {
			replaceHTML('/static/src/html/play.html', false);
		} else {
			replaceHTML('/static/src/html/online.html', false);
		}
	}).catch(error => {
		console.error('Error checking login status:', error);
		replaceHTML('/static/src/html/online.html', false);
	});
}

export const skipLoginButton = () => {
	guestLogin();
	replaceHTML('/static/src/html/room.html', false);
}

export const goToLoginButton = () => {
	history.pushState(null, '', '/login');
	handleRouting();
	variables.previousPage = 'online';
}
