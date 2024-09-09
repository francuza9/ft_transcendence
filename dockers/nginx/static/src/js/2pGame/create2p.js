import * as THREE from 'three';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

import { cleanupBackground, initBackground, resumeAnimation } from '/static/src/js/background/background.js';	
import { initScene, initCamera, initRenderer } from './init.js';
import { initCornerLights } from './objects/cornerLights.js';
import { initText } from './objects/text.js';
import { initPlane, initEdges, initWalls } from './objects/plane.js';
import { initPlayers } from './objects/players.js';
import { Ball } from './objects/ball.js';
import { playerNames } from './objects/playerNames.js';
import { initScore, updateScore } from './objects/score.js';
import { endGame } from '/static/src/js/end.js';
import { variables } from '/static/src/js/variables.js';
import { getSocket } from '/static/views/lobby.js';
import { handleRouting } from '/static/routers/router.js';

let group;
export let keys = {
	"a": false,
	"d": false,
	"ArrowLeft": false,
	"ArrowRight": false,
};
let score;
let cameraIndex = 2;
let cameraFollow = false;
export let scoremesh;

let gameRunning = false;

let rem_listener;

export function create2Pgame(mappov, socket, names) {
	if (gameRunning)
		return;
	else
		gameRunning = true;
	group = new THREE.Group();
	if (mappov > 2)
		mappov = 0;
	score = [0, 0];
	scoremesh = 0;
	initScore(score).then(scorea => {
		scoremesh = scorea;
		group.add(scoremesh);
	}).catch(error => { console.error('Failed to load score:', error); })
    const scene = initScene();
    const camera = initCamera(mappov);
    const renderer = initRenderer();
    renderer.setAnimationLoop(animate);

    const plane = new initPlane();
    const planeEdges = new initEdges(mappov + 1);

    const walls = new initWalls(mappov + 1);

    const players = new initPlayers(mappov + 1);

    let ball = new Ball(scene);
    const ballmesh = ball.getMesh();

    const groupCornerLights = new initCornerLights(ballmesh);
    const light = new THREE.AmbientLight(0xffffff, 1);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    group.add(plane);
    group.add(walls);
    group.add(players);
    group.add(planeEdges);
    group.add(ballmesh);
    group.add(ball.getMesh2());
    group.add(groupCornerLights);

    window.addEventListener('resize', onWindowResize, false);

    let p;
    if (mappov === 1)
        p = 'player_1';
    else if (mappov === 2)
        p = 'player_2';

	socket.onerror = function(event) {
		console.error('WebSocket error observed:', event);
	};

    const boundOnKeydown = (event) => onKeydown(event, camera);
    const boundOnKeyup = (event) => onKeyup(event);

	if (mappov > 0) {
		window.addEventListener('keydown', boundOnKeydown, false);
		window.addEventListener('keyup', boundOnKeyup, false);
	}

	const handleMessage = (event) => {
		if (event.data instanceof ArrayBuffer) {
			const bytes = new Float32Array(event.data);
			if (bytes.length >= 9) {
				ball.direction.x = bytes[0];
				ball.direction.z = bytes[1];
				ball.ball.position.x = bytes[2];
				ball.ball.position.z = bytes[3];
				players.children[0].position.z = bytes[4];
				players.children[1].position.z = bytes[5];
				ball.speed = bytes[6];
				const scoremeshIndex = group.children.findIndex(child => child === scoremesh);
				const score1 = new DataView(event.data).getInt32(28, true);
				const score2 = new DataView(event.data).getInt32(32, true);
				updateScore([score1, score2], group.children[scoremeshIndex]);
			} else if (bytes.length >= 5) {
				ball.direction.x = bytes[0];
				ball.direction.z = bytes[1];
				ball.ball.position.x = bytes[2];
				ball.ball.position.z = bytes[3];
				ball.speed = bytes[4];
			} else if (bytes.length >= 4) {
				ball.ball.position.x = bytes[0];
				ball.ball.position.z = bytes[1];
				if (mappov !== 1) {
					players.children[0].position.z = bytes[2];
				}
				if (mappov !== 2) {
					players.children[1].position.z = bytes[3];
				}
			} else {
				console.error(`Unexpected data length received: ${bytes.length}. Data:`, bytes);
			}
		} else if (variables.partOfTournament == false) {
			const data = JSON.parse(event.data);
			
			const time = data.time;
			const score = data.scores;
			const names_list = data.players;
			gameRunning = false;
			cleanup();
			endGame(time, names_list, score, renderer);
		} else if (variables.partOfTournament == true) {
			cleanup();
			gameRunning = false;
			renderer.domElement.remove();
			variables.partOfTournament = false;
		}
	};

	socket.addEventListener('message', handleMessage);

    initText().then(text => {
        playerNames(mappov, names[0], names[1]).then(names => {
            group.add(text);
            group.add(names);
            scene.add(light);
            scene.add(group);
            animate();
        })
    }).catch(error => {
        console.error('Failed to load text:', error);
    });

	rem_listener = () => {
		cleanup();
		renderer.domElement.remove();
		handleRouting();
		const section = document.querySelector('section');
		if (section) {
			section.classList.remove('hidden');
		}
		cleanupBackground();
		initBackground();
		resumeAnimation();
	};

	window.addEventListener('popstate', rem_listener);

	socket.binaryType = 'arraybuffer';
    function animate() {
		if (mappov > 0)
		{
			const buffer = serializeData(mappov - 1, players.children[mappov - 1].position.x, players.children[mappov - 1].position.z);
			socket.send(buffer);
		}

		groupCornerLights.children[10].color.setHex(ball.color);
		groupCornerLights.children[11].color.setHex(ball.color);
		groupCornerLights.children[12].color.setHex(ball.color);
		groupCornerLights.children[9].color.setHex(ball.color);

        ball.animate();

		if (cameraFollow) {
			if (mappov === 1)
				camera.position.set(players.children[0].position.x - 4, players.children[0].position.y + 3.5, players.children[0].position.z);
			else if (mappov === 2)
				camera.position.set(players.children[1].position.x + 4, players.children[1].position.y + 3.5, players.children[1].position.z);
		}

		if (mappov > 0)
			updatePlayerPosition(players.children[mappov - 1]);

        controls.update();
        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

	function serializeData(playerID, positionX, positionY) {
	    const buffer = new ArrayBuffer(9);
		const view = new DataView(buffer);

	    view.setUint8(0, playerID ? 1 : 0); // 1 byte
	    view.setFloat32(1, positionX, true); // 4 bytes 
	    view.setFloat32(5, positionY, true); // 4 bytes
		return buffer;
	}

	function cleanup() {
		renderer.setAnimationLoop(null);
		window.removeEventListener('resize', onWindowResize);
		window.removeEventListener('keydown', boundOnKeydown);
		window.removeEventListener('keyup', boundOnKeyup);
		window.removeEventListener('popstate', rem_listener);
		socket.removeEventListener('message', handleMessage);
		socket.close();
		controls.dispose();
		group.clear();
		scene.clear();
		renderer.dispose();

		const lobbySock = getSocket();
		if (lobbySock) {
			lobbySock.close();
		}
	}

	function sleep(s) {
		return new Promise(resolve => setTimeout(resolve, s * 1000));
	}

}

function updatePlayerPosition(player)
{
	if (player.position.x < 0 && player.position.z < -3.4)
		player.position.z = -3.4;
	if (player.position.x < 0 && player.position.z > 3.4)
		player.position.z = 3.4;
	if (player.position.x > 0 && player.position.z < -3.4)
		player.position.z = -3.4;
	if (player.position.x > 0 && player.position.z > 3.4)
		player.position.z = 3.4;

	if (player.position.x < 0)
	{
		if ((keys.a || keys.ArrowLeft) && player.position.z > -3.4) {
			player.position.z -= 0.2;
		}
		if ((keys.d || keys.ArrowRight) && player.position.z < 3.4) {
			player.position.z += 0.2;
		}
	}
	else
	{
		if ((keys.a || keys.ArrowLeft) && player.position.z < 3.4) {
			player.position.z += 0.2;
		}
		if ((keys.d || keys.ArrowRight) && player.position.z > -3.4) {
			player.position.z -= 0.2;
		}
	}

}

function onKeydown(event, camera) {
	if (event.key in keys) {
		keys[event.key] = true;
	}
	else if (event.key === ' ') {
		if (camera.position.x < 0) {
			if (cameraIndex % 3 === 0) {
				cameraFollow = false;
				camera.position.set(-0.1, 12, 0);
			} else if (cameraIndex % 3 === 1) {
				cameraFollow = false;
				camera.position.set(-10, 3, 6.123233995736766e-16);
			} else if (cameraIndex % 3 === 2) {
				cameraFollow = true;
			}
		} else {
			if (cameraIndex % 3 === 0) {
				cameraFollow = false;
				camera.position.set(0.1, 12, 0);
			} else if (cameraIndex % 3 === 1) {
				cameraFollow = false;
				camera.position.set(10, 3, 6.123233995736766e-16);
			} else if (cameraIndex % 3 === 2) {
				cameraFollow = true;
			}
		}
		if (cameraIndex > 100000) {
			cameraIndex = 1;
		} else {
			cameraIndex++;
		}
	}
}

function onKeyup(event) {
	if (event.key in keys) {
		keys[event.key] = false;
	}
}
