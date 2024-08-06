export async function Register()
{
    const body = document.getElementsByTagName('body')[0];

    try {
        const response = await fetch('/static/src/html/register.html');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const htmlContent = await response.text();
        body.innerHTML = htmlContent;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }

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

    return body;
}
