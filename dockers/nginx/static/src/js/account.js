import { handleRouting } from '/static/routers/router.js';
import { getCookie } from '/static/src/js/cookies.js';

export const accountButton = (e) => {
	//do some logic in case user is not logged in
	//I think it is not necessary since the button is only visible when the user is logged in
	e.preventDefault();
	history.pushState(null, '', '/account');
	handleRouting();
}

// JavaScript to handle the edit button functionality
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
        // Show the remove button if the avatar is not the default image
        const avatarImage = document.getElementById('avatar');
        const removeButton = document.getElementById('remove-avatar');
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

    // Toggle visibility
    displayMode.style.display = 'none';
    editForm.style.display = 'block';

    if (field !== 'avatar') {
        const titleInput = editForm.querySelector(`#title-input-${field}`);
        titleInput.focus();
    }
};

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
				displayTitle.textContent = newTitle;
                console.log('Field updated successfully');
            } else {
                console.error('Failed to update field:', result.message);
            }
        } catch (error) {
            console.error('Error updating field:', error);
        }
    }

    editForm.style.display = 'none';
    displayMode.style.display = 'flex';
};

export const cancelField = (field) => {
    const editableContainer = document.querySelector(`[data-value="${field}"]`).closest('.editable-container');
    const displayMode = editableContainer.querySelector('.display-mode');
    const editForm = editableContainer.querySelector(`#edit-form-${field}`);

    if (editForm && displayMode) {
        editForm.style.display = 'none';
        displayMode.style.display = 'flex';
    } else {
        console.error(`Form or display mode not found for field: ${field}`);
    }

    // Avatar-specific logic (reset the avatar preview if needed)
    if (field === 'avatar') {
        const avatarInput = document.getElementById('avatar-input');
        avatarInput.value = '';  // Clear the file input if necessary
    }
};

export const uploadAvatarButton = () => {
    const fileInput = document.getElementById('avatar-input');
    fileInput.click(); // Trigger the file input dialog
};

export const saveAvatarButton = async () => {
    const fileInput = document.getElementById('avatar-input');
    const file = fileInput.files[0];
    if (!file) {
        console.error('No file selected');
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch('/api/avatar_update/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'), // Add CSRF token if needed
            },
        });
        const result = await response.json();
        if (result.success) {
            console.log('Avatar updated successfully');
            // Update the avatar image and file name display
            document.getElementById('avatar').src = result.avatarUrl;
            document.getElementById('file-name').textContent = '';
        } else {
            console.error('Failed to update avatar:', result.message);
        }
    } catch (error) {
        console.error('Error updating avatar:', error);
    }
};

export const removeAvatarButton = async () => {
    try {
        const response = await fetch('/api/avatar_remove/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'), // Add CSRF token if needed
            },
        });
        const result = await response.json();
        if (result.success) {
            console.log('Avatar removed successfully');
            // Reset the avatar image and file name display
            document.getElementById('avatar').src = '/static/default-avatar.png';
            document.getElementById('file-name').textContent = '';
        } else {
            console.error('Failed to remove avatar:', result.message);
        }
    } catch (error) {
        console.error('Error removing avatar:', error);
    }
};