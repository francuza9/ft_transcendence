import {variables} from '/static/src/js/variables.js';

export async function fetchLeaderboard() {
	try {
		const response = await fetch('/api/leaderboard/win_rate/');

		if (!response.ok) {
			console.error(`Failed to fetch data. Status: ${response.status}, Status Text: ${response.statusText}`);
			return;
		}

		const result = await response.json();
		console.log("Response received from API:", result);

		if (!Array.isArray(result)) {
			console.error("Expected data to be an array but received:", result);
			return;
		}

		console.log("Successfully received leaderboard data. Processing...");

		const playerList = document.getElementById('playerList');
		playerList.innerHTML = '';

		result.forEach((player, index) => {
			console.log(`Processing player ${index + 1}:`, player);

			const displayName = player.displayName || 'Unknown Player';
			const gamesPlayed = player.gamesPlayed || 0;
			const gamesWon = player.gamesWon || 0;
			const gamesLost = player.gamesLost || 0;
			const winRatio = player.win_ratio !== undefined ? (player.win_ratio * 100).toFixed(2) : '0.00';

			console.log(`Rank: ${index + 1}, Name: ${displayName}, Games Played: ${gamesPlayed}, Games Won: ${gamesWon}, Games Lost: ${gamesLost}, Win Ratio: ${winRatio}%`);

			const playerRow = document.createElement('tr');
			playerRow.classList.add('player-row');
			playerRow.setAttribute('data-player-id', player.username);

			if (player.username === variables.username) {
				playerRow.classList.add('highlighted-row');
			}
			playerRow.innerHTML = `
				<td>${index + 1}</td>
				<td>
					<div style="display: flex; align-items: center; justify-content: center;">
						<img src="${player.avatarUrl || '/static/default-avatar.png'}" class="player-img" alt="${player.username}'s avatar" style="margin-right: 8px;">
						<span>${displayName}</span>
					</div>
				</td>
				<td>${gamesPlayed}</td>
				<td>${gamesWon}</td>
				<td>${winRatio}%</td>
			`;

			playerList.appendChild(playerRow);
		});

		if (result.length > 0) {
			const lastRow = playerList.lastElementChild;
			lastRow.classList.add('no-bottom-border');
		}

		console.log("Leaderboard data successfully rendered.");
		
	} catch (error) {
		console.error('Error encountered while fetching or processing leaderboard data:', error);
	}
}
