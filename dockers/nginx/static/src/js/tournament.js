import { fetchAvatar, isGuest } from '/static/src/js/utils.js';

export async function generateTournamentView(players, firstTime) {
    console.log(players);
    if (firstTime) {
        console.log(firstTime);
    }

    const section = document.querySelector('section');
    section.innerHTML = '';

    addTournamentStylesheet();

    const tournamentContainer = document.createElement('div');
    tournamentContainer.className = 'tournament-container w-100';

    // Create top half for current matches
    const currentMatches = document.createElement('div');
    currentMatches.className = 'current-matches';

    // Populate current matches
    for (const pair of players) {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';

        // Create player boxes
        const playerDivs = [];
        for (const playerKey in pair) {
            const isBot = pair[playerKey];
            const playerDiv = createPlayerBox(playerKey, isBot);
            playerDivs.push(playerDiv);
        }

        // Append player boxes and "VS" between them
        matchDiv.appendChild(playerDivs[0]);
        
        const vsDiv = document.createElement('div');
        vsDiv.className = 'vs';
        vsDiv.textContent = 'VS';
        matchDiv.appendChild(vsDiv);

        matchDiv.appendChild(playerDivs[1]);

        currentMatches.appendChild(matchDiv);
    }

    // Append the top half to the container
    tournamentContainer.appendChild(currentMatches);

    // Append the tournament container to the section
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
