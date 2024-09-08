import { ensureUsername, isGuest, moveModalBackdrops } from '/static/src/js/utils.js';
import { variables } from '/static/src/js/variables.js';

export async function viewProfile(event, player) {
	try {
		if (!player) player = variables.username;

		const playerData = await getPlayerData(player);
		const isOnline = variables.activeUsers[player];

		if (playerData) {
			const modalHeader = document.querySelector('#playerProfileModal .modal-header');
			const modalBody = document.querySelector('#playerProfileModal .modal-body');

			modalHeader.innerHTML = '';
			modalBody.innerHTML = '';

			const displayName = playerData.displayName || playerData.username;
			const isDisplayNameDifferent = playerData.displayName && playerData.displayName !== playerData.username;
			const usernameText = isDisplayNameDifferent ? `<small class="username-text">@${playerData.username}</small>` : '';

			const closeButton = document.createElement('button');
			closeButton.type = 'button';
			closeButton.id = 'close-profile';
			closeButton.className = 'btn-close btn-close-white';
			closeButton.setAttribute('data-bs-dismiss', 'modal');
			closeButton.setAttribute('aria-label', 'Close');

			const headerRow = document.createElement('div');
			headerRow.className = 'd-flex align-items-center p-3 text-white';

			const avatarImg = document.createElement('img');
			avatarImg.src = playerData.avatarUrl || 'default-avatar.png';
			avatarImg.alt = `${playerData.username}'s avatar`;
			avatarImg.className = 'rounded-circle me-3';
			avatarImg.style.width = '60px';
			avatarImg.style.height = '60px';
			avatarImg.style.objectFit = 'cover';

			const avatarContainer = document.createElement('div');
			avatarContainer.appendChild(avatarImg);

			if (isOnline) {
				const statusIndicator = document.createElement('span');
				statusIndicator.classList.add('status-indicator', 'online');
				avatarContainer.appendChild(statusIndicator);
			}

			const nameContainer = document.createElement('div');
			nameContainer.innerHTML = `<h5 class="mb-0">${displayName} ${usernameText}</h5>`;

			const backButton = document.createElement('button');
			backButton.type = 'button';
			backButton.id = 'back-button';
			backButton.className = 'back-btn hidden';
			backButton.innerHTML = `<i class="ri-arrow-left-line"></i>`;
			backButton.addEventListener('click', () => {
				const matchHistoryTable = document.getElementById('match-history');
				if (matchHistoryTable) {
					matchHistoryTable.remove();
				}
				buttonsRow.classList.remove('hidden');
				statsRow.classList.remove('hidden');
				bioRow.classList.remove('hidden');
				backButton.classList.add('hidden');
			});

			headerRow.appendChild(backButton);
			headerRow.appendChild(avatarContainer);
			headerRow.appendChild(nameContainer);
			headerRow.appendChild(closeButton);

			const bioRow = document.createElement('div');
			bioRow.className = 'p-1';
			bioRow.innerHTML = playerData.bio ? `<p class="mb-0">${playerData.bio}</p>` : '';

			const buttonsRow = document.createElement('div');
			buttonsRow.className = 'py-3';

			const friendButton = document.createElement('button');
			friendButton.setAttribute('data-value', playerData.username);
			if (playerData.friendRequestSent || playerData.friendRequestReceived) {
				friendButton.className = `btn ${playerData.friendRequestSent ? 'btn-danger' : 'btn-success'}`;
				friendButton.setAttribute('data-variable', playerData.friendRequestSent ? 'unsendFriendRequest' : 'acceptFriendRequest');
				friendButton.innerHTML = `
					<i class="${playerData.friendRequestSent ? 'ri-subtract-fill' : 'ri-user-add-line'}"></i>
					${playerData.friendRequestSent ? 'Unsend Friend Request' : 'Accept Friend Request'}
				`;
			} else {
				friendButton.className = `btn ${playerData.areFriends ? 'btn-danger' : 'btn-success'}`;
				friendButton.setAttribute('data-variable', playerData.areFriends ? 'unfriendUser' : 'addFriend');
				friendButton.innerHTML = `
					<i class="${playerData.areFriends ? 'ri-user-unfollow-line' : 'ri-user-add-line'}"></i>
					${playerData.areFriends ? 'Unfriend' : 'Add Friend'}
				`;
			}

			const blockButton = document.createElement('button');
			blockButton.className = 'btn btn-primary';
			blockButton.setAttribute('data-variable', playerData.isBlocked ? 'unblockUser' : 'blockUser');
			blockButton.setAttribute('data-value', playerData.username);
			blockButton.innerHTML = `<i class="${playerData.isBlocked ? 'ri-close-fill' : 'ri-user-forbid-line'}"></i>
				${playerData.isBlocked ? 'Unblock' : 'Block'}
			`;

			friendButton.setAttribute('data-bs-dismiss', 'modal');
			blockButton.setAttribute('data-bs-dismiss', 'modal');

			if (!(playerData.isBlocked || playerData.hasBlocked)) {
				buttonsRow.appendChild(friendButton);
			}
			buttonsRow.appendChild(blockButton);

			const statsRow = document.createElement('div');
			statsRow.className = 'row text-center py-3';
			statsRow.id = 'games';

			const playedCol = createStatColumn('Played', playerData.gamesPlayed);
			const wonCol = createStatColumn('Won', playerData.gamesWon);
			const lostCol = createStatColumn('Lost', playerData.gamesLost);

			statsRow.appendChild(playedCol);
			statsRow.appendChild(wonCol);
			statsRow.appendChild(lostCol);

			statsRow.addEventListener('click', async () => {
				buttonsRow.classList.add('hidden');
				statsRow.classList.add('hidden');
				bioRow.classList.add('hidden');
				backButton.classList.remove('hidden');

				const matchHistoryTableContainer = await createMatchHistoryTable(player);
				matchHistoryTableContainer.classList.add('match-history-table');
				modalBody.appendChild(matchHistoryTableContainer);
			});

			modalHeader.appendChild(headerRow);
			modalBody.appendChild(bioRow);
			modalBody.appendChild(buttonsRow);
			modalBody.appendChild(statsRow);

			ensureUsername().then(() => {
				if ((variables.username === playerData.username) || isGuest(variables.username)) {
					buttonsRow.classList.add('hidden');
				}
			});

			const profileModal = new bootstrap.Modal(document.getElementById('playerProfileModal'));
			profileModal.show();
			moveModalBackdrops();
		} else {
			console.log('No data for', player);
		}
	} catch (error) {
		console.error('Error displaying player profile:', error);
	}
}

async function createMatchHistoryTable(player) {
    const response = await fetch(`/api/match_history/${player}`);
    const matchHistory = await response.json();

    const table = document.createElement('table');
    table.className = 'table table-hover text-center';
    table.id = 'match-history';

    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Player 1</th>
        <th>Player 2</th>
        <th>Winner</th>
        <th>Score</th>
        <th>Date</th>
    `;
    table.appendChild(headerRow);

    matchHistory.forEach(match => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${match.player1}</td>
            <td>${match.player2}</td>
            <td>${match.winner || 'N/A'}</td>
            <td>${match.player1Score} - ${match.player2Score}</td>
            <td>${new Date(match.date).toLocaleDateString()}</td>
        `;
        table.appendChild(row);
    });

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    tableContainer.appendChild(table);

    return tableContainer;
}

function createStatColumn(label, value) {
	const col = document.createElement('div');
	col.className = 'col';
	col.innerHTML = `
		<h6 class="mb-0">${value}</h6>
		<small>${label}</small>
	`;
	return col;
}

async function getPlayerData(player) {
	if (isGuest(player)) return null;
	try {
		const response = await fetch(`/api/profile_info/${player}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		return result;

	} catch (error) {
		console.error('There was a problem fetching player data:', error);
		return null;
	}
}
