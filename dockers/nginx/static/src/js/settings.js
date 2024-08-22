import {getCookie} from '/static/src/js/cookies.js';
import {checkLoginStatus} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';

export const settingsButton = () => {
    const sidebar = document.getElementById('sidebar');
    const settingsBtn = document.getElementById('settings-btn');
	const currentLang = getCookie('userLang');
	sidebar.classList.remove('hidden');
    settingsBtn.classList.add('hidden');
	highlightCurrentLanguage(currentLang);
}

export const checkUserState = () => {
	const authenticated = document.getElementById('authenticated');
	const unauthenticated = document.getElementById('unauthenticated');
	const hello = document.getElementById('hello');
	if (!variables.hello)
		variables.hello = hello.textContent;

	checkLoginStatus().then(loggedIn => {
		if (loggedIn && !variables.is_guest) {
			authenticated.classList.remove('hidden');
			unauthenticated.classList.add('hidden');
			hello.textContent = `${variables.hello} ${variables.username}!`;
		} else {
			unauthenticated.classList.remove('hidden');
			authenticated.classList.add('hidden');
		}
	}).catch(error => {
		console.error('Error checking login status:', error);
	});
}

export async function logoutButton() {
    try {
        const response = await fetch('api/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        const data = await response.json();
        if (data.success) {
			document.cookie = 'sessionid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=None; Secure;';
			checkUserState();
			//replace this with a popup
			alert('You have been logged out successfully.');
        } else {
            console.error('Logout failed:', data.message);
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

export const closeButton = () => {
    const sidebar = document.getElementById('sidebar');
    const settingsBtn = document.getElementById('settings-btn');
	sidebar.classList.add('hidden');
    settingsBtn.classList.remove('hidden');
}

export const langButton = () => {
	document.getElementById('main-menu').classList.add('hidden');
    const languageMenu = document.getElementById('language-menu');
	languageMenu.classList.remove('hidden');
}

export const backButton = () => {
	document.getElementById('main-menu').classList.remove('hidden');
    const languageMenu = document.getElementById('language-menu');
	languageMenu.classList.add('hidden');
}

export function highlightCurrentLanguage(currentLang) {
    const languageBtns = document.querySelectorAll('[data-variable="lang"]');
	checkUserState();

    languageBtns.forEach(btn => {
        if (btn.dataset.value === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}
