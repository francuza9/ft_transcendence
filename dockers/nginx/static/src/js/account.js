import { handleRouting } from '/static/routers/router.js';
import { getCookie } from '/static/src/js/cookies.js';

export const accountButton = (e) => {
	//do some logic in case user is not logged in
	//I think it is not necessary since the button is only visible when the user is logged in
	e.preventDefault();
	history.pushState(null, '', '/account');
	handleRouting();
}

// JavaScript to handle the edit button functionality for everything (texts and avatar)
export const editField = (field) => {
    console.log('Editing field:', field);

    if (field === 'avatar') {
		const avatarImage = document.getElementById('avatar');
		const avatarPreview = document.getElementById('avatar-preview-modal');
        const removeButton = document.getElementById('remove-avatar-modal');
		const fileInput = document.getElementById('avatar-input-modal');
		const saveButton = document.getElementById('save-avatar-modal');
		
		avatarPreview.src = avatarImage.src;
		fileInput.value = ''; // Clear the file input
		saveButton.disabled = true; // Disable the save button

        // Show the remove button if the avatar is not the default image
        if (avatarPreview.src.includes('default-avatar.png')) {
            removeButton.style.display = 'none';
        } else {
            removeButton.style.display = 'inline-block';
        }

    } else {
        // For text fields, set the input value to the current display value
        const titleInput = document.getElementById(`${field}-input-modal`);
        const displayTitle = document.getElementById(field);
        
        if (displayTitle && titleInput) {
            titleInput.value = displayTitle.textContent.trim();
        } else {
            console.error(`Element with ID ${field} or input not found`);
            return;
        }
    }
};

// JavaScript to handle the save button functionality only for text fields
export const saveField = async (field) => {
	const titleInput = document.getElementById(`${field}-input-modal`);
	const displayTitle = document.getElementById(field);

    const newTitle = titleInput.value.trim();

    if (newTitle) {
        try {
            const response = await fetch('/api/account_update/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),  // Add CSRF token if needed
                },
                body: JSON.stringify({
                    field: field,
                    value: newTitle,
                }),
            });

            const result = await response.json();

            if (result.success) {
                displayTitle.textContent = newTitle;

				// Hide the modal
				const modalInstance = bootstrap.Modal.getInstance(document.getElementById(`edit-${field}-modal`));
				if (modalInstance)
					modalInstance.hide();

                console.log('Field updated successfully');
            } else {
				// TODO: create an error element to show the error message
                console.error('Failed to update field:', result.message);
            }
        } catch (error) {
            console.error('Error updating field:', error);
        }
    }
};

export const uploadAvatarButton = () => {
	const fileInput = document.getElementById('avatar-input-modal');
	const avatarPreview = document.getElementById('avatar-preview-modal');
	const removeButton = document.getElementById('remove-avatar-modal');
	const saveButton = document.getElementById('save-avatar-modal');
	const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes
	const allowedFormats = ['image/jpeg', 'image/png'];

    fileInput.onchange = function () {
        const file = fileInput.files[0];

        if (file) {

			if (file.size > maxFileSize) {
				alert('File size exceeds the limit of 2MB');
				fileInput.value = '';
				return;
			}
			if (!allowedFormats.includes(file.type)) {
				alert('File format not supported. Please upload a JPEG or PNG image');
				fileInput.value = '';
				return;
			}
            const reader = new FileReader();
            reader.onload = function (e) {
                
                avatarPreview.src = e.target.result; // Show the preview
				removeButton.style.display = 'inline-block'; // Show the remove button
				saveButton.disabled = false; // Enable the save button
            };
            reader.readAsDataURL(file); // Read the file and trigger the onload event
        }
    };

    fileInput.click(); // Trigger the file input dialog
};

export const saveAvatarButton = async () => {
    const fileInput = document.getElementById('avatar-input-modal');
    const file = fileInput.files[0];  // Check if a new avatar was uploaded
	const avatarPreview = document.getElementById('avatar-preview-modal');
    const avatarImage = document.getElementById('avatar');

    // Check if the current avatar is the default (meaning it was removed)
    const isAvatarRemoved = avatarPreview.src.includes('default-avatar.png');

    if (file) {
        // If a file is uploaded, call the update API
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/avatar_update/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
            });

            const result = await response.json();

            if (result.success) {
                // Update the avatar image
                avatarImage.src = result.avatarUrl;
            } else {
                console.error('Failed to update avatar:', result.message);
            }

        } catch (error) {
            console.error('Error updating avatar:', error);
        }

    } else if (isAvatarRemoved) {
        // If the avatar was removed, call the removal API
        try {
            const response = await fetch('/api/avatar_remove/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
            });

            const result = await response.json();

            if (result.success) {
                // Update the avatar image to the default
                avatarImage.src = "/static/default-avatar.png";
            } else {
                console.error('Failed to remove avatar:', result.message);
            }

        } catch (error) {
            console.error('Error removing avatar:', error);
        }
    } else {
        // No changes were made; exit early
        console.log('No changes to avatar.');
    }

	// Hide the modal
	const modalInstance = bootstrap.Modal.getInstance(document.getElementById('edit-avatar-modal'));
	if (modalInstance)
		modalInstance.hide();
	
	// Clear the file input
    fileInput.value = '';
};


export const removeAvatarButton = () => {
    const avatarImage = document.getElementById('avatar-preview-modal');
    const fileInput = document.getElementById('avatar-input-modal');
    const removeButton = document.getElementById('remove-avatar-modal');
	const saveButton = document.getElementById('save-avatar-modal');
    
    // Show the default avatar in the preview
    avatarImage.src = '/static/default-avatar.png';

    // Ensure file input is cleared, so no file is sent to the server
    fileInput.value = '';

    // Hide the remove button since the avatar is now the default
    removeButton.style.display = 'none';

	// Enable the save button
	saveButton.disabled = false;
};