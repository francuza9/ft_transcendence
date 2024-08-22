import * as THREE from 'three';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

import { initScene, initCamera, initRenderer } from './init.js';
import { initCornerLights } from './objects/cornerLights.js';
import { initText } from './objects/text.js';
import { initPlane, initEdges, initWalls } from './objects/plane.js';
import { initPlayers } from './objects/players.js';
import { Ball } from './objects/ball.js';
import { playerNames } from './objects/playerNames.js';
import { initScore, updateScore } from './objects/score.js';
// import { checkCollision } from './local.js';

const group = new THREE.Group();
export let keys = {
	"a": false,
	"d": false,
	"ArrowLeft": false,
	"ArrowRight": false,
};
let score = [0, 0];
export let scoremesh = 0;


initScore(score).then(scorea => {
    scoremesh = scorea;
    group.add(scoremesh);
}).catch(error => { console.error('Failed to load score:', error); })

export function create2Pgame(mappov, socket) {
	if (mappov > 2)
		mappov = 0;
    const scene = initScene();
    const camera = initCamera(mappov);
    const renderer = initRenderer();
    renderer.setAnimationLoop(animate);

    // create plane and edges
    const plane = new initPlane();
    const planeEdges = new initEdges(mappov + 1);

    // create walls
    const walls = new initWalls(mappov + 1);

    // create players
    const players = new initPlayers(mappov + 1);

    // create ball
    let ball = new Ball(scene);
    const ballmesh = ball.getMesh();

    // create light
    const groupCornerLights = new initCornerLights(ballmesh);
    const light = new THREE.AmbientLight(0xffffff, 1);

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

    let p;
    if (mappov === 1)
        p = 'player_1';
    else if (mappov === 2)
        p = 'player_2';

	socket.onerror = function(event) {
		console.error('WebSocket error observed:', event);
	};

    // Wrap the event handlers to pass the additional arguments
    const boundOnKeydown = (event) => onKeydown(event, camera);
    const boundOnKeyup = (event) => onKeyup(event);

    window.addEventListener('keydown', boundOnKeydown, false);
    window.addEventListener('keyup', boundOnKeyup, false);

	socket.addEventListener('message', event => {
		if (event.data instanceof ArrayBuffer) {
			const bytes = new Float32Array(event.data);
			console.log("bytes: ", bytes);
			if (bytes.length >= 9) {
				ball.direction.x = bytes[0];
				ball.direction.z = bytes[1];
				ball.ball.position.x = bytes[2];
				ball.ball.position.z = bytes[3];
				players.children[0].position.z = bytes[4];
				players.children[1].position.z = bytes[5];
				ball.speed = bytes[6];
				const scoremeshIndex = group.children.findIndex(child => child === scoremesh);
				const score1 = new DataView(event.data).getInt32(28, true);  // Correctly reading the integer
				const score2 = new DataView(event.data).getInt32(32, true);  // Correctly reading the integer
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
				if (mappov - 1 !== 0) {
					players.children[0].position.z = bytes[2];
				} else if (mappov - 1 !== 1) {
					players.children[1].position.z = bytes[3];
				}
			} else if (bytes.length >= 2){
				window.removeEventListener('keydown', boundOnKeydown, false);
				window.removeEventListener('keyup', boundOnKeyup, false);
				socket.removeEventListener('message', event);
				const score1 = new DataView(event.data).getInt32(0, true);
				const score2 = new DataView(event.data).getInt32(4, true);
				console.log("game finished, score1: ", score1, "score2: ", score2);
			} else {
				console.error(`Unexpected data length received: ${bytes.length}. Data:`, bytes);
			}
		}
	});


    // add objects to scene
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

	socket.binaryType = 'arraybuffer';
    function animate() {
		
		if (mappov > 0)
		{
			// console.log(players.children[0].position.z);
			const buffer = serializeData(mappov - 1, players.children[mappov - 1].position.x, players.children[mappov - 1].position.z);
			socket.send(buffer);
		}

		groupCornerLights.children[10].color.setHex(ball.color);
		groupCornerLights.children[11].color.setHex(ball.color);
		groupCornerLights.children[12].color.setHex(ball.color);
		groupCornerLights.children[9].color.setHex(ball.color);

        ball.animate();
        // render

		// checkCollision(ball, players, score, lights, scoremesh);
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

	// Function to serialize player data into a binary format
	function serializeData(playerID, positionX, positionY) {
	    const buffer = new ArrayBuffer(9); // 1 byte (playerID) + 4 bytes (positionX) + 4 bytes (positionY)
		const view = new DataView(buffer);

	    // Write playerID as a boolean (0 or 1) into the first byte
	    view.setUint8(0, playerID ? 1 : 0); // 1 byte

	    // Write positionX and positionY as 32-bit floats into the next 8 bytes
	    view.setFloat32(1, positionX, true); // 4 bytes (little-endian)
	    view.setFloat32(5, positionY, true); // 4 bytes (little-endian)

	    return buffer;
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
		if (camera.position.x < -7)
			camera.position.set(-0.1, 12, 0);
		else if (camera.position.x < 0)
			camera.position.set(-10, 3, 6.123233995736766e-16);
		else if (camera.position.x > 7)
			camera.position.set(0.1, 12, 0);
		else
			camera.position.set(10, 3, 6.123233995736766e-16);
	}
}

function onKeyup(event) {
	if (event.key in keys) {
		keys[event.key] = false;
	}
}
