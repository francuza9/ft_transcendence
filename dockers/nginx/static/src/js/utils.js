export async function replaceHTML(path, navbar)
{
	const body = document.getElementsByTagName('body')[0];
    const navbarSelector = '.navbar';

    try {
        // Handle the navbar
        let existingNavbar = document.querySelector(navbarSelector);

        if (navbar) {
            if (!existingNavbar) {
                const navbarResponse = await fetch('/static/src/html/navbar.html');
                if (!navbarResponse.ok) {
                    throw new Error('Network response was not ok');
                }
                const navbarContent = await navbarResponse.text();
                body.insertAdjacentHTML('afterbegin', navbarContent);
                existingNavbar = document.querySelector(navbarSelector);
            }
        } else if (existingNavbar) {
            existingNavbar.remove();
        }

        // Fetch the new content
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const htmlContent = await response.text();

        // Clear existing content except the navbar if needed
        if (navbar && existingNavbar) {
            body.innerHTML = existingNavbar.outerHTML;
        } else {
            body.innerHTML = '';
        }

        // Append new content
        body.insertAdjacentHTML('beforeend', htmlContent);

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
