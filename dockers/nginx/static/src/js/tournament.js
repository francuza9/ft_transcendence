import {fetchAvatar, isGuest} from '/static/src/js/utils.js';
import {handleRouting} from '/static/routers/router.js';
import {initBackground, resumeAnimation} from '/static/src/js/background/background.js';
import {initChat} from '/static/src/js/chat.js';
import {initSettings} from '/static/src/js/settings.js';

export async function generateTournamentView(players, firstTime) {
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

    // Create rows for each match (player vs player)
	players.forEach((pair) => {
		const matchDiv = document.createElement('div');
		matchDiv.className = 'match';  // Changed to match the CSS

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
    section.appendChild(tournamentContainer);
}

export function displayWinner(winner) {
    const section = document.querySelector('section');
    section.innerHTML = '';  // Clear the section for the winner display
    section.classList.remove('hidden');
    
    addTournamentStylesheet();

    // Create container for the winner display
    const tournamentContainer = document.createElement('div');
    tournamentContainer.className = 'tournament-container winner-display w-100';

    // Create the winner's player box with a crown and golden border
    const winnerDiv = document.createElement('div');
    winnerDiv.className = 'winner-display';

    const winnerBox = createWinnerBox(winner);
    winnerDiv.appendChild(winnerBox);

    // Add buttons for actions (e.g., continue to home)
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'action-buttons';

    const homeButton = document.createElement('button');
    homeButton.className = 'home-button';
    homeButton.textContent = 'Continue to Home';
    homeButton.addEventListener('click', () => {
        // Remove confetti canvas when the home button is clicked
        const confettiCanvas = document.getElementById('confetti-canvas');
        if (confettiCanvas) {
            confettiCanvas.remove();
        }

        // Navigate to the home page
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

    // Add the confetti canvas dynamically
    const confettiCanvas = document.createElement('canvas');
    confettiCanvas.id = 'confetti-canvas';
    section.appendChild(confettiCanvas);

    // Trigger confetti animation
    triggerConfetti();
}

function triggerConfetti() {
    const duration = 5000; // Duration of the animation in milliseconds (extended to 5 seconds)
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

    // Create confetti particles
    function createParticles() {
        const particleCount = 150;
        for (let i = 0; i < particleCount; i++) {
            confettiParticles.push({
                x: randomRange(0, confettiCanvas.width),
                y: randomRange(0, confettiCanvas.height / 2) - confettiCanvas.height / 2,
                dx: randomRange(-5, 5),   // Slower horizontal speed
                dy: randomRange(3, 7),    // Slower vertical speed
                size: randomRange(10, 15), // Bigger confetti pieces
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: randomRange(0, 360),
                dRotation: randomRange(-5, 5)
            });
        }
    }

    // Update and draw particles
    function updateParticles() {
        context.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiParticles.forEach((particle, index) => {
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.rotation += particle.dRotation;

            // Remove particles that are off-screen
            if (particle.y > confettiCanvas.height) {
                confettiParticles.splice(index, 1);
            }

            // Draw particle
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
            // Clear canvas after animation
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
    playerBox.classList.add('player-box', 'winner-box');  // Add winner styling

    // Create the crown icon using Remixicon
    const crown = document.createElement('i');
    crown.classList.add('ri-vip-crown-fill', 'crown-icon');  // Apply Remixicon crown

    const img = document.createElement('img');
    img.classList.add('player-avatar', 'winner-avatar');  // Golden border around avatar
    img.id = username;
    img.src = '/static/default-avatar.png';  // Default avatar for winner

    const name = document.createElement('span');
    name.textContent = username;
    name.classList.add('player-name');

    playerBox.appendChild(crown);  // Add crown icon on top
    playerBox.appendChild(img);    // Add avatar with golden border
    playerBox.appendChild(name);   // Add username

    return playerBox;
}
