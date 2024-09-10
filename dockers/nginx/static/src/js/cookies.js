export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
	console.log('CSRF Token:', cookieValue);
    return cookieValue;
}

export function setCookie(name, value, days) {
    if (typeof days !== 'number' || days <= 0) {
        console.error('Invalid days parameter for setting cookie.');
        return;
    }
    
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    try {
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=None; Secure`;
    } catch (error) {
        console.error('Error setting cookie:', error);
    }
}


/*
export function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}*/
