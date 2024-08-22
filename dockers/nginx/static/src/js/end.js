import {replaceHTML} from '/static/src/js/utils.js';

export const test = () => {
	replaceHTML('/static/src/html/end.html');
}

function renderPlayerList(variables) {
    const playerListElement = document.getElementsByClassName('playerList')[0];
	playerListElement.innerHTML = '';

	let highestIndex = -1;
    variables.players.forEach((player, index) => {
		highestIndex = index;
        const row = document.createElement('tr');
        row.classList.add('player-row');
        row.setAttribute('data-player-id', `player${index + 1}`);

		if (player === variables.username) {
            row.classList.add('highlighted-row');
        }

        row.innerHTML = `
			<!-- 
            <td><img src="${player.profile_picture || 'https://via.placeholder.com/40'}" alt="${player}" class="player-img"></td>
            <td>${player.totalScore}</td>
			-->
            <td>${player}</td>
        `;

        playerListElement.appendChild(row);
    });
	if (highestIndex >= 0) {
		const lastRow = playerListElement.children[highestIndex];
		lastRow.classList.add('no-bottom-border');
	}
}
