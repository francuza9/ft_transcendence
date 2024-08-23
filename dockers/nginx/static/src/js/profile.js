import {ensureUsername} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';

export async function viewProfile(player) {
	try {
		const playerData = await getPlayerData(player);

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
			closeButton.className = 'btn-close btn-close-white';
			closeButton.setAttribute('data-bs-dismiss', 'modal');
			closeButton.setAttribute('aria-label', 'Close');
			closeButton.style.position = 'absolute';
			closeButton.style.top = '10px';
			closeButton.style.right = '10px';

			const headerRow = document.createElement('div');
			headerRow.className = 'd-flex align-items-center p-3 text-white';

			const avatarImg = document.createElement('img');
			avatarImg.src = playerData.avatarUrl || 'default-avatar.png';
			avatarImg.alt = `${playerData.username}'s avatar`;
			avatarImg.className = 'rounded-circle me-3';
			avatarImg.style.width = '60px';
			avatarImg.style.height = '60px';
			avatarImg.style.objectFit = 'cover';

			const nameContainer = document.createElement('div');
			nameContainer.innerHTML = `
				<h5 class="mb-0">${displayName} ${usernameText}</h5>
			`;

			headerRow.appendChild(avatarImg);
			headerRow.appendChild(nameContainer);
			headerRow.appendChild(closeButton);

			const bioRow = document.createElement('div');
			bioRow.className = 'p-1';
			bioRow.innerHTML = playerData.bio ? `<p class="mb-0">${playerData.bio}</p>` : '';

			const buttonsRow = document.createElement('div');
			buttonsRow.className = 'd-flex justify-content-around py-3';

			const friendButton = document.createElement('button');
			friendButton.className = `btn ${playerData.isFriend ? 'btn-danger' : 'btn-success'}`;
			friendButton.setAttribute('data-variable', playerData.isFriend ? 'unfriendUser' : 'addFriend');
			friendButton.setAttribute('data-value', playerData.username);
			friendButton.innerHTML = `
				<i class="${playerData.isFriend ? 'ri-user-unfollow-line' : 'ri-user-add-line'}"></i>
				${playerData.isFriend ? 'Unfriend' : 'Add Friend'}
			`;

			const chatButton = document.createElement('button');
			chatButton.className = 'btn btn-primary';
			chatButton.setAttribute('data-variable', 'chatWithUser');
			chatButton.setAttribute('data-value', playerData.username);
			chatButton.innerHTML = `<i class="ri-chat-3-line"></i> Chat`;

			const blockButton = document.createElement('button');
			blockButton.className = 'btn btn-primary';
			blockButton.setAttribute('data-variable', 'blockUser');
			blockButton.setAttribute('data-value', playerData.username);
			blockButton.innerHTML = `<i class="ri-user-forbid-line"></i> Block`;

			buttonsRow.appendChild(friendButton);
			buttonsRow.appendChild(chatButton);
			buttonsRow.appendChild(blockButton);

			const statsRow = document.createElement('div');
			statsRow.className = 'row text-center py-3';

			const gamesTitle = document.createElement('h6');
			gamesTitle.className = 'text-uppercase mb-3';
			gamesTitle.textContent = 'Games';

			const playedCol = createStatColumn('Played', playerData.gamesPlayed);
			const wonCol = createStatColumn('Won', playerData.gamesWon);
			const lostCol = createStatColumn('Lost', playerData.gamesLost);

			statsRow.appendChild(playedCol);
			statsRow.appendChild(wonCol);
			statsRow.appendChild(lostCol);

			modalHeader.appendChild(headerRow);
			modalBody.appendChild(bioRow);
			modalBody.appendChild(buttonsRow);
			modalBody.appendChild(statsRow);

			ensureUsername().then(() => {
				console.log(variables.username, '===', playerData.username);
				if ((variables.username === playerData.username) || variables.username) {
					buttonsRow.style.visibility = 'hidden';
					buttonsRow.style.height = '0';
				}
			});

			const modal = new bootstrap.Modal(document.getElementById('playerProfileModal'));
			modal.show();
		} else {
			console.log('No data for', player);
		}
	} catch (error) {
		console.error('Error displaying player profile:', error);
	}
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

export function showPlayerPreview(row, playerId) {
	const preview = document.createElement('div');
	preview.className = 'player-preview-tooltip';
	preview.textContent = `Preview for ${playerId}`;
	document.body.appendChild(preview);

	const rect = row.getBoundingClientRect();
	preview.style.position = 'absolute';
	preview.style.top = `${rect.top - preview.offsetHeight}px`;
	preview.style.left = `${rect.left}px`;
	preview.style.zIndex = '1000';
	preview.style.backgroundColor = '#fff';
	preview.style.border = '1px solid #ccc';
	preview.style.padding = '5px';
	preview.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';

	row._previewTooltip = preview;
}

export function hidePlayerPreview(row) {
	if (row._previewTooltip) {
		row._previewTooltip.remove();
		row._previewTooltip = null;
	}
}

export function addFriend(player) {
	console.log('adding friend', player);
}

export function unfriendUser(player) {
	console.log('unfriending', player);
}

export function chatWithUser(player) {
	console.log('chating with', player);
}

export function blockUser(player) {
	console.log('blocking', player);
}
