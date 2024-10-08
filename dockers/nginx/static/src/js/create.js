import {variables} from '/static/src/js/variables.js';
import {checkLoginStatus, guestLogin, ensureUsername} from '/static/src/js/utils.js';
import {Lobby} from '/static/views/lobby.js';
import {getTranslation} from '/static/src/js/lang.js';

export const setDefaultRoomName = () => {
    const displayTitle = document.getElementById('display-title');
	const titleInput = document.getElementById('title-input');

    ensureUsername().then(() => {
        variables.roomName = `${variables.username}'s room`;
        displayTitle.textContent = variables.roomName;
		titleInput.value = variables.roomName;
    });
};

export const updatePlayerCount = (document, value) => {
	variables.maxPlayerCount = parseInt(value, 10);
	const dropdownButton = document.getElementById('btnGroupDrop1');
	dropdownButton.textContent = `${variables.maxPlayerCount} ${getTranslation('pages.createRoom.players')}`;
}

export const updatePointsToWin = (document, value) => {
	variables.pointsToWin = parseInt(value, 10);
	const dropdownButton = document.getElementById('btnGroupDrop2');
	dropdownButton.textContent = `${variables.pointsToWin} ${getTranslation('pages.createRoom.pointsToWin')}`;
}

export const updateIsTournament = (document, value) => {
	const mapSection = document.getElementById('map');
	const dropdownButton = document.getElementById('btnGroupDrop1');
    variables.isTournament = value === 'true';

	if (variables.isTournament) {
		variables.maxPlayerCount = 4;
		dropdownButton.textContent = `${variables.maxPlayerCount} ${getTranslation('pages.createRoom.players')}`;
		mapSection.classList.add('hidden');
	} else {
		variables.maxPlayerCount = 2;
		dropdownButton.textContent = `${variables.maxPlayerCount} ${getTranslation('pages.createRoom.players')}`;
		mapSection.classList.remove('hidden');
	}
}

export const editNameButton = () => {
    const displayMode = document.querySelector('.display-mode');
    const editForm = document.getElementById('edit-form');
    const titleInput = document.getElementById('title-input');
	const errorElement = document.getElementById('title-error');

	errorElement.textContent = '';
	errorElement.style.display = 'none';

	displayMode.style.display = 'none';
	editForm.style.display = 'block';
	titleInput.focus();
}

export const saveNameEditButton = (event) => {
    const displayMode = document.querySelector('.display-mode');
	const titleInput = document.getElementById('title-input');
    const displayTitle = document.getElementById('display-title');
	const errorElement = document.getElementById('title-error');

	event.preventDefault();
	errorElement.textContent = '';
	errorElement.style.display = 'none';
	
	const newTitle = titleInput.value.trim();
	if (newTitle) {
		if (newTitle.length > 20) {
			const errorElement = document.getElementById('title-error');
			errorElement.textContent = 'Room name is too long';
			errorElement.style.display = 'block';
			return;
		}
		displayTitle.textContent = newTitle;
		variables.roomName = newTitle;
		const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editNameModal'));
		if (modalInstance) {
			modalInstance.hide();
		}
		setTimeout(() => {
			const backdrop = document.querySelector('.modal-backdrop');
			if (backdrop) {
				backdrop.remove();
			}
			}, 20);
	}
}

export const cancelNameEditButton = () => {
    const displayMode = document.querySelector('.display-mode');
    const editForm = document.getElementById('edit-form');

	editForm.style.display = 'none';
	displayMode.style.display = 'flex';
}

export const playerCountDropdownButton = () => {
    const dropdownMenu = document.getElementById('player-dropdown');
    const isTournament = variables.isTournament;

    if (dropdownMenu) {
        dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
            item.classList.remove('d-none');
        });

        if (isTournament) {
            dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
                const value = item.getAttribute('data-value');
                if (value !== '4' && value !== '8') {
                    item.classList.add('d-none');
                }
            });
        }
    }

	var dropdown = new bootstrap.Dropdown(document.getElementById('btnGroupDrop1'));
	dropdown.toggle();
}

export const pointsDropdownButton = () => {
	var dropdown = new bootstrap.Dropdown(document.getElementById('btnGroupDrop2'));
	dropdown.toggle();
}

export const selectMapButton = () => {
	const activeSlide = document.querySelector('#carouselExampleCaptions .carousel-item.active');
	const mapName = activeSlide.querySelector('h5').textContent;

	variables.map = mapName;
	document.getElementById('display-map').innerText = mapName;
}

export async function createRoomButton() {
	if (!variables.username)
	{
		checkLoginStatus().then(loggedIn => {
			if (!loggedIn) {
				guestLogin();
			}
		}).catch(error => {
			console.error('Error checking login status:', error); 
		});
	}

	await fetch('/api/create_lobby/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			variables.lobbyId = data.join_code;
			history.pushState(null, '', `/${data.join_code}`);
			variables.players = [variables.username];
			Lobby([data.join_code], true);

		} else {
			console.error('Failed to create room:', data.message);	
		}
	})
}
