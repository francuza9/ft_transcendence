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
	const edges = createEdges(planeVectors, pcount);

	const light = new THREE.AmbientLight( 0xffffff, 1 );

	// controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.update();

	window.addEventListener('resize', onWindowResize, false);

	group.add(plane);
	group.add(light);
	group.add(edges);

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

function createEdges(planeVectors, pcount)
{
	if (planeVectors.length < 9) { // At least 3 points (9 values) are needed to form a closed shape
        console.error("Not enough points to form a closed shape");
        return;
    }

	const x1 = planeVectors[0], y1 = planeVectors[1], z1 = planeVectors[2];
    const x2 = planeVectors[3], y2 = planeVectors[4], z2 = planeVectors[5];
	const edgeLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));

	const geometry = new THREE.CylinderGeometry(0.005, 0.005, edgeLength, 32);
	const geometrySmall = new THREE.CylinderGeometry(0.005, 0.005, 0.1, 32);
	const material = new THREE.MeshLambertMaterial( {color:0xffffff, emissive:0xffffff} );

	const group = new THREE.Group();
	for (let i = 0; i < pcount; i++)
	{
		const index1 = i * 3;
		const index2 = (i + 1) * 3;

		const startPoint = new THREE.Vector3(planeVectors[index1], planeVectors[index1 + 1], planeVectors[index1 + 2]);
		const startPointDown = new THREE.Vector3(planeVectors[index1], planeVectors[index1 + 1] - 0.1, planeVectors[index1 + 2]);
		const endPoint = new THREE.Vector3(planeVectors[index2], planeVectors[index2 + 1], planeVectors[index2 + 2]);
		const endPointDown = new THREE.Vector3(planeVectors[index2], planeVectors[index2 + 1] - 0.1, planeVectors[index2 + 2]);

		const midPoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, 0.5);
		const midPointDown = new THREE.Vector3().lerpVectors(startPointDown, endPointDown, 0.5);

		const edge = new THREE.Mesh(geometry, material);
		const edgeDown = new THREE.Mesh(geometry, material);
		edge.position.set(midPoint.x, midPoint.y, midPoint.z);
		edgeDown.position.set(midPointDown.x, midPointDown.y, midPointDown.z);
		
		const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();
		const up = new THREE.Vector3(0, 1, 0); // Assuming Y is up in your coordinate system
		const axis = new THREE.Vector3().crossVectors(up, direction).normalize();
		const angle = Math.acos(up.dot(direction));
		const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

		edge.quaternion.copy(quaternion);
		edgeDown.quaternion.copy(quaternion);

		group.add(edgeDown);
		group.add(edge);

		const smallEdge = new THREE.Mesh(geometrySmall, material);
		smallEdge.position.set(endPoint.x, endPoint.y - 0.05, endPoint.z);
		group.add(smallEdge);
	}
	return (group);
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

    camera.position.set(midPoint.x,0.7,midPoint.z);
	
	const direction = new THREE.Vector3(midPoint.x, 0, midPoint.z).normalize();
    const distance = 0.5; // Adjust distance as needed
    camera.position.x += direction.x * distance;
    camera.position.z += direction.z * distance;

    // Camera looks at the midpoint
    camera.lookAt(0, 0.5, 0);
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
