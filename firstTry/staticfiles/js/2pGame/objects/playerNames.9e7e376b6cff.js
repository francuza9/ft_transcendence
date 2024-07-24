import * as THREE from 'three';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/FontLoader.js';

const PI = Math.PI;

export function playerNames(pov, p1Name, p2Name) {
    return new Promise((resolve, reject) => {
        // Load font
        const loader = new FontLoader();
        loader.load('/static/src/fonts/Roboto_Regular.json', function (font) {
            // Create text geometry
            if (pov === 0) {
                const geometry1 = new TextGeometry(p1Name, {
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
                const geometry2 = new TextGeometry(p2Name, {
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
                const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });

                // Create mesh
                const p1Mesh = new THREE.Mesh(geometry1, material1);
				p1Mesh.rotation.y = PI / 4;
                p1Mesh.position.x = -8.5;
                p1Mesh.position.y = 4;

                const p2Mesh = new THREE.Mesh(geometry2, material2);
				p2Mesh.rotation.y = -(PI / 4);
				p2Mesh.position.z += -2.4;
                p2Mesh.position.x = 5.5;
                p2Mesh.position.y = 4;
				
                // Create group and add meshes
                const group = new THREE.Group();
                group.add(p1Mesh);
                group.add(p2Mesh);

                // Resolve the promise with the group
                resolve(group);
            }
			else if (pov === 1)
			{
				const geometry1 = new TextGeometry(p1Name, {
                    font: font,
                    size: 0.6,
                    height: 0.05,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.01,
                    bevelSize: 0.01,
                    bevelOffset: 0,
                    bevelSegments: 5
                });
                const geometry2 = new TextGeometry(p2Name, {
                    font: font,
                    size: 1.2,
                    height: 0.05,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.01,
                    bevelSize: 0.01,
                    bevelOffset: 0,
                    bevelSegments: 5
                });

                // Create material
                const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });

                // Create mesh
                const p1Mesh = new THREE.Mesh(geometry1, material1);
				p1Mesh.rotation.y = 3 * PI / 2;
                p1Mesh.position.x = -6.1;
				p1Mesh.position.z = -1.35;
                p1Mesh.position.y = -0.25;

                const p2Mesh = new THREE.Mesh(geometry2, material2);
				p2Mesh.rotation.y = -(PI / 2);
				p2Mesh.position.z = -3;
                p2Mesh.position.x = 4;
                p2Mesh.position.y = 3;
				
                // Create group and add meshes
                const group = new THREE.Group();
                group.add(p1Mesh);
                group.add(p2Mesh);

                // Resolve the promise with the group
                resolve(group);
			}
			else if (pov === 2)
			{
				const geometry1 = new TextGeometry(p1Name, {
                    font: font,
                    size: 1.2,
                    height: 0.05,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.01,
                    bevelSize: 0.01,
                    bevelOffset: 0,
                    bevelSegments: 5
                });
                const geometry2 = new TextGeometry(p2Name, {
                    font: font,
                    size: 0.6,
                    height: 0.05,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.01,
                    bevelSize: 0.01,
                    bevelOffset: 0,
                    bevelSegments: 5
                });

                // Create material
                const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });

                // Create mesh
                const p1Mesh = new THREE.Mesh(geometry1, material1);
				p1Mesh.rotation.y = PI / 2;
                p1Mesh.position.z = 3;
                p1Mesh.position.x = -4;
                p1Mesh.position.y = 3;

                const p2Mesh = new THREE.Mesh(geometry2, material2);
				p2Mesh.rotation.y = -(3 * PI / 2);
                p2Mesh.position.x = 6.1;
				p2Mesh.position.z = 1.5;
                p2Mesh.position.y = -0.25;
				
                // Create group and add meshes
                const group = new THREE.Group();
                group.add(p1Mesh);
                group.add(p2Mesh);

                // Resolve the promise with the group
                resolve(group);
			}
        }, undefined, reject);
    });
}
