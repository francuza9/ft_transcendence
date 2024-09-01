import {variables} from '/static/src/js/variables.js';
import {getCookie, setCookie} from '/static/src/js/cookies.js';
import {translateContent} from '/static/src/js/lang.js';
import {removeGameRenderer} from '/static/src/js/end.js';
import {setTranslations} from '/static/src/js/lang.js';

export async function replaceHTML(path)
{
	const body = document.getElementsByTagName('body')[0];
	let section = document.getElementsByTagName('section')[0];
	const userLang = getCookie('userLang') || 'en';

    try {
		if (path.includes('login') || path.includes('register')) {
            const chatDiv = document.getElementById('chat');
            const settingsDiv = document.getElementById('settings');
            if (chatDiv) chatDiv.style.display = 'none';
            if (settingsDiv) settingsDiv.style.display = 'none';
        } else {
            const chatDiv = document.getElementById('chat');
            const settingsDiv = document.getElementById('settings');
            if (chatDiv) chatDiv.style.display = '';
            if (settingsDiv) settingsDiv.style.display = '';
        }

		if (variables.endView)
			removeGameRenderer();
        const response = await fetch(path);
        if (!response.ok) throw new Error('Network response was not ok');
        const htmlContent = await response.text();
		const children = Array.from(section.children);

		children.forEach(child => {
			if (child.id !== 'chat' && child.id !== 'settings') {
				section.removeChild(child);
			}
		});

        section.innerHTML += htmlContent;

        const translationsResponse = await fetch(`/static/lang/${userLang}.json`);
        if (!translationsResponse.ok) throw new Error('Network response was not ok');
        const translations = await translationsResponse.json();
		setTranslations(translations);
        translateContent(translations);

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

export function normalizePath(path)
{
    path = path.replace(/\/{2,}/g, '/');
    path = path.replace(/\/+$/, '') || '/';	
	return path;
}

export async function checkLoginStatus() {
    return fetch('/api/check_login_status/', {
        method: 'GET',
        credentials: 'include',  // Include cookies in the request
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const user = data.user;
			variables.username = user.username;
			variables.is_guest = user.is_guest;
			return true;
        } else {
            console.log('User is not logged in');
			return false;
        }
    })
    .catch(error => {
        console.error('Error fetching user info:', error);
		return false;
    });
}

export async function getUsername() {
    return fetch('/api/check_login_status/', {
        method: 'GET',
        credentials: 'include',  // Include cookies in the request
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const user = data.user;
			return user.username;
        } else {
			return undefined;
        }
    })
    .catch(error => {
        console.error('Error fetching user info:', error);
		return false;
    });
}

export async function fetchAccountInfo() {
	try {
		const response = await fetch('/api/account_info/');
		const result = await response.json();

		if (result.success) {
			const data = result.data;
			document.getElementById('username').innerText = data.username;
			document.getElementById('email').innerText = data.email;
			document.getElementById('bio').innerText = data.bio;
			document.getElementById('displayName').innerText = data.displayName;
			document.getElementById('avatar').src = data.avatarUrl || '/static/default-avatar.png';
			
		} else {
			alert('Failed to fetch account info.');
		}
	} catch (error) {
		console.error('Error fetching account info:', error);
	}
}

export async function fetchAvatar(id) {
	if (!id) id = 'avatar';
	try {
		const response = await fetch('/api/account_info/');
		const result = await response.json();

		if (result.success) {
			const data = result.data;
			document.getElementById(id).src = data.avatarUrl || '/static/default-avatar.png';
		} else {
			alert('Failed to fetch avatar.');
		}
	} catch (error) {
		console.error('Error fetching avatar:', error);
	}
}


export async function guestLogin() {
    try {
        const response = await fetch('/api/guest_login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        const data = await response.json();

        if (data.success) {
            variables.username = data.username;
            variables.is_guest = data.is_guest;
            console.log('Guest Login successful');
        } else {
            console.error('Guest Login failed:', data.message);
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error during guest login:', error);
        alert('An error occurred during login');
        throw error;
    }
}

export const ensureUsername = async () => {
	if (variables.username) {
		return Promise.resolve();
	} else {
		try {
			const loggedIn = await checkLoginStatus();
			if (!loggedIn) {
				await guestLogin();
			}
			return;
		} catch (error) {
			console.error('Error checking login status or guest login:', error);
			throw error;
		}
	}
};

export function isGuest(username) {
    const guestPattern = /^guest\d{6}$/;
    return guestPattern.test(username);
}

export function moveModalBackdrops() {
	const section = document.getElementsByTagName('section')[0];

	if (section) {
		const backdrops = document.querySelectorAll('.modal-backdrop');

		backdrops.forEach(backdrop => {
			if (backdrop && !section.contains(backdrop)) {
				section.appendChild(backdrop);
			}
		});
	}
}
