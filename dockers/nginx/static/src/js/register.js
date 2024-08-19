import {handleRouting} from '/static/routers/router.js';
import {getCookie} from '/static/src/js/cookies.js';

export const registerButton = () => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirmation = document.getElementById('password-confirmation').value;

    console.log(username, email);

    // Validate input
    if (!username || !email || !password || !passwordConfirmation) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== passwordConfirmation) {
        alert('Passwords do not match');
        return;
    }

    // Fetch CSRF token from the cookie
    const csrftoken = getCookie('csrftoken');

    // Send registration data to the server
    fetch('/api/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,  // Include CSRF token here
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Registration successful');
            alert('Registration successful! You can now log in.');
            history.pushState(null, '', '/login');
            handleRouting();
        } else {
            console.error('Registration failed:', data.message);
            alert('Registration failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during registration');
    });
};
