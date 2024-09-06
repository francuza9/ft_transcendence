import {replaceHTML, fetchAvatar} from '/static/src/js/utils.js'
import {variables} from '/static/src/js/variables.js';
import {initBackground, resumeAnimation} from '/static/src/js/background/background.js';

let gameRenderer;

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

	playerData.forEach((player, rank) => {
		const row = document.createElement('tr');
		row.classList.add('player-row');
		row.setAttribute('data-player-id', player.name);

		if (player.name === variables.username) {
			row.classList.add('highlighted-row');
		}
		
		console.log(player);

		row.innerHTML = `
			<td>${rank + 1}</td>
			<td><img id="${player.name}" alt="Profile Picture" class="player-img" /></td>
			<td>${player.name}</td>
			<td>${player.score !== null ? `Score: ${player.score}` : `Eliminated at ${player.time} seconds`}</td>
		`;
		
		playerListElement.appendChild(row);
		if (player.name === 'Player 1' || player.name === 'Player 2')
			fetchAvatar(player.name, variables.username);
		else
			fetchAvatar(player.name, player.name);
	});

	if (playerData.length > 0) {
		const lastRow = playerListElement.lastElementChild;
		lastRow.classList.add('no-bottom-border');
	}
}

export const removeGameRenderer = () => {
	gameRenderer.domElement.remove();
	variables.endView = false;
	initBackground();
	resumeAnimation();
}

export const endGame = (time, names_list, score, renderer) => {
	const section = document.getElementsByTagName('section')[0];
	section.classList.remove('hidden');
	gameRenderer = renderer
	replaceHTML('/static/src/html/end.html').then(() => {
		renderPlayerList(time, names_list, score);
		variables.endView = true;
	});
}
