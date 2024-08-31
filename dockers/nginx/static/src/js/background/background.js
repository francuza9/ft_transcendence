import * as THREE from "three";
import { getFXScene } from "./FXScene.js";

const clock = new THREE.Clock();
let animationPaused = false;
let sceneB;
let renderer;
let transition;
let canvas;

initBackground();
animate_background();

export function initBackground() {
	const container = document.getElementById("background-container");

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	canvas = renderer.domElement;
	container.appendChild(canvas);

	const w = window.innerWidth;
	const h = window.innerHeight;
	const camera = new THREE.PerspectiveCamera(50, w / h, 1, 10000);
	camera.position.z = 2000;

	window.addEventListener('resize', () => {
		const width = window.innerWidth;
		const height = window.innerHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);
	});

	const materialB = new THREE.MeshStandardMaterial({
		color: 0xFF9900,
		flatShading: true,
	});

	sceneB = getFXScene({
		renderer,
		material: materialB,
		clearColor: 0x000000,
		needsAnimatedColor: true,
	});

	transition = {
		render: (delta) => {
			sceneB.render(delta, false);
		}
	};
}

function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

export function animate_background() {
	if (!animationPaused) {
		requestAnimationFrame(animate_background);
		transition.render(clock.getDelta());
	}
}

function pauseAnimation() {
	animationPaused = true;
	if (canvas) {
		canvas.style.display = 'none';
	}
}

export function resumeAnimation() {
	animationPaused = false;
	if (canvas) {
		canvas.style.display = 'block';
	}
	animate_background();
}

export function cleanupBackground() {
	animationPaused = true;

	if (sceneB) {
		if (sceneB.mesh) {
			sceneB.mesh.geometry.dispose();
			if (sceneB.mesh.material) {
				sceneB.mesh.material.dispose();
			}
		}
	}

	if (renderer) {
		renderer.dispose();
	}

	if (canvas) {
		canvas.remove();
	}

	// Remove event listeners (if any)
	//window.removeEventListener('resize', onWindowResize);

	sceneB = null;
	renderer = null;
	canvas = null;
}
