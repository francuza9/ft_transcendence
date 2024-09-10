import { fetchAccountInfo } from '/static/src/js/utils.js';
import { getTranslation } from '/static/src/js/lang.js';
import { handleRouting } from '/static/routers/router.js';
import { getCookie } from '/static/src/js/cookies.js';
import { checkUserState } from '/static/src/js/settings.js';

let lastValidFile = null;

export const accountButton = (e) => {
	e.preventDefault();
	history.pushState(null, '', '/account');
	handleRouting();
}

export const editField = (field) => {
    if (field === 'avatar') {
		const avatarImage = document.getElementById('avatar');
		const avatarPreview = document.getElementById('avatar-preview-modal');
        const removeButton = document.getElementById('remove-avatar-modal');
		const fileInput = document.getElementById('avatar-input-modal');
		const saveButton = document.getElementById('save-avatar-modal');
		
		avatarPreview.src = avatarImage.src;
		fileInput.value = '';
		saveButton.disabled = true;

        if (avatarPreview.src.includes('default-avatar.png')) {
            removeButton.style.display = 'none';
        } else {
            removeButton.style.display = 'inline-block';
        }

    } else if (field === 'password') {
		const currentPasswordInput = document.getElementById('current-password-input-modal');
		const newPasswordInput = document.getElementById('new-password-input-modal');
		const confirmPasswordInput = document.getElementById('confirm-password-input-modal');
		const errorElement = document.getElementById('password-error');

		currentPasswordInput.value = '';
		newPasswordInput.value = '';
		confirmPasswordInput.value = '';
		errorElement.textContent = '';	
	} else {
        const titleInput = document.getElementById(`${field}-input-modal`);
        const displayTitle = document.getElementById(field);
		const errorElement = document.getElementById(`${field}-error`);

		errorElement.textContent = '';
		errorElement.style.display = 'none';

        if (displayTitle && titleInput) {
            titleInput.value = displayTitle.innerHTML.replace(/<br\s*[\/]?>/gi, "\n");
        } else {
            console.error(`Element with ID ${field} or input not found`);
            return;
        }
    }
};

export const saveField = async (field) => {
	const titleInput = document.getElementById(`${field}-input-modal`);
	const errorElement = document.getElementById(`${field}-error`);

    const newTitle = titleInput.value.trim();

    if (newTitle || field === 'bio') {
        try {
            const response = await fetch('/api/account_update/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({
                    field: field,
                    value: newTitle,
                }),
            });

            const result = await response.json();

            if (result.success) {
				const modalInstance = bootstrap.Modal.getInstance(document.getElementById(`edit-${field}-modal`));
				if (modalInstance)
					modalInstance.hide();

				setTimeout(() => {
					const backdrop = document.querySelector('.modal-backdrop');
					if (backdrop) {
						backdrop.remove();
					}
					}, 20);

				titleInput.value = '';
				errorElement.textContent = '';
				fetchAccountInfo();
            } else {
				errorElement.textContent = getTranslation(`pages.account.${result.message}`);
				errorElement.style.display = 'block';
				alert(getTranslation(`pages.account.${result.message}`));
            }
        } catch (error) {
            console.error('Error updating field:', error);
        }
    }
};

export const savePasswordButton = async () => {
	const currentPasswordInput = document.getElementById('current-password-input-modal');
	const newPasswordInput = document.getElementById('new-password-input-modal');
	const confirmPasswordInput = document.getElementById('confirm-password-input-modal');
	const errorElement = document.getElementById('password-error');

	const currentPassword = currentPasswordInput.value;
	const newPassword = newPasswordInput.value;
	const confirmPassword = confirmPasswordInput.value;

	if (!currentPassword || !newPassword || !confirmPassword) {
		errorElement.textContent = getTranslation('pages.account.emptyFieldsError');
		errorElement.style.display = 'block';
		return;
	} else if (newPassword !== confirmPassword) {
		errorElement.textContent = getTranslation('pages.account.passwordMatchError');
		errorElement.style.display = 'block';
		return
	}
	try {
		const response = await fetch('/api/password_update/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
			},
			body: JSON.stringify({
				currentPassword: currentPassword,
				newPassword: newPassword,
				confirmPassword: confirmPassword,
			}),
		});

		const result = await response.json();

		if (result.success) {

			const modalInstance = bootstrap.Modal.getInstance(document.getElementById(`edit-password-modal`));
			if (modalInstance)
				modalInstance.hide();

			setTimeout(() => {
				const backdrop = document.querySelector('.modal-backdrop');
				if (backdrop) {
					backdrop.remove();
				}
				}, 20);

			console.log('Password updated successfully');
			alert(getTranslation('pages.account.passwordUpdateSuccessfull'));
		} else {
			errorElement.textContent = getTranslation(`pages.account.${result.message}`);
			errorElement.style.display = 'block';
			alert(getTranslation(`pages.account.${result.message}`));
		}
	} catch (error) {
		console.error('Error updating password:', error);
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
                alert(getTranslation('pages.account.fileSizeExceeded'));
                fileInput.value = '';
                return;
            }
            if (!allowedFormats.includes(file.type)) {
                alert(getTranslation('pages.account.unsuportedFormat'));
                fileInput.value = '';
                return;
            }

            lastValidFile = file;

            const reader = new FileReader();
            reader.onload = function (e) {
                avatarPreview.src = e.target.result;
                removeButton.style.display = 'inline-block';
                saveButton.disabled = false;
            };
            reader.readAsDataURL(file);
        } else if (lastValidFile) {
            const reader = new FileReader();
            reader.onload = function (e) {
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(lastValidFile);
        }
    };

    fileInput.click();
};

export const saveAvatarButton = async () => {
    const fileInput = document.getElementById('avatar-input-modal');
    const file = fileInput.files[0];
    const avatarPreview = document.getElementById('avatar-preview-modal');
    const avatarImage = document.getElementById('avatar');

    const isAvatarRemoved = avatarPreview.src.includes('default-avatar.png');

    if (isAvatarRemoved) {
        try {
            const response = await fetch('/api/avatar_remove/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
            });

            const result = await response.json();

            if (result.success) {
                avatarImage.src = "/static/default-avatar.png";
            } else {
                console.error('Failed to remove avatar:', result.message);
            }

        } catch (error) {
            console.error('Error removing avatar:', error);
        }
    } else if (file || lastValidFile) {
        let fileToUpload = file || lastValidFile;

        const formData = new FormData();
        formData.append('avatar', fileToUpload);

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
                avatarImage.src = result.avatarUrl;
            } else {
                alert(getTranslation(`pages.account.${result.message}`));
            }

        } catch (error) {
            alert('Error updating avatar: ' + error);
        }

    } else {
        console.log('No changes to avatar.');
    }

    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('edit-avatar-modal'));
    if (modalInstance) {
        modalInstance.hide();
    }

    setTimeout(() => {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }, 20);

	checkUserState();
    fileInput.value = '';
};

export const removeAvatarButton = () => {
    const avatarImage = document.getElementById('avatar-preview-modal');
    const fileInput = document.getElementById('avatar-input-modal');
    const removeButton = document.getElementById('remove-avatar-modal');
    const saveButton = document.getElementById('save-avatar-modal');

    avatarImage.src = '/static/default-avatar.png';

    fileInput.value = '';

    removeButton.style.display = 'none';

    saveButton.disabled = false;
};
