export async function initPongSocket(roomId, room_size, winning_score) {
    return new Promise((resolve, reject) => {

		console.log("roomId: ", roomId);
        const socket = new WebSocket(`wss://${window.location.host}/ws/pong/${roomId}/`);
		let pov;

        socket.onopen = function() {
            console.log('WebSocket connection opened.');
            if (socket.readyState === WebSocket.OPEN) {
				console.log("winning score: ", winning_score);
				socket.send(JSON.stringify({ type: 'initial_data', 'room_size': room_size, 'winning_score': winning_score }));
			} else {
				console.error('WebSocket is not open yet.');
			}
        };

		socket.onmessage = function(event) {
			// Handle binary data
			// if (event.data instanceof ArrayBuffer) {
			// 	// Process the binary data as needed
			// 	return;
			// }
			
			// Handle JSON data
			if (typeof event.data === "string") {
				try {
					const data = JSON.parse(event.data);
					pov = data.pov;
					if (pov !== undefined) {
						resolve({ pov, socket });
					}
				} catch (e) {
					console.error('Failed to parse JSON:', e, 'Received data:', event.data);
				}
			}
		};


        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
            setTimeout(() => initPongSocket(roomId, room_size, winning_score).then(resolve).catch(reject), 2000); // retry every 2 seconds
        };

        socket.onclose = function() {
            console.log('WebSocket connection closed.');
        };
    });
}