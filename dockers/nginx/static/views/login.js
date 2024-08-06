export async function Login()
{
    const body = document.getElementsByTagName('body')[0];

    try {
        const response = await fetch('/static/src/html/login.html');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const htmlContent = await response.text();
        body.innerHTML = htmlContent;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }

	return body;
}
