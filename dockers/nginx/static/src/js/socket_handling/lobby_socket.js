import { initLobby } from '/static/src/js/lobby.js';

export async function initLobbySocket(lobbyId) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(`wss://${window.location.host}/ws/${lobbyId}`);

        socket.onopen = function() {
            console.log('WebSocket connection opened.');
			initLobby();
        };

        socket.onmessage = function(event) {
		const message = JSON.parse(event.data);
		console.log('Received message:', message);
		if (message.type === 'refresh') {
			console.log('refreshing lobby');
			initLobby();
		}
	};

        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
            setTimeout(() => initLobbySocket(lobbyId).then(resolve).catch(reject), 2000); // retry every 2 seconds
        };

        socket.onclose = function() {
            console.log('WebSocket connection closed.');
        };
    });
}