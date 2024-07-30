import * as THREE from 'three';

export function createLights(pcount, ball, planeVectors)
{
	const group = new THREE.Group();

	const bodies = createCones(pcount, planeVectors);
	const heads = createHeads(pcount, planeVectors);
	const bulbs = createBulbs(pcount, planeVectors);
	const cones = createLight(bulbs, ball);
	group.add(cones);
	group.add(heads);
	group.add(bodies);
	group.add(bulbs);

	return (group);
}

function createLight(bulbs, ball) {
    const group = new THREE.Group();
    const center = new THREE.Vector3(0, 0, 0); // Assuming the center is at (0, 0, 0)
    const moveFactor = 0.9; // Factor to move light towards center (0.8 means 80% towards the center)

    bulbs.children.forEach(bulb => {
        // Calculate new position closer to center
        const newPosition = new THREE.Vector3().lerpVectors(bulb.position, center, 1 - moveFactor);

        // Create light sources at the new, adjusted positions
        const light = new THREE.SpotLight(0xffffff, 50, 10, 0.4, 0.5, 2);
        light.position.copy(newPosition); // Using the adjusted position

        light.target = ball; // Setting the target to 'ball'
        light.castShadow = true;

        group.add(light);
    });

    return group;
}

function createBulbs(pcount, planeVectors)
{
	const group = new THREE.Group();

	const sphereRadius = 0.15;
    const sphereMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, emissive: 0xffffff}); // Adjust the color as needed
	const scaleTowardsCenter = 0.97; // Scale factor to move bulbs closer to center, adjust as needed

    for (let i = 0; i < pcount; i++) {
        const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

        // Adjust position to be closer to center
		const heightOffset = 3.2;

        sphere.position.set(
            planeVectors[i].x * scaleTowardsCenter, 
            planeVectors[i].y + heightOffset, 
            planeVectors[i].z * scaleTowardsCenter
        );

        group.add(sphere);
    }
	
	return (group);
}

function createHeads(pcount, planeVectors)
{
	const group = new THREE.Group();

	const radiusTop = 0.15; // Smaller top radius
    const radiusBottom = 0.35; // Larger bottom radius for the "head" part
    const height = 0.7; // Height of the head cylinders
    const radialSegments = 32; // Number of segmented faces around the circumference

    for (let i = 0; i < pcount; i++) {
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
        const material = new THREE.MeshStandardMaterial({color: 0x222222});
        const cone = new THREE.Mesh(geometry, material);

        const offsetFactor = 0.001;
        const offsetX = planeVectors[i].x * offsetFactor;
        const offsetZ = planeVectors[i].z * offsetFactor;

        cone.position.set(planeVectors[i].x - offsetX, planeVectors[i].y + height / 2 + 3, planeVectors[i].z - offsetZ);

        // Calculate the direction vector pointing slightly downwards towards the center
        const toCenterDownwards = new THREE.Vector3(cone.position.x, cone.position.y - 1, cone.position.z).normalize();

		toCenterDownwards.y -= 2;

        // Orient the cone to face this direction
        cone.lookAt(new THREE.Vector3().addVectors(cone.position, toCenterDownwards));

        group.add(cone);
    }

	return (group);
}

function createCones(pcount, planeVectors)
{
	const group = new THREE.Group();

	const radiusTop = 0.1; // Top radius of the cylinder
    const radiusBottom = 0.1; // Bottom radius of the cylinder
    const height = 4.6; // Height of the cylinder
    const radialSegments = 32; // Number of segmented faces around the circumference of the cylinder


	for (let i = 0; i < pcount; i++) {
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
        const material = new THREE.MeshStandardMaterial({color: 0x222222}); // Yellow color for visibility
        const cylinder = new THREE.Mesh(geometry, material);

		const scaleFactor = 1.01;
    	const scaledX = planeVectors[i].x * scaleFactor;
    	const scaledZ = planeVectors[i].z * scaleFactor;


        cylinder.position.set(scaledX, planeVectors[i].y + 1.2, scaledZ);

        group.add(cylinder);
    }

	return (group);
}
