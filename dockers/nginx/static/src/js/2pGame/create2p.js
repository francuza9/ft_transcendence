import * as THREE from 'three';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

import { initScene, initCamera, initRenderer } from './init.js';
import { initCornerLights } from './objects/cornerLights.js';
import { initText } from './objects/text.js';
import { initPlane, initEdges, initWalls } from './objects/plane.js';
import { initPlayers } from './objects/players.js';
import { Ball } from './objects/ball.js';
import { playerNames } from './objects/playerNames.js';
import { initScore } from './objects/score.js';

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

    // Wrap the event handlers to pass the additional arguments
    const boundOnKeydown = (event) => onKeydown(event, socket, p);
    const boundOnKeyup = (event) => onKeyup(event, socket, p);

    window.addEventListener('keydown', boundOnKeydown, false);
    window.addEventListener('keyup', boundOnKeyup, false);

    // WebSocket message event listener
    socket.addEventListener('message', event => {
        const data = JSON.parse(event.data);
        // console.log('Received data:', data);
        if (data.ball_position) {
            ball.ball.position.x = data['ball_position']['x'];
            ball.ball.position.z = data['ball_position']['y'];
        }
		if (data.ball_speed) {
			ball.speed = data['ball_speed'];
		}
        if (data.players) {
            if (data['players']['player_1'] && mappov - 1 != 0) {
                players.children[0].position.z = data['players']['player_1']['y'];
            }
            if (data['players']['player_2'] && mappov - 1 != 1) {
				players.children[1].position.z = data['players']['player_2']['y'];
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


    function animate() {
		if (mappov > 0)
		{
			socket.send(JSON.stringify({
				"player": mappov,
				"position": players.children[mappov - 1].position.z,
			}));
		}
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
