import { handleRouting } from '/static/routers/router.js';

export const accountButton = (e) => {
	e.preventDefault();
	history.pushState(null, '', '/login');
	handleRouting();
}
