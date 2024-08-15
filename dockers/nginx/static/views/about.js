import { replaceHTML } from '/static/src/js/utils.js';

export async function About() {
	replaceHTML('/static/src/html/about.html', false); 
}
