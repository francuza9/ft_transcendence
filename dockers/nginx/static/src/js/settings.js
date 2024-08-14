export const settingsButton = () => {
	sidebar.classList.remove('hidden');
}

export const closeButton = () => {
	sidebar.classList.add('hidden');
}

export const langButton = () => {
	document.getElementById('main-menu').classList.add('hidden');
	languageMenu.classList.remove('hidden');
}

export const backButton = () => {
	languageMenu.classList.add('hidden');
	document.getElementById('main-menu').classList.remove('hidden');
}
