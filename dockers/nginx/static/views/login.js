import {replaceHTML} from '/static/src/js/utils.js';
import {observeLoginForm} from '/static/src/js/login.js';
import {checkLoginStatus} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';
import {handleRouting} from '/static/routers/router.js';

export async function Login() {
	checkLoginStatus().then(loggedIn => {
		if (loggedIn && !variables.is_guest) {
			history.pushState(null, '', '/account');
			handleRouting();
		}
		else {
			replaceHTML('/static/src/html/login.html', false); 
			observeLoginForm();
		}
	})
}
