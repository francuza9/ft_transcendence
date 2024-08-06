export const loginButton = () => {
    console.log('yes');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Login successful');
                window.location.href = '/dashboard';
            } else {
                console.error('Login failed:', data.message);
                alert('Login failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during login');
        });
    } else {
        alert('Please enter both email and password');
    }
};

export const loginWithGithubButton = () => {
	console.log('Login with GitHub');
}

export const loginWith42Button = () =>  {
	console.log('Login with 42');
}
