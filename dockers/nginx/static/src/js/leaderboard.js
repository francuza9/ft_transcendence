import {variables} from '/static/src/js/variables.js';

export async function fetchLeaderboard() {
	try {
		// API call to fetch leaderboard data
		const response = await fetch('/api/leaderboard/win_rate/');

		// Check if the response status is OK (200-299)
		if (!response.ok) {
			console.error(`Failed to fetch data. Status: ${response.status}, Status Text: ${response.statusText}`);
			return;
		}

		// Parse the response as JSON
		const result = await response.json();
		console.log("Response received from API:", result);

		// Ensure the result is an array
		if (!Array.isArray(result)) {
			console.error("Expected data to be an array but received:", result);
			return;
		}

		console.log("Successfully received leaderboard data. Processing...");

		// Clear the existing rows in the table
		const playerList = document.getElementById('playerList');
		playerList.innerHTML = ''; // Clear previous data

		// Iterate through the data and create table rows
		result.forEach((player, index) => {
			console.log(`Processing player ${index + 1}:`, player);

			// Extract necessary data with fallback values
			const displayName = player.displayName || 'Unknown Player';
			const gamesPlayed = player.gamesPlayed || 0;
			const gamesWon = player.gamesWon || 0;
			const gamesLost = player.gamesLost || 0;
			const winRatio = player.win_ratio !== undefined ? (player.win_ratio * 100).toFixed(2) : '0.00';

			// Log the processed player data
			console.log(`Rank: ${index + 1}, Name: ${displayName}, Games Played: ${gamesPlayed}, Games Won: ${gamesWon}, Games Lost: ${gamesLost}, Win Ratio: ${winRatio}%`);

			// Create a new row element
			const playerRow = document.createElement('tr');

			// Populate the row with player data
			playerRow.innerHTML = `
				<td>${index + 1}</td> <!-- Rank -->
				<td><img src="${player.avatarUrl || '/static/default-avatar.png'}" class="player-img" alt="${player.username}'s avatar"></td>
				<td>${displayName}</td> <!-- Player Name -->
				<td>${gamesPlayed}</td> <!-- Games Played -->
				<td>${gamesWon}</td> <!-- Games Won -->
				<td>${winRatio}%</td> <!-- Win Ratio -->
			`;

			// Append the row to the player list table
			playerList.appendChild(playerRow);
		});

		console.log("Leaderboard data successfully rendered.");
	} catch (error) {
		console.error('Error encountered while fetching or processing leaderboard data:', error);
	}
}
