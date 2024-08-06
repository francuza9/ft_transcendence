import { replaceHTML } from './utils.js';

export async function Home()
{
	const body = replaceHTML('/static/src/html/index.html', true); 

	return body;
}