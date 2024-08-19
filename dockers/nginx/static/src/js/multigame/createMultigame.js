import * as THREE from 'three';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';
import { initScene, initCamera, initRenderer} from '../2pGame/init.js';
import { initPlane } from './objects/plane.js';
import { createEdges } from './objects/edges.js';
import { fixCamera } from './scene/camera.js';
import { Ball } from './objects/ball.js';
import { createLights } from './objects/lights.js';
import { createPlayers } from './objects/players.js';
import { buildMap } from './scene/maps/chooseMap.js';

export function createMultigame(pcount, pov, map, socket)
{
	const scene = initScene();
	const camera = initCamera(0);
	const renderer = initRenderer();
	renderer.setAnimationLoop( animate );

	const group = new THREE.Group();

	const plane = new initPlane(pcount);
	const planeVectors = plane.geometry.attributes.position.array;

	fixCamera(pov, planeVectors, camera);
	// const ball = createBall();
	const ball = new Ball(scene);
	const ballMesh = ball.getMesh();
	const edges = createEdges(planeVectors, pcount);

	const vectorObjects = [];
	for (let i = 0; i < planeVectors.length; i += 3) {
		vectorObjects.push(new THREE.Vector3(planeVectors[i], planeVectors[i + 1], planeVectors[i + 2]));
	}

	const light = new THREE.AmbientLight( 0xffffff, 1 );
	const lights = createLights(pcount, ballMesh, vectorObjects);

	const players = createPlayers(pcount, pov, vectorObjects);

	// controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.update();

	group.add(plane);
	group.add(light);
	group.add(edges);
	group.add(ballMesh);
	group.add(ball.getMesh2());
	group.add(lights);
	group.add(players);

	if (map > 0)
		group.add(buildMap(map, pcount, plane, scene, vectorObjects));

	scene.add(group);

	window.addEventListener('resize', onWindowResize, false);

	function animate() {
		// render
		ball.animate();

		controls.update();
		renderer.render(scene, camera);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
}
