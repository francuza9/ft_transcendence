import { replaceHTML } from './utils.js';

export async function Leaderboard()
{
	const body = replaceHTML('/static/src/html/leaderboard.html', true); 

	return body;
}