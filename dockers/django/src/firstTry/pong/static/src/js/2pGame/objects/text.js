import * as THREE from 'three';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/FontLoader.js';


export function initText() {
    return new Promise((resolve, reject) => {
        // Load font
        const loader = new FontLoader();
        loader.load('/static/src/fonts/Roboto_Regular.json', function (font) {
            // Create text geometry
            const geometry = new TextGeometry('transcendence', {
                font: font,
                size: 0.8,
                height: 0.05,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.01,
                bevelOffset: 0,
                bevelSegments: 5
            });

            // Create material
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

            // Create mesh
            const textMesh = new THREE.Mesh(geometry, material);
			textMesh.position.z = 4.5;
			textMesh.position.x = -3.7;
			textMesh.position.y = -0.35;
            // Resolve promise with the text mesh
            resolve(textMesh);
        }, undefined, reject);
    });
}