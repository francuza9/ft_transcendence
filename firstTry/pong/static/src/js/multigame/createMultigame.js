import * as THREE from 'three';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

import { initScene, initCamera, initRenderer} from '../2pGame/firstRun/init.js';

const PI = Math.PI;

export function createMultigame(pcount, pov)
{
	const scene = initScene();
	const camera = initCamera(0);
	const renderer = initRenderer();
	renderer.setAnimationLoop( animate );

	const group = new THREE.Group();

	const plane = new initPlane(pcount);
	const planeVectors = plane.geometry.attributes.position.array;

	fixCamera(pov, planeVectors, camera);

	const light = new THREE.AmbientLight( 0xffffff, 1 );

	// controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.update();

	window.addEventListener('resize', onWindowResize, false);

	group.add(plane);
	group.add(light);

	scene.add(group);

	function animate() {
		// render
		controls.update();
		renderer.render(scene, camera);
	}

	function onWindowResize() {
    	camera.aspect = window.innerWidth / window.innerHeight;
    	camera.updateProjectionMatrix();
    	renderer.setSize(window.innerWidth, window.innerHeight);
	}
}

function fixCamera(n, planeVectors, camera) {
    if (n < 1 || n >= planeVectors.length / 3) {
        console.log("Invalid player pov");
        return;
    }

    // Directly using planeVectors which is a flat array of positions [x1, y1, z1, x2, y2, z2, ...]
    const index1 = (n - 1) * 3; // Start index for the first vector
    const index2 = n * 3; // Start index for the second vector

    // Creating vectors for the start and end points
    const startPoint = new THREE.Vector3(planeVectors[index1], planeVectors[index1 + 1], planeVectors[index1 + 2]);
    const endPoint = new THREE.Vector3(planeVectors[index2], planeVectors[index2 + 1], planeVectors[index2 + 2]);

    // Calculating the midpoint
    const midPoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, 0.5);

    // Setting the camera position to the midpoint and adjusting the z position
	// midPoint.x += 0.5;
	// midPoint.z += 0.5;
    camera.position.set(midPoint.x,0.7,midPoint.z);
	
	const direction = new THREE.Vector3(midPoint.x, 0, midPoint.z).normalize();
    const distance = 0.5; // Adjust distance as needed
    camera.position.x += direction.x * distance;
    camera.position.z += direction.z * distance;

	// camera.position.set(3,3,3);
    // Camera looks at the midpoint
    camera.lookAt(0, 0, 0);
}

function initPlane(n)
{
	const radiusTop = 1;
	const radiusBottom = radiusTop;
	const height = 0.1;
	const radialSegments = n;
	const heightSegments = 1;

	const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments);
	const material = new THREE.MeshStandardMaterial( {color: 0xffffff} );
	const item = new THREE.Mesh(geometry, material);

	return (item);
}
