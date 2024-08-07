import { Pong } from '../views/pong_view.js';
import { Home } from '../views/home.js';
import { Register } from '../views/register.js';
import { Login } from '../views/login.js';
import { About } from '../views/about.js';
import { Leaderboard } from '../views/leaderboard.js';
import { handleButtonAction } from './buttons.js';
import { normalizePath } from '/static/src/js/utils.js';

const router = [
    { path: /^\/$/, component: Home },
    { path: /^\/pong\/(\d+)$/, component: Pong }, // Match paths like /pong/1, /pong/2, etc.
    { path: /^\/register$/, component: Register },
	{ path: /^\/login$/, component: Login },
	{ path: /^\/about$/, component: About },
	{ path: /^\/leaderboard$/, component: Leaderboard },
];

const content = document.getElementById("body-content");

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
    const path = normalizePath(window.location.pathname);
	const { component, params } = findRoute(path);
    component(params);
};

// Event listener for URL changes
window.addEventListener('popstate', handleRouting);

document.addEventListener('DOMContentLoaded', () => {

    // Handle clicks on links and buttons
    document.body.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
            e.preventDefault();
            history.pushState(null, '', e.target.href);
            handleRouting();
        } else if (e.target.tagName === 'BUTTON' && e.target.dataset.path) {
            e.preventDefault();
            const path = e.target.dataset.path;
            history.pushState(null, '', path);
            handleRouting();
        } else if (e.target.tagName === 'BUTTON' && e.target.dataset.action) {
            e.preventDefault();
            const action = e.target.dataset.action;
            handleButtonAction(e, action);
        }
    });
    handleRouting();
});
