function generateTournament(players) {
  const tournamentContainer = document.createElement('div');
  tournamentContainer.classList.add('tournament-container');
  
  // Create the current round section
  const currentRound = document.createElement('div');
  currentRound.classList.add('current-round');
  
  players.forEach(pair => {
    // Create player boxes for each pair
    const playerBox1 = createPlayerBox(pair.p1);
    const playerBox2 = createPlayerBox(pair.p2);
    
    currentRound.appendChild(playerBox1);
    const line = createLine(); // Optional: Create a line between player pairs
    currentRound.appendChild(line);
    currentRound.appendChild(playerBox2);
  });

  tournamentContainer.appendChild(currentRound);

  // Create the next round section (empty boxes for the winners)
  const nextRound = document.createElement('div');
  nextRound.classList.add('next-round');
  
  const futureBoxCount = players.length / 2;
  for (let i = 0; i < futureBoxCount; i++) {
    const futureBox = createFutureBox();
    nextRound.appendChild(futureBox);
    if (i < futureBoxCount - 1) {
      const line = createLine(); // Optional: Line between future boxes
      nextRound.appendChild(line);
    }
  }

  tournamentContainer.appendChild(nextRound);

  document.body.appendChild(tournamentContainer); // Append the entire structure to the body
}

// Helper function to create a player box
function createPlayerBox(player) {
  const playerBox = document.createElement('div');
  playerBox.classList.add('player-box');
  
  const img = document.createElement('img');
  img.src = player.avatar;
  img.alt = player.username;
  img.classList.add('player-avatar');
  
  const name = document.createElement('span');
  name.textContent = player.username;
  name.classList.add('player-name');
  
  playerBox.appendChild(img);
  playerBox.appendChild(name);
  
  return playerBox;
}

// Helper function to create a future box with ???
function createFutureBox() {
  const futureBox = document.createElement('div');
  futureBox.classList.add('future-box');
  futureBox.textContent = '???';
  return futureBox;
}

// Helper function to create a line between boxes (optional)
function createLine() {
  const line = document.createElement('div');
  line.classList.add('line');
  return line;
}
