import { replaceHTML } from '/static/src/js/utils.js';

export async function About()
{
	const body = replaceHTML('/static/src/html/about.html', false); 

	return body;
}
