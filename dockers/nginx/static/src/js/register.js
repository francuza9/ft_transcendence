import {handleRouting} from '/static/routers/router.js';
import {getCookie} from '/static/src/js/cookies.js';

export const registerButton = () => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirmation = document.getElementById('password-confirmation').value;

    console.log(username, email);

    if (!username || !email || !password || !passwordConfirmation) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== passwordConfirmation) {
        alert('Passwords do not match');
        return;
    }

    const csrftoken = getCookie('csrftoken');

    fetch('/api/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
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

export function addRegisterListeners() {
    const form = document.querySelector('.register-box form');
    const registerButton = document.querySelector('button[data-action="register"]');

    if (form && registerButton) {
        form.addEventListener('submit', handleFormSubmit);
        form.addEventListener('keypress', handleKeyPress);
    }
}

export function observeRegisterForm() {
    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const form = document.querySelector('.register-box form');
                const registerButton = document.querySelector('button[data-action="register"]');
                if (form && registerButton) {
                    addRegisterListeners();
                    observer.disconnect();
                    break;
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

export function removeRegisterListeners() {
    const form = document.querySelector('.register-box form');

    if (form) {
        form.removeEventListener('submit', handleFormSubmit);
        form.removeEventListener('keypress', handleKeyPress);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    registerButton();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        registerButton();
    }
}
