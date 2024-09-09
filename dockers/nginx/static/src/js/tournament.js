import {fetchAvatar, isGuest} from '/static/src/js/utils.js';
import {handleRouting} from '/static/routers/router.js';
import {initBackground, resumeAnimation} from '/static/src/js/background/background.js';
import {initChat} from '/static/src/js/chat.js';
import {initSettings} from '/static/src/js/settings.js';
import {getTranslation} from '/static/src/js/lang.js';

export async function generateTournamentView(players, firstTime, displays) {

	//TODO: players contain usernames with which you will fetch avatars
	//		displays contain the display names of the players

	const section = document.querySelector('section');
	const warningDiv = document.createElement('div');
    section.innerHTML = '';
    section.classList.remove('hidden');

    if (firstTime) {
        warningDiv.className = 'warning-message';
        warningDiv.textContent = getTranslation('pages.tournament.warning');

        section.appendChild(warningDiv);

        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.parentNode.removeChild(warningDiv);
            }
        }, 3000);
    }

    addTournamentStylesheet();

	const containerDiv = document.createElement('div');
    containerDiv.classList.add('tournament-wrapper');

	if (firstTime) {
		setTimeout(() => {
			const tournamentContainer = createTournamentContainer(players);
			containerDiv.appendChild(tournamentContainer);
			containerDiv.appendChild(createWaitingDiv());

            section.appendChild(containerDiv);
			warningDiv.remove();
		}, 3000);
		setTimeout(() => {
			showWaitingMessage();
		}, 8500);
	}
	else {
		const tournamentContainer = createTournamentContainer(players);
		containerDiv.appendChild(tournamentContainer);
		containerDiv.appendChild(createWaitingDiv());

        section.appendChild(containerDiv);
		setTimeout(() => {
			showWaitingMessage();
		}, 5500);
	}
}

function createWaitingDiv() {
	const waitingDiv = document.createElement('div');
	waitingDiv.id = "waitingDiv";
    waitingDiv.classList.add('waiting-message', 'hidden');

	const textNode = document.createTextNode(getTranslation('pages.tournament.waiting'));
    const dotsSpan = document.createElement('span');
    dotsSpan.classList.add('dots');

    waitingDiv.appendChild(textNode);
    waitingDiv.appendChild(dotsSpan);

	return waitingDiv;
}

export function showWaitingMessage() {
    const waitingDiv = document.getElementById('waitingDiv');
    if (waitingDiv) {
        waitingDiv.classList.remove('hidden');
    }
}

function createTournamentContainer(players) {
    const tournamentContainer = document.createElement('div');
    tournamentContainer.className = 'tournament-container w-100';

    const currentMatches = document.createElement('div');
    currentMatches.className = 'current-matches';

	players.forEach((pair) => {
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
	});

    tournamentContainer.appendChild(currentMatches);
	return tournamentContainer;
}

export function displayWinner(winner) {
    const section = document.querySelector('section');
    section.innerHTML = '';
    section.classList.remove('hidden');
    
    addTournamentStylesheet();

    const tournamentContainer = document.createElement('div');
    tournamentContainer.className = 'tournament-container winner-display w-100';

    const winnerDiv = document.createElement('div');
    winnerDiv.className = 'winner-display';

    const winnerBox = createWinnerBox(winner);
    winnerDiv.appendChild(winnerBox);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'action-buttons';

    const homeButton = document.createElement('button');
    homeButton.className = 'home-button';
    homeButton.textContent = 'Continue to Home';
    homeButton.addEventListener('click', () => {
        const confettiCanvas = document.getElementById('confetti-canvas');
        if (confettiCanvas) {
            confettiCanvas.remove();
        }

        history.pushState(null, '', '/');
        handleRouting();

		initChat();
		initSettings();
		initBackground();
		resumeAnimation();
    });

    buttonsDiv.appendChild(homeButton);
    winnerDiv.appendChild(buttonsDiv);

    tournamentContainer.appendChild(winnerDiv);
    section.appendChild(tournamentContainer);

    const confettiCanvas = document.createElement('canvas');
    confettiCanvas.id = 'confetti-canvas';
    section.appendChild(confettiCanvas);

    triggerConfetti();
}

function triggerConfetti() {
    const duration = 5000;
    const endTime = Date.now() + duration;
    const confettiCanvas = document.getElementById('confetti-canvas');
    const context = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    confettiCanvas.style.position = 'fixed';
    confettiCanvas.style.top = 0;
    confettiCanvas.style.left = 0;
    confettiCanvas.style.width = '100%';
    confettiCanvas.style.height = '100%';
    confettiCanvas.style.pointerEvents = 'none';
    const confettiParticles = [];

    const colors = ['#ff0a54', '#ff477e', '#ff85a1', '#fbb1bd', '#f9bec7'];

    function randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    function createParticles() {
        const particleCount = 150;
        for (let i = 0; i < particleCount; i++) {
            confettiParticles.push({
                x: randomRange(0, confettiCanvas.width),
                y: randomRange(0, confettiCanvas.height / 2) - confettiCanvas.height / 2,
                dx: randomRange(-5, 5),
                dy: randomRange(3, 7),
                size: randomRange(10, 15),
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: randomRange(0, 360),
                dRotation: randomRange(-5, 5)
            });
        }
    }

    function updateParticles() {
        context.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiParticles.forEach((particle, index) => {
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.rotation += particle.dRotation;

            if (particle.y > confettiCanvas.height) {
                confettiParticles.splice(index, 1);
            }

            context.save();
            context.translate(particle.x, particle.y);
            context.rotate((particle.rotation * Math.PI) / 180);
            context.fillStyle = particle.color;
            context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            context.restore();
        });

        if (Date.now() < endTime || confettiParticles.length > 0) {
            requestAnimationFrame(updateParticles);
        } else {
            context.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }

    createParticles();
    updateParticles();
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
    img.src = '/static/default-avatar.png';

    const name = document.createElement('span');
    name.textContent = username;
    name.classList.add('player-name');

    playerBox.appendChild(img);
    playerBox.appendChild(name);

    if (!isBot && !isGuest(username)) {
        fetchAvatar(username, username);
    }

    return playerBox;
}

function createWinnerBox(username) {
    const playerBox = document.createElement('div');
    playerBox.classList.add('player-box', 'winner-box');

    const crown = document.createElement('i');
    crown.classList.add('ri-vip-crown-fill', 'crown-icon');

    const img = document.createElement('img');
    img.classList.add('player-avatar', 'winner-avatar');
    img.id = username;
    img.src = '/static/default-avatar.png';

    const name = document.createElement('span');
    name.textContent = username;
    name.classList.add('player-name');

    playerBox.appendChild(crown);
    playerBox.appendChild(img);
    playerBox.appendChild(name);

    return playerBox;
}
