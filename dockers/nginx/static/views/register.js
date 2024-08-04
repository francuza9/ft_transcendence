export function Register() {
    const element = document.createElement('div');
    element.innerHTML = `
        <div class="register-form">
            <h2>Register</h2>
            <form id="register-form">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" placeholder="Enter your username" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required>
                </div>
                <button type="submit">Register</button>
            </form>
            <div id="register-result"></div>
        </div>
    `;

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

    return element;
}
