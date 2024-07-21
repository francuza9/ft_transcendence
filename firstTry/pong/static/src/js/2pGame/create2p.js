import * as THREE from 'three';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/FontLoader.js';

import { initScene, initCamera, initRenderer} from './firstRun/init.js';
import { initCornerLights } from './objects/cornerLights.js';
import { initText } from './objects/text.js';
import { initPlane, initEdges, initWalls} from './objects/plane.js';
import { initPlayers } from './objects/players.js';
import { Ball } from './objects/ball.js';
import { playerNames } from './objects/playerNames.js';
import { initScore } from './objects/score.js';

const group = new THREE.Group();
let keys = {
	"w": false,
	"s": false,
	"ArrowUp": false,
	"ArrowDown": false
};
let score = [0, 0];
let scoremesh = 0;

initScore(score).then(scorea => {
	scoremesh = scorea;
	group.add(scoremesh);
}).catch(error => {console.error('Failed to load score:', error);})

export function create2Pgame(mappov)
{
	const scene = initScene();
	const camera = initCamera(mappov);
	const renderer = initRenderer();
	renderer.setAnimationLoop( animate );

		// create plane and edges
	const plane = new initPlane();
	const planeEdges = new initEdges(mappov + 1);

	// create walls
	const walls = new initWalls(mappov + 1);

	// create players
	const players = new initPlayers(mappov + 1);

	// create ball
	let ball = new Ball();
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
	group.add(groupCornerLights);

	window.addEventListener('resize', onWindowResize, false);
	document.addEventListener('keydown', onKeydown);
	document.addEventListener('keyup', onKeyup);

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
		
		checkCollision(ball, players, score, lights, scoremesh);
		controls.update();
		renderer.render(scene, camera);
		updatePlayerPositions(players);
	}

	function onWindowResize() {
    	camera.aspect = window.innerWidth / window.innerHeight;
    	camera.updateProjectionMatrix();
    	renderer.setSize(window.innerWidth, window.innerHeight);
	}
}

function updatePlayerPositions(players) {
    const p1 = players.children[0];
    const p2 = players.children[1];

    if (keys.w && p1.position.z > -3.5) {
        p1.position.z -= 0.1;
    }
    if (keys.s && p1.position.z < 3.5) {
        p1.position.z += 0.1;
    }
    if (keys.ArrowUp && p2.position.z > -3.5) {
        p2.position.z -= 0.1;
    }
    if (keys.ArrowDown && p2.position.z < 3.5) {
        p2.position.z += 0.1;
    }
}

function checkCollision(ball, players, score, lights, scoremesh)
{
	const p1 = players.children[0];
	const p2 = players.children[1];

	let relativeinter;
	let bounceangle;

	if (ball.ball.position.z > 4.1 || ball.ball.position.z < -4.1)
		ball.direction.z *= -1;
	if (ball.ball.position.x > 5 && ball.ball.position.z < p2.position.z + 1 && ball.ball.position.z > p2.position.z - 1
		|| ball.ball.position.x < -5 && ball.ball.position.z < p1.position.z + 1 && ball.ball.position.z > p1.position.z - 1)
	{
		if (ball.ball.position.x > 5)
		{
			relativeinter = p2.position.z - ball.ball.position.z;
			bounceangle = relativeinter * Math.PI / 4;
			ball.direction.z = Math.sin(-bounceangle);
		}
		else
		{
			relativeinter = p1.position.z - ball.ball.position.z;
			bounceangle = relativeinter * Math.PI / 4;
			ball.direction.z = Math.sin(-bounceangle);
		}
		ball.direction.x *= -1;
		if (ball.speed < 0.8)
			ball.speed += 0.01;
		if (ball.direction.x > 0)
		{
			ball.color = 0xff0000;
			for (let i = 0; i < 4; i++)
				lights[i].color.setHex(0xff0000);
		}
		else
		{
			ball.color = 0x0000ff;
			for (let i = 0; i < 4; i++)
				lights[i].color.setHex(0x0000ff);
		}
		ball.ball.material.color.setHex(ball.color);
	}
	if (ball.ball.position.x > 5.5)
	{
		score[0]++;
		ball.reset();
		for (let i = 0; i < 4; i++)
			lights[i].color.setHex(0xffffff);
		updateScoreText(score);
	}
	if (ball.ball.position.x < -5.5)
	{
		score[1]++;
		ball.reset();
		for (let i = 0; i < 4; i++)
			lights[i].color.setHex(0xffffff);
		updateScoreText(score);
	}
	// Check if scoremesh has a material and if that material has a color property
	if (scoremesh.material && scoremesh.material.color) {
	    if (score[0] > score[1])
	        scoremesh.material.color.setHex(0xff0000); // Set to red
	    else if (score[0] < score[1])
	        scoremesh.material.color.setHex(0x0000ff); // Set to blue
	    else
	        scoremesh.material.color.setHex(0xffffff); // Set to white
	} else {
	    console.error("Material or color property not found on scoremesh.");
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

function updateScoreText(score) {
    // Assuming scoreTextMesh is the global or accessible text mesh for the score
    const newScoreText = `${score[0]} : ${score[1]}`;

    // Ensure the font is loaded correctly before creating new TextGeometry
    const fontLoader = new FontLoader();
    fontLoader.load('/static/src/fonts/Roboto_Regular.json', function(font) {
        // Update the geometry of the text mesh to reflect the new score
        const geometry = new TextGeometry(newScoreText, {
            font: font, // Use the loaded font
            size: 2,
            height: 0.05,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 5
        });

        scoremesh.geometry.dispose(); // Dispose of the old geometry
        scoremesh.geometry = geometry; // Assign the new geometry

        // Reapply the material if not done automatically
        if (!scoremesh.material) {
            scoremesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Adjust color as needed
        }
    });
}
