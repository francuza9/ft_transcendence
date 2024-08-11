export async function initializeWebSocket(roomId) {
    return new Promise((resolve, reject) => {
        // const socket = new WebSocket(`wss://localhost/ws/pong/${roomId}/`);
        const socket = new WebSocket(`wss://${window.location.host}/ws/pong/${roomId}/`);
		let pov;

        socket.onopen = function() {
            console.log('Connected to server');
        };

        socket.onmessage = function(event) {
	    // Handle binary data
		if (event.data instanceof ArrayBuffer) {
			return;
		}

	    // Handle JSON data
		try {
			const data = JSON.parse(event.data);
			pov = data.pov;
			if (pov !== undefined) {
				resolve({ pov, socket });
			}
		} catch (e) {
			console.error('Failed to parse JSON:', e);
		}
	};

        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
            setTimeout(() => initializeWebSocket(roomId).then(resolve).catch(reject), 5000); // Retry after 5 seconds
        };

        socket.onclose = function() {
            console.log('WebSocket connection closed.');
        };
    });
}