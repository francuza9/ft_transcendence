import { replaceHTML } from './utils.js';

export async function Login()
{
	const body = replaceHTML('/static/src/html/login.html', true); 

	return body;
}


