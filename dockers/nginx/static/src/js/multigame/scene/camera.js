import * as THREE from 'three';

export function fixCamera(n, planeVectors, camera) {
    if (n < 1 || n >= planeVectors.length / 3) {
		camera.position.set(0, 20, 0);
    } else {
		// Directly using planeVectors which is a flat array of positions [x1, y1, z1, x2, y2, z2, ...]
		const index1 = (n - 1) * 3; // Start index for the first vector
		const index2 = n * 3; // Start index for the second vector

		// Creating vectors for the start and end points
		const startPoint = new THREE.Vector3(planeVectors[index1], planeVectors[index1 + 1], planeVectors[index1 + 2]);
		const endPoint = new THREE.Vector3(planeVectors[index2], planeVectors[index2 + 1], planeVectors[index2 + 2]);

		const midPoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, 0.5);
		camera.position.set(midPoint.x,7,midPoint.z);
		const direction = new THREE.Vector3(midPoint.x, 0, midPoint.z).normalize();
		const distance = 7;
		camera.position.x += direction.x * distance;
		camera.position.z += direction.z * distance;
	}
    camera.lookAt(0, 0.5, 0);
}