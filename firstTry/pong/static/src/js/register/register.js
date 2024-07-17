// Ensure DOM is fully loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Handle form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form submission

            // Perform AJAX request or other form handling here
            const formData = new FormData(registerForm);
			const name = formData.get('fullname');
			const email = formData.get('email');
            const username = formData.get('username');
            const password = formData.get('password');

            // Example: Log the username and password to console
            console.log('Username:', username);
            console.log('Password:', password);
			console.log('Full Name:', name);
            console.log('Email Address:', email);


            // You can send the form data to your Django backend via fetch or XMLHttpRequest
            // Example using fetch:
            /*
            fetch('/register/', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                // Handle response from server
                console.log('Server response:', data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
            */
        });
    }
});
