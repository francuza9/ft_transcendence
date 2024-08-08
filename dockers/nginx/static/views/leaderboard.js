import { replaceHTML } from '/static/src/js/utils.js';

export async function Leaderboard()
{
	const body = replaceHTML('/static/src/html/leaderboard.html', false); 

	return body;
}
