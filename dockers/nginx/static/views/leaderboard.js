import { replaceHTML } from '/static/src/js/utils.js';
import { fetchLeaderboard } from '/static/src/js/leaderboard.js';

export async function Leaderboard() {
	replaceHTML('/static/src/html/leaderboard.html', false);
	fetchLeaderboard();
}
