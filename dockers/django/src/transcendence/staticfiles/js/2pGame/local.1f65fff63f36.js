import * as THREE from 'three';

import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/FontLoader.js';
import { keys, scoremesh } from './create2p.js';

export function updatePlayerPositions(players) {
    const p1 = players.children[0];
    const p2 = players.children[1];

    if (keys.w && p1.position.z > -3.5) {
        p1.position.z -= 0.2;
    }
    if (keys.s && p1.position.z < 3.5) {
        p1.position.z += 0.2;
    }
    if (keys.ArrowUp && p2.position.z > -3.5) {
        p2.position.z -= 0.2;
    }
    if (keys.ArrowDown && p2.position.z < 3.5) {
        p2.position.z += 0.2;
    }
}

export function checkCollision(ball, players, score, lights, scoremesh)
{
	const p1 = players.children[0];
	const p2 = players.children[1];

	let relativeinter;
	let bounceangle;

	if (ball.ball.position.z > 4.1 || ball.ball.position.z < -4.1)
        ball.direction.z *= -1;
	if (ball.ball.position.x > 5.3 && ball.ball.position.z - 0.125 < p2.position.z + 1 && ball.ball.position.z + 0.125 > p2.position.z - 1
		|| ball.ball.position.x < -5.3 && ball.ball.position.z - 0.125 < p1.position.z + 1 && ball.ball.position.z + 0.125 > p1.position.z - 1)
	{
		if (ball.ball.position.x > 5.2)
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
		if (ball.speed < 0.3)
			ball.speed += 0.02;
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
		return ;
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
	if (scoremesh === 0)
		return ;
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
