export async function initPongSocket(roomId, room_size) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(`wss://${window.location.host}/ws/pong/${roomId}`);
		let pov;

        socket.onopen = function() {
            console.log('WebSocket connection opened.');
            if (socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({ type: 'initial_data', 'room_size': room_size }));
			} else {
				console.error('WebSocket is not open yet.');
			}
			console.log('Connected to server');
        };

	socket.onmessage = function(event) {
		// Handle binary data
		if (event.data instanceof ArrayBuffer) {
			// Process the binary data as needed
			return;
		}
		
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
		} else {
			console.error('Unexpected non-JSON message:', event.data);
		}
	};


        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
            setTimeout(() => initPongSocket(roomId, room_size).then(resolve).catch(reject), 2000); // retry every 2 seconds
        };

        socket.onclose = function() {
            console.log('WebSocket connection closed.');
        };
    });
}