import {replaceHTML} from '/static/src/js/utils.js';
import {observeLoginForm} from '/static/src/js/login.js';

export async function Login() {
	replaceHTML('/static/src/html/login.html', false); 
	observeLoginForm();
}
