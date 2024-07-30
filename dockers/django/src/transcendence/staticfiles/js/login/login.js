// Ensure DOM is fully loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Handle form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form submission

            // Perform AJAX request or other form handling here
            const formData = new FormData(loginForm);
            const username = formData.get('username');
            const password = formData.get('password');

            // Example: Log the username and password to console
            console.log('Username:', username);
            console.log('Password:', password);

            // You can send the form data to your Django backend via fetch or XMLHttpRequest
            // Example using fetch:
            /*
            fetch('/login/', {
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
