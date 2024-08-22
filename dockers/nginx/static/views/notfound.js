import {replaceHTML} from '/static/src/js/utils.js';

export async function NotFound() {
	replaceHTML('/static/src/html/notfound.html', false); 
}
