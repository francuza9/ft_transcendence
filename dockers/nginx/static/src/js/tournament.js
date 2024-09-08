import { fetchAvatar, isGuest } from '/static/src/js/utils.js';

export async function generateTournamentView(players, firstTime) {
    console.log(players);
    if (firstTime) {
        console.log(firstTime);
    }

    const section = document.querySelector('section');
    section.innerHTML = '';
	section.classList.remove('hidden');

    addTournamentStylesheet();

    const tournamentContainer = document.createElement('div');
    tournamentContainer.className = 'tournament-container w-100';

    const currentMatches = document.createElement('div');
    currentMatches.className = 'current-matches';

    for (const pair of players) {
		console.log(pair);
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';

        const playerDivs = [];
        for (const playerKey in pair) {
            const isBot = pair[playerKey];
            const playerDiv = createPlayerBox(playerKey, isBot);
            playerDivs.push(playerDiv);
        }

        matchDiv.appendChild(playerDivs[0]);
        
        const vsDiv = document.createElement('div');
        vsDiv.className = 'vs';
        vsDiv.textContent = 'VS';
        matchDiv.appendChild(vsDiv);

        matchDiv.appendChild(playerDivs[1]);

        currentMatches.appendChild(matchDiv);
    }

    tournamentContainer.appendChild(currentMatches);
    section.appendChild(tournamentContainer);
}

function addTournamentStylesheet() {
    const existingLink = document.querySelector('link[href="/static/src/css/tournament.css"]');
    if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/static/src/css/tournament.css';
        document.head.appendChild(link);
    }
}

function createPlayerBox(username, isBot) {
    const playerBox = document.createElement('div');
    playerBox.classList.add('player-box');

    const img = document.createElement('img');
    img.classList.add('player-avatar');
    img.id = username;
    img.src = '/static/default-avatar.png'; // Use default avatar

    const name = document.createElement('span');
    name.textContent = username;
    name.classList.add('player-name');

    playerBox.appendChild(img);
    playerBox.appendChild(name);

    // No need to fetch avatars for bots
    if (!isBot && !isGuest(username)) {
        fetchAvatar(username, username);
    }

    return playerBox;
}
