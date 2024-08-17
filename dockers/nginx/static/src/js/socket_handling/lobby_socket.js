import {refreshLobbyDetails} from '/static/src/js/lobby.js';
import {checkLoginStatus} from '/static/src/js/utils.js';
import {handleRouting} from '/static/routers/router.js';

export async function initLobbySocket(variables) {

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


    return new Promise((resolve, reject) => {
        const socket = new WebSocket(`wss://${window.location.host}/ws/${variables.lobbyId}`);

        socket.onopen = function() {
            console.log('WebSocket connection opened.');
			ensureUsername().then(() => {
				socket.send(JSON.stringify({ type: 'init', content: variables }));
			});
        };

	socket.onmessage = function(event) {
		const message = JSON.parse(event.data);

		//console.log(message.type);

		if (message.type === 'refresh') {
			const content = message.content;

			if (content && content.players) {
				variables.players = content.players;
				variables.admin = content.admin;
				variables.map = content.map;
				variables.maxPlayerCount = content.maxPlayerCount;
				variables.roomName = content.roomName;
				variables.isTournament = content.isTournament;
				//console.log(variables);

				refreshLobbyDetails(variables);
			} else {
				console.error('Content or players undefined!', content);
			}
		}
		else if (message.type === 'redirect') {
			history.pushState(null, '', `/join`);
			handleRouting();
		}
	};


        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
            setTimeout(() => initLobbySocket(variables).then(resolve).catch(reject), 2000); // retry every 2 seconds
        };

        socket.onclose = function() {
            console.log('WebSocket connection closed.');
        };
    });
}
