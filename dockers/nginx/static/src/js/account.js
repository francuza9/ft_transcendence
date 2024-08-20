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
    const editableContainer = document.querySelector(`[data-value="${field}"]`).closest('.editable-container');
    const displayMode = editableContainer.querySelector('.display-mode');
    const editForm = editableContainer.querySelector(`#edit-form-${field}`);

    if (!editForm || !displayMode) {
        console.error(`Form or display mode not found for field: ${field}`);
        return;
    }

    // Avatar-specific logic
    if (field === 'avatar') {
        const avatarImage = document.getElementById('avatar');
        const removeButton = document.getElementById('remove-avatar');

        // Store the original avatar URL in a data attribute so it can be restored if "Cancel" is clicked
		window.originalAvatarSrc = avatarImage.src;

        // Show the remove button if the avatar is not the default image
        if (avatarImage.src.includes('default-avatar.png')) {
            removeButton.style.display = 'none';
        } else {
            removeButton.style.display = 'inline-block';
        }

    } else {
        // For text fields, set the input value to the current display value
        const titleInput = editForm.querySelector(`#title-input-${field}`);
        const displayTitle = editableContainer.querySelector(`#${field}`);
        
        if (displayTitle && titleInput) {
            titleInput.value = displayTitle.textContent.trim();
        } else {
            console.error(`Element with ID ${field} or input not found`);
            return;
        }
    }

    // Toggle visibility: Hide display mode, show edit mode
    displayMode.style.display = 'none';
    editForm.style.display = 'block';

    // Focus on the input field for non-avatar fields
    if (field !== 'avatar') {
        const titleInput = editForm.querySelector(`#title-input-${field}`);
        titleInput.focus();
    }
};

// JavaScript to handle the save button functionality only for text fields
export const saveField = async (field) => {
    const editableContainer = document.querySelector(`[data-value="${field}"]`).closest('.editable-container');
    const displayMode = editableContainer.querySelector('.display-mode');
    const editForm = editableContainer.querySelector(`#edit-form-${field}`);
    const titleInput = editForm.querySelector(`#title-input-${field}`);
    const displayTitle = editableContainer.querySelector(`#${field}`);

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
                // Update the display field with the new value
                displayTitle.textContent = newTitle;
                console.log('Field updated successfully');
            } else {
                console.error('Failed to update field:', result.message);
            }
        } catch (error) {
            console.error('Error updating field:', error);
        }
    }

    // Hide the edit form and show the display mode
    editForm.style.display = 'none';
    displayMode.style.display = 'flex';
};

// JavaScript to handle the cancel button functionality for all fields (texts and avatar)
export const cancelField = (field) => {
    const editableContainer = document.querySelector(`[data-value="${field}"]`).closest('.editable-container');
    const displayMode = editableContainer.querySelector('.display-mode');
    const editForm = editableContainer.querySelector(`#edit-form-${field}`);

    if (editForm && displayMode) {
        // Hide the edit form and show the display mode
        editForm.style.display = 'none';
        displayMode.style.display = 'flex';
    } else {
        console.error(`Form or display mode not found for field: ${field}`);
    }

    // Avatar-specific logic (reset the avatar preview if needed)
    if (field === 'avatar') {
        const avatarInput = document.getElementById('avatar-input');
        const avatarPreview = document.getElementById('avatar');
        const removeButton = document.getElementById('remove-avatar');

        // Reset the avatar input value
        avatarInput.value = '';

        // If the user cancels, revert the avatar preview to the original state
        if (window.originalAvatarSrc) {
            avatarPreview.src = window.originalAvatarSrc;
        }

        // Hide the remove button if the avatar is the default image
        if (avatarPreview.src.includes('default-avatar.png')) {
            removeButton.style.display = 'none';
        } else {
            removeButton.style.display = 'inline-block';
        }
    }
};


export const uploadAvatarButton = () => {
    const fileInput = document.getElementById('avatar-input');

    fileInput.onchange = function () {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const avatarImage = document.getElementById('avatar');
                avatarImage.src = e.target.result; // Show the preview
            };
            reader.readAsDataURL(file); // Read the file and trigger the onload event
        }
    };

    fileInput.click(); // Trigger the file input dialog
};

export const saveAvatarButton = async () => {
    const fileInput = document.getElementById('avatar-input');
    const file = fileInput.files[0];  // Check if a new avatar was uploaded
    const avatarImage = document.getElementById('avatar');
    const editableContainer = document.querySelector(`[data-value="avatar"]`).closest('.editable-container');
    const displayMode = editableContainer.querySelector('.display-mode');
    const editForm = editableContainer.querySelector('#edit-form-avatar');
    const removeButton = document.getElementById('remove-avatar');

    // Check if the current avatar is the default (meaning it was removed)
    const isAvatarRemoved = avatarImage.src.includes('default-avatar.png');

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

                // Close the edit form and show the display mode
                editForm.style.display = 'none';
                displayMode.style.display = 'flex';

                // Update remove button visibility
                removeButton.style.display = avatarImage.src.includes('default-avatar.png') ? 'none' : 'inline-block';
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
                avatarImage.src = result.avatarUrl;

                // Close the edit form and show the display mode
                editForm.style.display = 'none';
                displayMode.style.display = 'flex';

                // Hide the remove button
                removeButton.style.display = 'none';
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

    // Clear the file input
    fileInput.value = '';
};


export const removeAvatarButton = () => {
    const avatarImage = document.getElementById('avatar');
    const fileInput = document.getElementById('avatar-input');
    const removeButton = document.getElementById('remove-avatar');
    
    // Show the default avatar in the preview
    avatarImage.src = '/static/default-avatar.png';

    // Ensure file input is cleared, so no file is sent to the server
    fileInput.value = '';

    // Hide the remove button since the avatar is now the default
    removeButton.style.display = 'none';
};