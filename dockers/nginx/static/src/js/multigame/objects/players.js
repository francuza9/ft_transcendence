import * as THREE from 'three';

export function createPlayers(pcount, pov, vectorObjects)
{
	const group = new THREE.Group();
	
	if (pov > 0) {
		const me = createMe(pov, vectorObjects);
		group.add(me);
	}

	createOthers(pcount, pov, vectorObjects, group);
	
	return (group);
}

function createMe(pov, vectorObjects) {
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 2);
	const colors = ['#FF0000', '#FF5733', '#00FF00', '#800080', '#0000FF', '#00FFFF', '#FFFF00', '#FF00FF'];
    const material = new THREE.MeshLambertMaterial({ color: colors[pov - 1], emissive: colors[pov - 1] });
    const me = new THREE.Mesh(geometry, material);

    const midX = (vectorObjects[pov - 1].x + vectorObjects[pov].x) / 2;
    const midY = 0.5; // Adjust if necessary
    const midZ = (vectorObjects[pov - 1].z + vectorObjects[pov].z) / 2;

    me.position.set(midX, midY, midZ);

    // Direction from the first vector object to the second
    const direction = new THREE.Vector3().subVectors(new THREE.Vector3(vectorObjects[pov].x, vectorObjects[pov].y, vectorObjects[pov].z), new THREE.Vector3(vectorObjects[pov - 1].x, vectorObjects[pov - 1].y, vectorObjects[pov - 1].z)).normalize();

    // Up vector
    const up = new THREE.Vector3(0, 1, 0);

    // Axis perpendicular to the direction and up vector
    const axis = new THREE.Vector3().crossVectors(up, direction).normalize();

    // Angle between the direction vector and the up vector
    const angle = Math.acos(up.dot(direction));

    // Quaternion for rotation
    const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

    me.quaternion.copy(quaternion);

    return me;
}


function createOthers(pcount, pov, vectorObjects, group) {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 2); // Size of the player box
    const scaleFactor = 1.02;
    const colors = ['#FF0000', '#FF5733', '#00FF00', '#800080', '#0000FF', '#00FFFF', '#FFFF00', '#FF00FF'];

    for (let i = 0; i < pcount; i++) {
        const midX = (vectorObjects[i].x + vectorObjects[i + 1].x) / 2 * scaleFactor;
        const midY = 0.75; // Assuming Y is up/down
        const midZ = (vectorObjects[i].z + vectorObjects[i + 1].z) / 2 * scaleFactor;

        const deltaX = vectorObjects[i + 1].x - vectorObjects[i].x;
        const deltaZ = vectorObjects[i + 1].z - vectorObjects[i].z;
        // Calculate the angle in radians between the direction vector and the Z-axis (forward direction)
        const angleY = Math.atan2(deltaX, deltaZ);

        const colorIndex = i % colors.length;
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(colors[colorIndex])
        });

        const player = new THREE.Mesh(geometry, material);
        player.position.set(midX, midY, midZ);
        // Rotate around Y-axis
        player.rotation.y = angleY;

        if (i + 1 != pov)
            group.add(player);
    }
}
