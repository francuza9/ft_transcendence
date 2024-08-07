import { handleRouting } from '/static/routers/router.js';

export const accountButton = (e) => {
	window.location.pathname = '/login';
	e.preventDefault();
	history.pushState(null, '', e.target.href);
	handleRouting();
}
