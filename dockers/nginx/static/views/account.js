import { variables } from '/static/src/js/variables.js';
import { handleRouting } from '/static/routers/router.js';
import { replaceHTML, checkLoginStatus, fetchAccountInfo} from '/static/src/js/utils.js';

export async function Account() {
	
	checkLoginStatus().then(loggedIn => {
		if (!loggedIn || variables.is_guest) {
			history.pushState(null, '', '/login');
			handleRouting();
		} else {
			replaceHTML('/static/src/html/account.html', false);
			fetchAccountInfo();
		}
	})
	
}

