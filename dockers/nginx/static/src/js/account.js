import { handleRouting } from '/static/routers/router.js';

export const accountButton = () => {
	window.location.pathname = '/login';
	handleRouting();
}
