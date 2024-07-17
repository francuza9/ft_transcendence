import * as THREE from 'three';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

import { initScene, initCamera, initRenderer} from './firstRun/init.js';
import { initCornerLights } from './objects/cornerLights.js';
import { initText } from './objects/text.js';
import { initPlane, initEdges, initWalls} from './objects/plane.js';
import { initPlayers } from './objects/players.js';
import { initBall } from './objects/ball.js';
import { playerNames } from './objects/playerNames.js'

export function create2Pgame(mappov)
{
	const scene = initScene();
	const camera = initCamera(mappov);
	const renderer = initRenderer();
	renderer.setAnimationLoop( animate );

	// create a group
	const group = new THREE.Group();

		// create plane and edges
	const plane = new initPlane();
	const planeEdges = new initEdges(mappov + 1);

	// create walls
	const walls = new initWalls(mappov + 1);

	// create players
	const players = new initPlayers(mappov + 1);

	// create ball
	const ball = new initBall();

	// create light
	const groupCornerLights = new initCornerLights(ball);
	const light = new THREE.AmbientLight( 0xffffff, 1 );

	// controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.update();

	

	// add objects to group
	group.add(plane);
	group.add(walls);
	group.add(players);
	group.add(planeEdges);
	group.add(ball);
	group.add(groupCornerLights);

	window.addEventListener('resize', onWindowResize, false);

	// add objects to scene //
	initText().then(text => {
		playerNames(mappov, "player 1", "player 2").then(names => {
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
	}

	function onWindowResize() {
    	camera.aspect = window.innerWidth / window.innerHeight;
    	camera.updateProjectionMatrix();
    	renderer.setSize(window.innerWidth, window.innerHeight);
	}
}
