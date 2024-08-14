import {getCookie} from '/static/src/js/cookies.js';

export async function setLanguage(lang) {
    setCookie('userLang', lang, 365);
    const translations = await fetch(`/static/lang/${lang}.json`).then(response => response.json());
    translateContent(translations);
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
}

function getTranslation(key, translations) {
    return key.split('.').reduce((obj, i) => obj?.[i], translations);
}

async function getDefaultTranslations() {
    const path = `/static/lang/en.json`;
    const response = await fetch(path);
    if (!response.ok) throw new Error('Failed to fetch default translations');
    return response.json();
}
