import { replaceHTML } from '/static/src/js/utils.js';

export async function Register()
{
	const element = replaceHTML('/static/src/html/register.html', true); 
    // WebSocket connection
    const registerWS = new WebSocket('wss://localhost/ws/register/');

    const form = element.querySelector('#register-form');
    const resultDiv = element.querySelector('#register-result');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = form.querySelector('#username').value;
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;

        // Send registration data via WebSocket
        registerWS.send(JSON.stringify({
            'username': username,
            'email': email,
            'password': password
        }));
    });

    registerWS.onmessage = function(event) {
        const data = JSON.parse(event.data);
        resultDiv.textContent = data.message;
    };

    registerWS.onerror = function(event) {
        resultDiv.textContent = "Error occurred while connecting to WebSocket.";
    };
}
