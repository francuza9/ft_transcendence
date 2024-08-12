import { replaceHTML } from '/static/src/js/utils.js';

export async function Home() {
	replaceHTML('/static/src/html/index.html', false); 
}
