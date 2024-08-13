import {handleRouting} from '/static/routers/router.js';
import {variables} from '/static/src/js/variables.js';
import {replaceHTML} from '/static/src/js/utils.js';

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
					if (variables.pageHistory.length > 0)
						variables.pageHistory.pop();
					history.pushState(null, '', '/');
					handleRouting();
					replaceHTML('/static/src/html/room.html', false);
				} else
				{
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

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
export const loginWithGithubButton = () => {
    console.log('Login with GitHub');
}

export const loginWith42Button = () =>  {
    console.log('Login with 42');
}
