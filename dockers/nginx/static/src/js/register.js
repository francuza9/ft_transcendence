import {handleRouting} from '/static/routers/router.js';
import {getCookie} from '/static/src/js/cookies.js';

const commonUsernames = [
	'administrator', 'guest', 'system', 'support', 'superuser', 'moderator', 'operator', 'service', 'manager', 'staff',
	'www', 'root', 'webmaster', 'sysadmin', 'ftp', 'mail', 'postmaster', 'hostmaster', 'server', 'monitor', 'daemon',
	'test', 'tester', 'demo', 'dev', 'developer', 'admin', 'owner', 'manager', 'user', 'username', 'login', 'signup',
	'user1', 'user123', 'anonymous', 'nobody', 'default', 'unknown', 'hacker', 'cracker', 'password', 'security',
]

var alertMessage = 'Alert Message';

// Validation logic for username
function validateUsername() {
    const usernameInput = document.getElementById('username');
    const usernameError = document.getElementById('username-error');
    const username = usernameInput.value.trim();

	if (username === '') {
        usernameError.textContent = '';
		alertMessage = 'Username cannot be empty';
        return false;
    }
    if (username.length < 3) {
        usernameError.textContent = 'Must be at least 3 characters long';
		alertMessage = 'Username must be at least 3 characters long';
        return false;
    } else if (username.length > 12) {
        usernameError.textContent = 'Cannot exceed 12 characters';
		alertMessage = 'Username cannot exceed 12 characters';
        return false;
	} else if (username.includes(' ')) {
		usernameError.textContent = 'Cannot contain spaces';
		alertMessage = 'Username cannot contain spaces';
		return false;
	} else if (!/[a-zA-Z]/.test(username)) {
		usernameError.textContent = 'Must contain at least one letter';
		alertMessage = 'Username must contain at least one letter';
		return false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
		usernameError.textContent = 'Only letters, numbers, and underscores';
		alertMessage = 'Username can only contain letters, numbers, and underscores';
        return false;
	} else if (username[0] === '_' || username[username.length - 1] === '_') {
		usernameError.textContent = 'Cannot start or end with underscore';
		alertMessage = 'Username cannot start or end with underscore';
		return false;
	} else if (/__/.test(username)) {
		usernameError.textContent = 'No consecutive underscores';
		alertMessage = 'Username cannot contain consecutive underscores';
		return false;
	} else if (commonUsernames.includes(username.toLowerCase())) {
		usernameError.textContent = 'Username is too common';
		alertMessage = 'Username is too common';
		return false;
    } else {
        usernameError.textContent = '';
        return true;
    }
}

// Validation logic for email
function validateEmail() {
	const emailInput = document.getElementById('email');
	const emailError = document.getElementById('email-error');
	const email = emailInput.value.trim();
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	if (email === '') {
		emailError.textContent = ''; 
		alertMessage = 'Email cannot be empty';
		return false; 
	}

	if (!emailRegex.test(email)) {
		emailError.textContent = 'Please enter a valid email address';
		alertMessage = 'Please enter a valid email address';
		return false;
	} else {
		emailError.textContent = '';
		return true;
	}
	}

// Validation logic for password
function validatePassword() {
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('password-error');
    const password = passwordInput.value;
	const username = document.getElementById('username').value.trim();

	if (password === '') {
		passwordError.textContent = '';
		alertMessage = 'Please enter a password';
		return false;
	}
    if (password.length < 8) {
        passwordError.textContent = 'Must be at least 8 characters long';
		alertMessage = 'Password must be at least 8 characters long';
        return false;
	} else if (password.length > 32) {
		passwordError.textContent = 'Cannot exceed 32 characters';
		alertMessage = 'Password cannot exceed 32 characters';
		return false;
    } else if (!/[a-z]/.test(password)) {
        passwordError.textContent = 'Must contain at least one lowercase letter';
		alertMessage = 'Password must contain at least one lowercase letter';
        return false;
	} else if (!/[A-Z]/.test(password)) {
		passwordError.textContent = 'Must contain at least one uppercase letter';
		alertMessage = 'Password must contain at least one uppercase letter';
        return false;
	} else if (!/[0-9]/.test(password)) {
        passwordError.textContent = 'Must contain at least one digit';
		alertMessage = 'Password must contain at least one digit';
        return false;
	} else if (username && password.toLowerCase().includes(username.toLowerCase())) {
		passwordError.textContent = 'Password cannot contain username';
		alertMessage = 'Password cannot contain username';
    } else {
        passwordError.textContent = '';
        return true;
    }
}

// Validation logic for password confirmation
function validatePasswordConfirmation() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('password-confirmation');
    const confirmPasswordError = document.getElementById('password-confirmation-error');

	if (confirmPasswordInput.value === '') {
		confirmPasswordError.textContent = '';
		alertMessage = 'Please enter Password confirmation';
		return false;
	}
    if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.textContent = 'Passwords do not match';
		alertMessage = 'Passwords do not match';
        return false;
    } else {
        confirmPasswordError.textContent = '';
        return true;
    }
}

// Add event listeners for real-time validation
function addRegisterListeners() {
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmationInput = document.getElementById('password-confirmation');

    usernameInput.addEventListener('blur', validateUsername);
    usernameInput.addEventListener('input', validateUsername);

    emailInput.addEventListener('blur', validateEmail);
    emailInput.addEventListener('input', validateEmail);

    passwordInput.addEventListener('blur', validatePassword);
    passwordInput.addEventListener('input', validatePassword);

    passwordConfirmationInput.addEventListener('blur', validatePasswordConfirmation);
    passwordConfirmationInput.addEventListener('input', validatePasswordConfirmation);

    const form = document.querySelector('.register-box form');
    form.addEventListener('submit', handleFormSubmit);
    form.addEventListener('keypress', handleKeyPress);
}

// Remove event listeners when they are no longer needed
export function removeRegisterListeners() {
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmationInput = document.getElementById('password-confirmation');
    const form = document.querySelector('.register-box form');

	if (usernameInput) {
		usernameInput.removeEventListener('blur', validateUsername);
		usernameInput.removeEventListener('input', validateUsername);
	}

	if (emailInput) {
		emailInput.removeEventListener('blur', validateEmail);
		emailInput.removeEventListener('input', validateEmail);
	}
	if (passwordInput) {
		passwordInput.removeEventListener('blur', validatePassword);
		passwordInput.removeEventListener('input', validatePassword);
	}
	if (passwordConfirmationInput) {
		passwordConfirmationInput.removeEventListener('blur', validatePasswordConfirmation);
		passwordConfirmationInput.removeEventListener('input', validatePasswordConfirmation);
	}
	if (form) {
		form.removeEventListener('submit', handleFormSubmit);
		form.removeEventListener('keypress', handleKeyPress);
	}
}

// Handle form submission and validation
function handleFormSubmit(event) {
    event.preventDefault();
	registerButton();
}

// Handle pressing Enter key
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleFormSubmit(event);
    }
}

// Main register button handler for API call
export const registerButton = () => {

	if (!validateUsername() || !validateEmail() || !validatePassword() || !validatePasswordConfirmation()) {
		alert(alertMessage);
		return;
	}

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
	const passwordConfirmation = document.getElementById('password-confirmation').value;

    const csrftoken = getCookie('csrftoken');

    fetch('/api/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ username, email, password, passwordConfirmation })
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

// Observe form for dynamic loading
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
