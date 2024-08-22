export async function Bot(roomID) {

	let pov;
	let socket;

	try {
        ({ pov, socket } = await initBotSocket(roomID));
	} catch (error) {
        console.error('Failed to initialize WebSocket:', error);
    }

	socket.addEventListener('message', function(event) {
		if (typeof event.data === "string") {
			const message = JSON.parse(event.data);

			if (message.type === 'bot_start') {
			} else if (message.type === 'error') {
				console.error('Error:', message.content);
			}
		}
	});

	socket.send(JSON.stringify({ type: 'bot_joined', content: {'pov': pov} }));


}

export async function initBotSocket(roomID) {
    return new Promise((resolve, reject) => {

        const socket = new WebSocket(`wss://${window.location.host}/ws/pong/${roomID}/`);
		let pov;

        socket.onopen = function() {
            console.log('Bot WebSocket connection opened.');
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
					console.error('Bot Failed to parse JSON:', e, 'Received data:', event.data);
				}
			}
		};

        socket.onerror = function(error) {
            console.error('Bot WebSocket error:', error);
            setTimeout(() => initBotSocket(roomID).then(resolve).catch(reject), 2000); // retry every 2 seconds
        };

        socket.onclose = function() {
            console.log('Bot WebSocket connection closed.');
        };
    });
}