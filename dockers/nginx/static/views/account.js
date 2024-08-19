import { replaceHTML } from '/static/src/js/utils.js';

export async function Account() {
	// do some redirection to login page if user is not logged in
	replaceHTML('/static/src/html/account.html', false);
	fetchAccountInfo();
}

async function fetchAccountInfo() {
    try {
        const response = await fetch('/api/account_info/');
        const result = await response.json();

        if (result.success) {
            const data = result.data;
            document.getElementById('username').innerText = data.username;
            document.getElementById('email').innerText = data.email;
            document.getElementById('bio').innerText = data.bio;
			document.getElementById('displayName').innerText = data.displayName;
            document.getElementById('avatar').src = data.avatarUrl || '/static/default-avatar.png';
            document.getElementById('totalScore').innerText = data.totalScore;
            document.getElementById('gamesPlayed').innerText = data.gamesPlayed;
            document.getElementById('gamesWon').innerText = data.gamesWon;
            document.getElementById('gamesLost').innerText = data.gamesLost;
			// console.log('avatarUrl', data.avatarUrl);
			// console.log('avatarPath', data.avatarPath);
			
        } else {
            alert('Failed to fetch account info.');
        }
    } catch (error) {
        console.error('Error fetching account info:', error);
    }
}


