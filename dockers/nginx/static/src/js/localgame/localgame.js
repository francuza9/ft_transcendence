import * as THREE from 'three';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

import { initScene, initCamera, initRenderer} from './init.js';
import { initCornerLights } from './objects/cornerLights.js';
import { initText } from './objects/text.js';
import { initPlane, initEdges, initWalls} from './objects/plane.js';
import { initPlayers } from './objects/players.js';
import { Ball } from './objects/ball.js';
import { playerNames } from './objects/playerNames.js';
import { initScore } from './objects/score.js';
import { updatePlayerPositions, checkCollision } from './local.js';

const group = new THREE.Group();
export let keys = {
	"w": false,
	"s": false,
	"ArrowUp": false,
	"ArrowDown": false,
};
let score = [0, 0];
export let scoremesh = 0;

initScore(score).then(scorea => {
	scoremesh = scorea;
	group.add(scoremesh);
}).catch(error => {console.error('Failed to load score:', error);})

export function startLocal(pointsToWin)
{
	const scene = initScene();
	const camera = initCamera(0);
	const renderer = initRenderer();
	renderer.setAnimationLoop( animate );

		// create plane and edges
	const plane = new initPlane();
	const planeEdges = new initEdges(1);

	// create walls
	const walls = new initWalls(1);

	// create players
	const players = new initPlayers(1);

	// create ball
	let ball = new Ball(scene);
	const ballmesh = ball.getMesh();

	// create light
	const groupCornerLights = new initCornerLights(ballmesh);
	const light = new THREE.AmbientLight( 0xffffff, 1 );

	const lights = [groupCornerLights.children[9], groupCornerLights.children[10], groupCornerLights.children[11], groupCornerLights.children[12]];

	// controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.update();

	// add objects to group
	group.add(plane);
	group.add(walls);
	group.add(players);
	group.add(planeEdges);
	group.add(ballmesh);
	group.add(ball.getMesh2());
	group.add(groupCornerLights);

	window.addEventListener('resize', onWindowResize, false);
	document.addEventListener('keydown', onKeydown);
	document.addEventListener('keyup', onKeyup);

	// add objects to scene //
	initText().then(text => {
		playerNames(0, "player 1", "player 2").then(names => {
			group.add(text); // Add text mesh to the group
			group.add(names);
			scene.add(light);
	    	scene.add(group); // Add group to the scene after text is loaded
	    	animate(); // Start animation loop after everything is set up
		})
	}).catch(error => {
		console.error('Failed to load text:', error);
	});


	function animate() {
		ball.animate();
		// render
		
		controls.update();
		renderer.render(scene, camera);
		let checker = checkCollision(ball, players, score, lights, scoremesh, pointsToWin);
		if (checker) {
			cleanup();
		}
		updatePlayerPositions(players);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function cleanup() {
			renderer.setAnimationLoop(null);
			window.removeEventListener('resize', onWindowResize);
			document.removeEventListener('keydown', onKeydown);
			document.removeEventListener('keyup', onKeyup);
			controls.dispose();
			group.traverse(function (object) {
				if (object.geometry) object.geometry.dispose();
				if (object.material) {
					if (Array.isArray(object.material)) {
						object.material.forEach(material => material.dispose());
					} else {
						object.material.dispose();
					}
				}
			});
			scene.clear();
			renderer.dispose();
			renderer.domElement.remove();
	}
}

function onKeydown(event) {
    if (event.key in keys) {
        keys[event.key] = true;
    }
}

function onKeyup(event) {
    if (event.key in keys) {
        keys[event.key] = false;
    }
}


