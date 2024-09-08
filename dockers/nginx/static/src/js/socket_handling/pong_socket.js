let socket;

export async function initPongSocket(content) {
	let roomId = content.roomID;
	let room_size = content.playerCount;
	let winning_score = content.winning_score;
	let player_names = content.player_names;
	let is_bot = content.is_bot;
	let difficulty = content.difficulty;
	let tournamentID = content.tournamentID;

    return new Promise((resolve, reject) => {

        socket = new WebSocket(`wss://${window.location.host}/ws/pong/${roomId}/`);
		let pov;

        socket.onopen = function() {
            console.log('Pong WebSocket connection opened.');
            if (socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({
					type: 'initial_data',
					'room_size': room_size,
					'winning_score': winning_score,
					'player_names': player_names,
					'is_bot': is_bot,
					'difficulty': difficulty,
					'partOfTournament': content.partOfTournament,
					'tournamentID': tournamentID,
				}));
			} else {
				console.error('Pong WebSocket is not open yet.');
			}
        };

		socket.onmessage = function(event) {
			// Handle JSON data
			if (typeof event.data === "string") {
				try {
					const data = JSON.parse(event.data);
					pov = data.pov;
					if (pov !== undefined) {
						resolve({ pov, socket });
					}
				} catch (e) {
					console.error('Pong Failed to parse JSON:', e, 'Received data:', event.data);
				}
			}
		};


        socket.onerror = function(error) {
            console.error('Pong WebSocket error:', error);
            setTimeout(() => initPongSocket(content).then(resolve).catch(reject), 2000);
        };

        socket.onclose = function() {
            console.log('Pong WebSocket connection closed.');
        };
    });
}

export function getPongSocket() {
	return socket;
}
