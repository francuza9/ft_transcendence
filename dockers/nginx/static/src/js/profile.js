import {ensureUsername, isGuest, moveModalBackdrops} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';

export async function viewProfile(event, player) {
	try {
		if (!player)
			player = variables.username;

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
			closeButton.id = 'close-profile';
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

			if (!(playerData.isBlocked || playerData.hasBlocked))
				buttonsRow.appendChild(friendButton);
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
				if ((variables.username === playerData.username) || isGuest(variables.username)) {
					buttonsRow.style.visibility = 'hidden';
					buttonsRow.style.height = '0';
				}
			});

			const manageFriendsModal = document.getElementById('manage-friends-modal');
			const profileModalElement = document.getElementById('playerProfileModal');
			const profileModal = new bootstrap.Modal(document.getElementById('playerProfileModal'));

			manageFriendsModal.setAttribute('aria-hidden', 'true');
			manageFriendsModal.style.pointerEvents = 'none';
			profileModal.show();
			manageFriendsModal.style.zIndex = 'auto';
			moveModalBackdrops();
			attachProfileHideEventListener(profileModalElement, manageFriendsModal);
		} else {
			console.log('No data for', player);
		}
	} catch (error) {
		console.error('Error displaying player profile:', error);
	}
}

function attachProfileHideEventListener(profileModal, manageFriendsModal) {
	profileModal.addEventListener('hidden.bs.modal', () => {
		manageFriendsModal.removeAttribute('aria-hidden');
		manageFriendsModal.style.pointerEvents = '';
		manageFriendsModal.style.zIndex = '';
	}, { once: true });
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
	if (isGuest(player))
		return null;
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
