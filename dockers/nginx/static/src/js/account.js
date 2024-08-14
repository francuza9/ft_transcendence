import { handleRouting } from '/static/routers/router.js';

export const accountButton = (e) => {
	e.preventDefault();
	history.pushState(null, '', '/login');
	handleRouting();
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAccountInfo();

    document.getElementById('updateProfileBtn').addEventListener('click', updateProfile);
    document.getElementById('avatarUploadForm').addEventListener('submit', uploadAvatar);
});

async function fetchAccountInfo() {
    try {
        const response = await fetch('/api/account/info/');
        const result = await response.json();

        if (result.success) {
            const data = result.data;
            document.getElementById('username').innerText = data.username;
            document.getElementById('email').value = data.email;
            document.getElementById('bio').value = data.bio;
            document.getElementById('displayName').value = data.displayName;
            document.getElementById('avatar').src = data.avatarUrl || '/static/default-avatar.png';
            document.getElementById('totalScore').innerText = data.totalScore;
            document.getElementById('gamesPlayed').innerText = data.gamesPlayed;
            document.getElementById('gamesWon').innerText = data.gamesWon;
            document.getElementById('gamesLost').innerText = data.gamesLost;
        } else {
            alert('Failed to fetch account info.');
        }
    } catch (error) {
        console.error('Error fetching account info:', error);
    }
}

async function updateProfile() {
    const displayName = document.getElementById('displayName').value;
    const bio = document.getElementById('bio').value;
    const email = document.getElementById('email').value;

    const formData = new FormData();
    formData.append('displayName', displayName);
    formData.append('bio', bio);
    formData.append('email', email);

    try {
        const response = await fetch('/api/account/update/', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            alert('Profile updated successfully.');
        } else {
            alert('Failed to update profile.');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

async function uploadAvatar(event) {
    event.preventDefault();

    const avatarInput = document.getElementById('avatarInput');
    const formData = new FormData();
    formData.append('avatar', avatarInput.files[0]);

    try {
        const response = await fetch('/api/account/avatar/', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('avatar').src = result.avatarUrl;
            alert('Avatar uploaded successfully.');
        } else {
            alert('Failed to upload avatar.');
        }
    } catch (error) {
        console.error('Error uploading avatar:', error);
    }
}
