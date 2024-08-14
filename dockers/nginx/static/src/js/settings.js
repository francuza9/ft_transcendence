import {getCookie} from '/static/src/js/cookies.js';

export const settingsButton = () => {
    const sidebar = document.getElementById('sidebar');
    const settingsBtn = document.getElementById('settings-btn');
	const currentLang = getCookie('userLang');
	sidebar.classList.remove('hidden');
    settingsBtn.classList.add('hidden');
	highlightCurrentLanguage(currentLang);
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

    languageBtns.forEach(btn => {
        if (btn.dataset.value === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}
