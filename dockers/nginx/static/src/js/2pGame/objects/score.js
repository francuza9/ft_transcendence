import * as THREE from 'three';

import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/FontLoader.js';

export function initScore(score) {
    return new Promise((resolve, reject) => {
        const loader = new FontLoader();
        loader.load('/static/src/fonts/Roboto_Regular.json', function (font) {
            const geometry = new TextGeometry(`${score[0]} : ${score[1]}`, {
                font: font,
                size: 2,
                height: 0.05,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.01,
                bevelOffset: 0,
                bevelSegments: 5
            });

            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const textMesh = new THREE.Mesh(geometry, material);
            textMesh.position.z = -3;
            textMesh.position.x = -2.5;
            textMesh.position.y = 5;

            resolve(textMesh);
        }, undefined, reject);
    });
}

export function updateScore(newScore, scoremesh) {
    let score = newScore;
    const loader = new FontLoader();
    loader.load('/static/src/fonts/Roboto_Regular.json', function (font) {
        const geometry = new TextGeometry(`${score[0]} : ${score[1]}`, {
            font: font,
            size: 2,
            height: 0.05,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 5
        });

		let color;
        if (score[0] > score[1]) {
            color = 0xd11913; // Red
        } else if (score[0] < score[1]) {
            color = 0x1653e0; // Blue
        } else {
            color = 0xffffff; // White
        }

        // Update the material color
        scoremesh.material.color.setHex(color);

        scoremesh.geometry.dispose(); // Dispose of the old geometry
        scoremesh.geometry = geometry; // Set the new geometry
    });
}