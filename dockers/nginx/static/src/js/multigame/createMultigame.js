import * as THREE from 'three';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';
import { initScene, initCamera, initRenderer } from '../2pGame/init.js';
import { initPlane } from './objects/plane.js';
import { createEdges } from './objects/edges.js';
import { fixCamera } from './scene/camera.js';
import { Ball } from './objects/ball.js';
import { createLights } from './objects/lights.js';
import { createPlayers } from './objects/players.js';
import { buildMap } from './scene/maps/chooseMap.js';

export function createMultigame(pcount, pov, map, socket) {
	if (pov > pcount)
		pov = 0;
	const scene = initScene();
	const camera = initCamera(0);
	const renderer = initRenderer();
	renderer.setAnimationLoop(animate);

	const group = new THREE.Group();

	const plane = new initPlane(pcount);
	const planeVectors = plane.geometry.attributes.position.array;

	fixCamera(pov, planeVectors, camera);
	const ball = new Ball(scene);
	const ballMesh = ball.getMesh();
	const edges = createEdges(planeVectors, pcount);

	const vectorObjects = [];
	for (let i = 0; i <= pcount * 3; i += 3) {
		vectorObjects.push(new THREE.Vector3(planeVectors[i], planeVectors[i + 1], planeVectors[i + 2]));
	}

	const light = new THREE.AmbientLight(0xffffff, 1);
	const lights = createLights(pcount, ballMesh, vectorObjects);

	
	const players = createPlayers(pcount, pov, vectorObjects);
	

	// Attach direction vectors and side lengths to each player
	players.children.forEach((player, i) => {
		let v1 = vectorObjects[i];
		let v2 = vectorObjects[(i + 1) % pcount];
		let directionVector = new THREE.Vector3().subVectors(v2, v1).normalize();
		let sideLength = v1.distanceTo(v2);
		player.userData = {
			sideIndex: i,
			directionVector: directionVector,
			sideLength: sideLength,
		};
	});

	sendInitialData(socket, vectorObjects, players);

	// Controls
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

	// Event listeners for keyboard inputs
	const keys = {
		"a": false,
		"d": false,
		"ArrowLeft": false,
		"ArrowRight": false,
	};

	const boundOnKeydown = (event) => onKeydown(event);
	const boundOnKeyup = (event) => onKeyup(event);
	
	if (pov != 0) {
		window.addEventListener('keydown', boundOnKeydown, false);
		window.addEventListener('keyup', boundOnKeyup, false);
	}


	const handleMessage = (event) => {
		if (event.data instanceof ArrayBuffer) {
		} else {
			let data = JSON.parse(event.data);
			if (pov != 0) {
				let players_array = data.players;

				ball.speed = data.ball.ball_speed;
				ball.direction.x = data.ball.ball_direction.x;
				ball.direction.z = data.ball.ball_direction.y;

				ball.ball.position.x = data.ball.ball_position.x;
				ball.ball.position.z = data.ball.ball_position.y;

				let i;
				for (i = 0; i < pov - 1 && i < players_array.length; i++) {
					players.children[i + 1].position.set(players_array[i].x, 0.75, players_array[i].y);
				}
				i++;
				while (i < players.children.length/* players_array.length */) {
					players.children[i].position.set(players_array[i].x, 0.75, players_array[i].y);
					i++;
				}
			}
			if (data.result != undefined && data.result != null) {
				if (pcount === 2) {
					alert("move to 2 p! ");
					cleanup();
					socket.removeEventListener('message', handleMessage);
					socket.close();
				}
				if (data.result === pov - 1) {
					cleanup();
					createMultigame(pcount - 1, 0, map, socket);
					return ;
				}
				else {
					cleanup();
					if (pov - 1 > data.result) {
						pov--;
					}
					createMultigame(pcount - 1, pov, map, socket);
					return ;
				}
			}
		}
	}
	socket.addEventListener('message', handleMessage);

	function animate() {
		// Send player positions over the socket
		if (pov > 0) {
			const buffer = serializeData(
				pov,
				players.children[0].position.x,
				players.children[0].position.z
			);
			socket.send(buffer);
		}

		if (pov > 0) {
			updatePlayerPosition(
				players.children[0], 
				players.children[pov - 1].userData.directionVector, 
				players.children[pov - 1].userData.sideLength,
				vectorObjects[pov - 1],
				vectorObjects[pov % pcount]
			);
		}

		ball.animate();
		controls.update();
		renderer.render(scene, camera);
	}

	function updatePlayerPosition(player, directionVector, length, v1, v2) {
		if (keys.a || keys.ArrowLeft) {
			player.position.addScaledVector(directionVector, -0.2);
		}
		if (keys.d || keys.ArrowRight) {
			player.position.addScaledVector(directionVector, 0.2);
		}

		let halfPaddleLength = 1.0; // Assuming the paddle length is 2, so half is 1
		let playerToV1 = new THREE.Vector3().subVectors(player.position, v1);
		let projectionLength = playerToV1.dot(directionVector);

		if (projectionLength < halfPaddleLength) {
			player.position.copy(v1).addScaledVector(directionVector, halfPaddleLength);
		} else if (projectionLength > length - halfPaddleLength) {
			player.position.copy(v2).addScaledVector(directionVector, -halfPaddleLength);
		}
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
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

	function serializeData(pov, positionX, positionY) {
		const buffer = new ArrayBuffer(9); // 1 byte (pov) + 4 bytes (positionX) + 4 bytes (positionY) + 4 bytes for padding
		const view = new DataView(buffer);

		view.setUint8(0, pov); // 1 byte

		// Write positionX and positionY as 32-bit floats
		view.setFloat32(1, positionX, true); // 4 bytes (little-endian)
		view.setFloat32(5, positionY, true); // 4 bytes (little-endian)

		return buffer;
	}

	function sendInitialData(socket, vectorObjects) {
		const data = {
			type: 'init',
			content: {
				vectors: vectorObjects.map(vector => ({
					x: vector.x,
					y: vector.z
				}))
			}
		};
		socket.send(JSON.stringify(data));
	}

	function cleanup() {
		renderer.setAnimationLoop(null);
		window.removeEventListener('resize', onWindowResize);
		window.removeEventListener('keydown', boundOnKeydown);
		window.removeEventListener('keyup', boundOnKeyup);
		controls.dispose();
		group.clear();
		scene.clear();
		renderer.dispose();
		renderer.domElement.remove();
	}

}
