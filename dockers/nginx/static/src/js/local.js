import {variables} from '/static/src/js/variables.js';
import {startLocal} from '/static/src/js/localgame/localgame.js';
import {replaceHTML} from '/static/src/js/utils.js';
import {cleanupBackground} from '/static/src/js/background/background.js';

export const isAI = (value) => {
	variables.isAI = value;
	replaceHTML('/static/src/html/createLocal.html', false).then(() => {
		const difficultyDropdown = document.getElementById('difficulty')
		if (variables.isAI)
			difficultyDropdown.classList.remove('hidden');
	});
}

export const startLocalButton = () => {
	const section = document.getElementsByTagName('section')[0];
	section.remove();
	cleanupBackground();

	const element = document.createElement('div');
	element.innerHTML = `
		<h1>Pong Local Game !/h1>
		<script type="module" src="{% static 'src/js/localgame/localgame.js' %}"></script>
	`;
	startLocal();
}

export const setDifficulty = (difficulty) => {
	variables.AIDifficulty = difficulty;
	const dropdownButton = document.getElementById('btnGroupDrop1');
	dropdownButton.textContent = variables.difficulty;
}

export const difficultyDropdown = () => {
	var dropdown = new bootstrap.Dropdown(document.getElementById('btnGroupDrop1'));
	dropdown.toggle();
}
