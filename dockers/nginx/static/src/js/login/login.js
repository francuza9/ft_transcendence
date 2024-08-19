import {handleRouting} from '/static/routers/router.js';
import {variables} from '/static/src/js/variables.js';
import {replaceHTML} from '/static/src/js/utils.js';
import {getCookie} from '/static/src/js/cookies.js';

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
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
        // Fetch CSRF token from the cookie
        const csrftoken = getCookie('csrftoken');

        fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,  // Include CSRF token here
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Login successful');
				if (variables.nextPage == 'room') {
					history.pushState(null, '', '/');
					handleRouting();
					replaceHTML('/static/src/html/room.html', false);
				} else {
					history.pushState(null, '', '/');
					handleRouting();
				}
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

export const loginWithGithubButton = () => {
    console.log('Login with GitHub');
}

export const loginWith42Button = () =>  {
    console.log('Login with 42');
}
