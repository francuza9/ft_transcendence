import {variables} from '/static/src/js/variables.js';
import {getCookie, setCookie} from '/static/src/js/cookies.js';
import {translateContent} from '/static/src/js/lang.js';

export async function replaceHTML(path)
{
	const body = document.getElementsByTagName('body')[0];
	const section = document.getElementsByTagName('section')[0];
	const userLang = getCookie('userLang') || 'en';

    try {
		/*
        let background = document.querySelector('.background');

		if (!background) {
			const backgroundResponse = await fetch('/static/src/html/background.html');
			if (!backgroundResponse.ok) throw new Error('Network response was not ok');
			const backgroundContent = await backgroundResponse.text();
			body.insertAdjacentHTML('afterbegin', backgroundContent);
			background = document.querySelector('.background');
		}*/

        const response = await fetch(path);
        if (!response.ok) throw new Error('Network response was not ok');
        const htmlContent = await response.text();

		/*
        if (!contentSection) {
            contentSection = document.createElement('div');
            contentSection.className = 'content-section';
            background.appendChild(contentSection);
        } else {
            contentSection.innerHTML = '';
        }*/

        section.innerHTML = htmlContent;

        const translationsResponse = await fetch(`/static/lang/${userLang}.json`);
        if (!translationsResponse.ok) throw new Error('Network response was not ok');
        const translations = await translationsResponse.json();
        translateContent(translations);

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }

	return body;
}

export function normalizePath(path)
{
    path = path.replace(/\/{2,}/g, '/');
    path = path.replace(/\/+$/, '') || '/';	
	return path;
}

export function checkLoginStatus() {
    return fetch('/api/check_login_status/', {
        method: 'GET',
        credentials: 'include',  // Include cookies in the request
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const user = data.user;
			variables.username = user.username;
            console.log('Logged in as:', user.username);
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
