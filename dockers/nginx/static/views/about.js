import { replaceHTML } from './utils.js';

export async function About()
{
	const body = replaceHTML('/static/src/html/about.html', true); 

	return body;
}