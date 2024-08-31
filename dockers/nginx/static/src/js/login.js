import {handleRouting} from '/static/routers/router.js';
import {variables} from '/static/src/js/variables.js';
import {replaceHTML} from '/static/src/js/utils.js';
import {getCookie} from '/static/src/js/cookies.js';
import {removeRegisterListeners} from '/static/src/js/register.js';
import {goActive} from '/static/src/js/socket_handling/global_socket.js';

export const goBackFromLogin = () => {
	if (!variables.previousPage) {
		variables.previousPage = '/';
	}
	else if (variables.previousPage == 'online') {
		history.pushState(null, '', '/');
		handleRouting();
		replaceHTML('/static/src/html/online.html', false);
	} else {
		history.pushState(null, '', variables.previousPage);
		if (variables.previousPage == '/login' || variables.previousPage == '/register')
			variables.previousPage = '/';
		handleRouting();
	}
	removeLoginListeners();
    removeRegisterListeners();
}

export const goToRegister = () => {
	variables.previousPage = '/login';
	history.pushState(null, '', '/register');
	handleRouting();
}

export const goToLogin = () => {
	variables.previousPage = '/register';
	history.pushState(null, '', '/login');
	handleRouting();
}
	
export const loginButton = () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (email && password) {

        fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Login successful');
				// closeSettingsButton(); # TODO: fix this
				goActive();
				if (variables.nextPage == 'room') {
					history.pushState(null, '', '/');
					handleRouting();
					replaceHTML('/static/src/html/room.html', false);
				} else {
					history.pushState(null, '', '/');
					handleRouting();
				}
				removeLoginListeners();
            } else {
                console.error('Login failed:', data.message);
                alert('Login failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during login');
        });
    } else {
        alert('Please enter both email and password');
    }
};

function addLoginListeners() {
    const form = document.querySelector('.login-box form');
    const loginButton = document.querySelector('button[data-action="login"]');

    if (form && loginButton) {
        form.addEventListener('submit', handleFormSubmit);
        form.addEventListener('keypress', handleKeyPress);
    }
}

export function observeLoginForm() {
    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const form = document.querySelector('.login-box form');
                const loginButton = document.querySelector('button[data-action="login"]');
                if (form && loginButton) {
                    addLoginListeners();
                    observer.disconnect();
                    break;
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

export function removeLoginListeners() {
    const form = document.querySelector('.login-box form');

    if (form) {
        form.removeEventListener('submit', handleFormSubmit);
        form.removeEventListener('keypress', handleKeyPress);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
	loginButton();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
		loginButton();
    }
}

export const loginWith42Button = () =>  {
    console.log('Login with 42');
	let client_id;
	const redirectUri = 'https://api.intra.42.fr/oauth/authorize';
	window.location.href = redirectUri;
}

export const loginWithGithubButton = () => {
	console.log('Redirecting to GitHub for login...');
	const clientId = 'Ov23li5k50XUjRjLs4bc';
	// const redirectUri = 'https://${window.location.host}/api/github/';
	const redirectUri = 'https://localhost/api/github/';
	const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
	window.location.href = githubAuthUrl;
}
