import {replaceHTML} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';

export const test = () => {
	replaceHTML('/static/src/html/end.html');
}

export function renderPlayerList(times, players, scores) {
	const playerListElement = document.getElementsByClassName('playerList')[0];
	playerListElement.innerHTML = '';

	const playerData = players.map((player, index) => ({
		name: player,
		time: times[index],
		score: null,
		index: index
	}));

	let finalistIndices = [];
	for (let i = 0; i < 2; i++) {
		let maxTime = Math.max(...times);
		let maxIndex = times.indexOf(maxTime);
		finalistIndices.push(maxIndex);
		times[maxIndex] = -1;
	}

	if (finalistIndices.length === 2) {
		playerData[finalistIndices[0]].score = scores[0];
		playerData[finalistIndices[1]].score = scores[1];
	}

	playerData.sort((a, b) => {
		if (a.score !== b.score) {
			return (b.score ?? -1) - (a.score ?? -1);
		}
		return b.time - a.time;
	});

	console.log('playerData:', playerData);

	playerData.forEach((player, rank) => {
		console.log('rank:', rank);
		const row = document.createElement('tr');
		row.classList.add('player-row');
		row.setAttribute('data-player-id', `player${player.index + 1}`);

		if (player.name === variables.username) {
			row.classList.add('highlighted-row');
		}

		row.innerHTML = `
			<td>${rank + 1}</td>
			<td><img src="path_to_profile_pictures/${player.name}.png" alt="Profile Picture" class="profile-pic" /></td>
			<td>${player.name}</td>
			<td>${player.score !== null ? `Score: ${player.score}` : `Eliminated at ${player.time} seconds`}</td>
		`;

		playerListElement.appendChild(row);
	});

	if (playerData.length > 0) {
		const lastRow = playerListElement.lastElementChild;
		lastRow.classList.add('no-bottom-border');
	}
}
