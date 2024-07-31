export function Home() {
    const element = document.createElement('div');
	element.innerHTML = '<h1>Home</h1>';
    //element.innerHTML = `
	//	<script type="module" src="{% static 'src/js/3d.js' %}"></script>
    //`;

    return element;
}
