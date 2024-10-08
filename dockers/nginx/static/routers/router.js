import { Pong } from '../views/pong_view.js';
import { Home } from '../views/home.js';
import { Register } from '../views/register.js';
import { Login } from '../views/login.js';
import { About } from '../views/about.js';
import { Leaderboard } from '../views/leaderboard.js';
import { Create } from '../views/create.js';
import { Join } from '../views/join.js';
import { Lobby } from '../views/lobby.js';
import { Account } from '../views/account.js';
import { updateVariable } from '/static/src/js/variables.js';
import { normalizePath } from '/static/src/js/utils.js';
import { NotFound } from '/static/views/notfound.js';
import { viewProfile} from '/static/src/js/profile.js';
import { goActive } from '/static/src/js/socket_handling/global_socket.js';
import { moveModalBackdrops } from '/static/src/js/utils.js';
import { initChat } from '/static/src/js/chat.js';
import { initSettings } from '/static/src/js/settings.js'; 
import { handleButtonAction } from '/static/routers/buttons.js';
import { checkLoginStatus } from '/static/src/js/utils.js';
import { setExited } from '/static/src/js/tournament.js';
import { getTournamentSocket } from '/static/src/js/socket_handling/tournament_socket.js';
import { getLobbySocket } from '/static/src/js/socket_handling/lobby_socket.js';
import { getPongSocket } from '/static/src/js/socket_handling/pong_socket.js';

const router = [
    { path: /^\/$/, component: Home },
    { path: /^\/pong\/(\d+)$/, component: Pong },
    { path: /^\/register$/, component: Register },
	{ path: /^\/login$/, component: Login },
	{ path: /^\/about$/, component: About },
	{ path: /^\/create$/, component: Create },
	{ path: /^\/join$/, component: Join },
	{ path: /^\/leaderboard$/, component: Leaderboard },
	{ path: /^\/(\w{8})$/, component: Lobby },
	{ path: /^\/account$/, component: Account },
	{ path: /.*/, component: NotFound }, 
];

const findRoute = (path) => {
    for (const route of router) {
        const match = path.match(route.path);
        if (match) {
            return { component: route.component, params: match.slice(1) };
        }
    }
    return { component: () => document.createTextNode('404 Not Found') };
};

export const handleRouting = () => {
	setExited(true);
    const path = normalizePath(window.location.pathname);
	const { component, params } = findRoute(path);
    component(params);
};

const handleSockets = () => {
	const tournSocket = getTournamentSocket();
	if (tournSocket) {
		tournSocket.close();
	}

	const lobbySocket = getLobbySocket();
	if (lobbySocket) {
		lobbySocket.close();
	}

	const pongSocket = getPongSocket();
	if (pongSocket) {
		pongSocket.close();
	}
};

window.addEventListener('popstate', handleRouting);

window.addEventListener('popstate', handleSockets);


document.addEventListener('DOMContentLoaded', () => {

	document.body.addEventListener('click', (e) => {
		if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
			e.preventDefault();
			history.pushState(null, '', e.target.href);
			handleRouting();
		} 
		else if (e.target.closest('button[data-path]')) {
			e.preventDefault();
			const path = e.target.closest('button').dataset.path;
			history.pushState(null, '', path);
			handleRouting();
		} 
		else if (e.target.closest('button[data-action], a[data-action]')) {
			e.preventDefault();
			const targetElement = e.target.closest('button[data-action], a[data-action]');
			const action = targetElement.dataset.action;
			handleButtonAction(e, action);
		}
		else if (e.target.closest('[data-variable]')) {
			const element = e.target.closest('[data-variable]');
			const variable = element.dataset.variable;
			const value = element.dataset.value;
			updateVariable(document, variable, value);
		}
		else if (e.target.closest('tr[data-player-id]')) {
			const targetRow = e.target.closest('tr[data-player-id]');
			if (!e.target.closest('button')) {
				const playerId = targetRow.dataset.playerId;
				viewProfile(null, playerId);
			}
		}
		moveModalBackdrops();
	});

	fetch('/api/csrf/')
	.then(response => response.json())
	.then(data => {
		console.log('CSRF Token:', data.csrftoken);
		// Now the cookie should be set automatically
	});

	checkLoginStatus().then(loggedIn => {
		if (loggedIn) {
			goActive();
		}
	});
	initChat();
	initSettings();
	handleRouting();
});
