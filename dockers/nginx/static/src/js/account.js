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
    // Get the relevant elements
    const editableContainer = document.querySelector(`[data-value="${field}"]`).closest('.editable-container');
    const displayMode = editableContainer.querySelector('.display-mode');
    const editForm = editableContainer.querySelector(`#edit-form-${field}`);
    const titleInput = editForm.querySelector(`#title-input-${field}`);
    const displayTitle = editableContainer.querySelector(`#${field}`);

    if (displayTitle) {
        // Set the value of the input to the current text of the h4 element
        titleInput.value = displayTitle.textContent.trim();
    } else {
        console.error(`Element with ID ${field} not found`);
        return;
    }

    // Toggle visibility
    displayMode.style.display = 'none';
    editForm.style.display = 'block';
    titleInput.focus();
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
            const response = await fetch('/api/account/update/', {
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

    editForm.style.display = 'none';
    displayMode.style.display = 'flex';
};
