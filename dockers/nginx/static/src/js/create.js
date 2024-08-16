import {replaceHTML} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';
import {checkLoginStatus} from '/static/src/js/utils.js';
import {refreshLobbyDetails} from '/static/src/js/lobby.js';

export const setDefaultRoomName = () => {
    const displayTitle = document.getElementById('display-title');

    const ensureUsername = () => {
        if (variables.username) {
            return Promise.resolve();
        } else {
            return checkLoginStatus().then(loggedIn => {
                if (!loggedIn) {
                    variables.username = 'Guest';
                }
                return;
            }).catch(error => {
                console.error('Error checking login status:', error);
                variables.username = 'Guest';
            });
        }
    };

    ensureUsername().then(() => {
        variables.roomName = `${variables.username}'s room`;
        displayTitle.textContent = variables.roomName;
    });
};

export const updatePlayerCount = (document, value) => {
	variables.maxPlayerCount = parseInt(value, 10);
	const dropdownButton = document.getElementById('btnGroupDrop1');
	dropdownButton.textContent = `${variables.maxPlayerCount}`;
}

export const updateIsTournament = (document, value) => {
	variables.isTournament = value;
    const radioButtons = document.querySelectorAll('.btn-group .btn-check');
	const classicButton = radioButtons[0].nextElementSibling;
	const tournamentButton = radioButtons[1].nextElementSibling;

	if (value) {
		tournamentButton.classList.add('active');
		classicButton.classList.remove('active');
	} else {
		tournamentButton.classList.remove('active');
		classicButton.classList.add('active');
	}
}

export const editNameButton = () => {
    const displayMode = document.querySelector('.display-mode');
    const editForm = document.getElementById('edit-form');
    const titleInput = document.getElementById('title-input');

	displayMode.style.display = 'none';
	editForm.style.display = 'block';
	titleInput.focus();
}

export const saveNameEditButton = (event) => {
    const displayMode = document.querySelector('.display-mode');
    const editForm = document.getElementById('edit-form');
    const titleInput = document.getElementById('title-input');
    const displayTitle = document.getElementById('display-title');

	event.preventDefault();
	const newTitle = titleInput.value.trim();
	if (newTitle) {
		displayTitle.textContent = newTitle;
	}
	editForm.style.display = 'none';
	displayMode.style.display = 'flex';
	variables.roomName = newTitle;
}

export const cancelNameEditButton = () => {
    const displayMode = document.querySelector('.display-mode');
    const editForm = document.getElementById('edit-form');

	editForm.style.display = 'none';
	displayMode.style.display = 'flex';
}

export const playerCountDropdownButton = () => {
	var dropdown = new bootstrap.Dropdown(document.getElementById('btnGroupDrop1'));
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
				variables.username = 'Guest';
			}
		}).catch(error => {
			console.error('Error checking login status:', error);
		});
	}

	try {
        const socket = await initLobbySocket(lobbyId, variables);
	} catch (error) {
        console.error('Failed to initialize WebSocket:', error);
    }

	history.pushState(null, '', `/${data.join_code}`);
	replaceHTML('/static/src/html/lobby.html');
	refreshLobbyDetails(variables.roomName, [variables.username], variables.maxPlayerCount, variables.map, variables.isTournament);

}
