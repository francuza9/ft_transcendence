import * as THREE from 'three';

export function createEdges(planeVectors, pcount)
{
	if (planeVectors.length < 9) { // At least 3 points (9 values) are needed to form a closed shape
        console.error("Not enough points to form a closed shape");
        return;
    }

	const x1 = planeVectors[0], y1 = planeVectors[1], z1 = planeVectors[2];
    const x2 = planeVectors[3], y2 = planeVectors[4], z2 = planeVectors[5];
	const edgeLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));

	const geometry = new THREE.CylinderGeometry(0.05, 0.05, edgeLength, 32);
	const geometrySmall = new THREE.CylinderGeometry(0.05, 0.05, 1, 32);
	const material = new THREE.MeshLambertMaterial( {color:0xffffff, emissive:0xffffff} );

	const group = new THREE.Group();
	for (let i = 0; i < pcount; i++)
	{
		const index1 = i * 3;
		const index2 = (i + 1) * 3;

		const startPoint = new THREE.Vector3(planeVectors[index1], planeVectors[index1 + 1], planeVectors[index1 + 2]);
		const startPointDown = new THREE.Vector3(planeVectors[index1], planeVectors[index1 + 1] - 1, planeVectors[index1 + 2]);
		const endPoint = new THREE.Vector3(planeVectors[index2], planeVectors[index2 + 1], planeVectors[index2 + 2]);
		const endPointDown = new THREE.Vector3(planeVectors[index2], planeVectors[index2 + 1] - 1, planeVectors[index2 + 2]);

		const midPoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, 0.5);
		const midPointDown = new THREE.Vector3().lerpVectors(startPointDown, endPointDown, 0.5);

		const edge = new THREE.Mesh(geometry, material);
		const edgeDown = new THREE.Mesh(geometry, material);
		edge.position.set(midPoint.x, midPoint.y, midPoint.z);
		edgeDown.position.set(midPointDown.x, midPointDown.y, midPointDown.z);
		
		const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();
		const up = new THREE.Vector3(0, 1, 0);
		const axis = new THREE.Vector3().crossVectors(up, direction).normalize();
		const angle = Math.acos(up.dot(direction));
		const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

		edge.quaternion.copy(quaternion);
		edgeDown.quaternion.copy(quaternion);

		group.add(edgeDown);
		group.add(edge);

		const smallEdge = new THREE.Mesh(geometrySmall, material);
		smallEdge.position.set(endPoint.x, endPoint.y - 0.5, endPoint.z);
		group.add(smallEdge);
	}
	return (group);
}