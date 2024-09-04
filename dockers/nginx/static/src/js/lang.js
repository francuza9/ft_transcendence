import {setCookie, getCookie} from '/static/src/js/cookies.js';
import {highlightCurrentLanguage} from '/static/src/js/settings.js';
import {variables} from '/static/src/js/variables.js';

let translations;

export async function setLanguage(lang) {
    setCookie('userLang', lang, 365);
    translations = await fetch(`/static/lang/${lang}.json`).then(response => response.json());
    translateContent(translations);
	highlightCurrentLanguage(lang);
}

export const setTranslations = (translationFile) => {
	translations = translationFile;
}

export function translateContent(translations) {
    document.querySelectorAll('[data-text]').forEach(async element => {
        const key = element.getAttribute('data-text');
        let translation = getTranslation(key, translations);

        if (!translation) {
            const userLang = getCookie('userLang');
            console.warn('No translation for key:', key, 'inside of', userLang + '.json' || 'en.json');

            if (userLang !== 'en') {
                try {
                    const defaultTranslations = await getDefaultTranslations();
                    translation = getTranslation(key, defaultTranslations);

                    if (translation) {
                        element.innerHTML = translation;
                    } else {
                        console.warn('No translation for key:', key, 'inside of en.json');
                        console.error('Key:', key, 'does not exist!');
                    }
                } catch (error) {
                    console.error('Error loading default translations:', error);
                }
            } else {
                console.error('Key:', key, 'does not exist!');
            }
        } else {
            element.innerHTML = translation;
        }
    });

	const hello = document.getElementById('hello');
	hello.textContent = `${getTranslation('pages.settings.hello')} ${variables.username}!`;
}

export function getTranslation(key, translationsFile) {
	if (!translationsFile)
		translationsFile = translations;
    return key.split('.').reduce((obj, i) => obj?.[i], translationsFile);
}

async function getDefaultTranslations() {
    const path = `/static/lang/en.json`;
    const response = await fetch(path);
    if (!response.ok) throw new Error('Failed to fetch default translations');
    return response.json();
}
