export async function replaceHTML(path, navbar)
{
	const body = document.getElementsByTagName('body')[0];

    try {
		
		if (navbar)
		{
			const navbar = await fetch('/static/src/html/navbar.html');
			if (!navbar.ok) {
				throw new Error('Network response was not ok');
			}
			const navbarContent = await navbar.text();
			body.innerHTML = navbarContent;
		}
		const response = await fetch(path);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const htmlContent = await response.text();
		if (navbar)
			body.innerHTML += htmlContent;
		else
			body.innerHTML = htmlContent;
		
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
