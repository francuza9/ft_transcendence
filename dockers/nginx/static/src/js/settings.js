import {getSocket} from '/static/views/lobby.js';
import {getCookie} from '/static/src/js/cookies.js';
import {checkLoginStatus, fetchAvatar} from '/static/src/js/utils.js';
import {variables} from '/static/src/js/variables.js';
import {handleRouting} from '/static/routers/router.js';
import {getTranslation, setTranslations, getTranslationFile} from '/static/src/js/lang.js';
import {closeChat} from '/static/src/js/chat.js';
import {closeGlobalSocket} from '/static/src/js/socket_handling/global_socket.js';

export async function initSettings() {
    const section = document.getElementsByTagName('section')[0];
    const settingsDiv = document.createElement("div");
    settingsDiv.id = "settings";

    try {
        const response = await fetch('/static/src/html/settings.html');
        if (!response.ok) throw new Error('Network response was not ok');
        settingsDiv.innerHTML = await response.text();
        section.appendChild(settingsDiv);

        if (!getTranslationFile()) {
            const userLang = getCookie('userLang') || 'en';
            const translationsResponse = await fetch(`/static/lang/${userLang}.json`);
            if (!translationsResponse.ok) throw new Error('Network response was not ok');
            const translations = await translationsResponse.json();
            setTranslations(translations);
        }

        translateSettingsContent();
    } catch (error) {
        console.error('Error initializing settings:', error);
    }
}

function translateSettingsContent() {
    const settingsDiv = document.getElementById('settings');

    if (!settingsDiv) return;

    settingsDiv.querySelectorAll('[data-text]').forEach(element => {
        const key = element.getAttribute('data-text');
        const translation = getTranslation(key);

        if (translation) {
            element.innerHTML = translation;
        } else {
            console.warn('No translation for key:', key);
        }
    });
}

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

	checkLoginStatus().then(loggedIn => {
		if (loggedIn && !variables.is_guest) {
			fetchAvatar('settings-avatar');
			authenticated.classList.remove('hidden');
			unauthenticated.classList.add('hidden');
			hello.textContent = `${getTranslation('pages.settings.hello')} ${variables.username}!`;
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
			closeChat();
			variables.username = undefined;
			if (window.location.pathname != '/') {
				history.pushState(null, '', '/');
				handleRouting();
			}
			const socket = getSocket();
			if (socket) {
				socket.close();
			}
			closeGlobalSocket();
			closeChat();
			closeSettingsButton();
			alert(getTranslation('pages.settings.logoutSuccess'));
        } else {
            console.error('Logout failed:', data.message);
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

export const closeSettingsButton = () => {
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
