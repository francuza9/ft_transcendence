import * as THREE from 'three';

export function buildHell(pcount, plane, scene, vectorObjects)
{
	const group = new THREE.Group();

	const offset = 0.8;

	const loader = new THREE.TextureLoader();
	const textureScene = loader.load('/static/src/textures/hell.jpg');
	const texture = loader.load('/static/src/textures/rocks.jpg');
	scene.background = textureScene;
	if (plane instanceof THREE.Mesh) {
        plane.material.map = texture;
        plane.material.needsUpdate = true; // Ensure the material update is flagged
    }

	for	(let i = 0; i < pcount; i++)
	{
		group.add(createChain(vectorObjects[i].x * offset, vectorObjects[i].z * offset));
	}

	return group;
}

function createChain(x, z) {
    const chain = new THREE.Group();
    const segmentHeight = 0.3; // Height of each chain segment
    const segmentCount = 20 / segmentHeight; // Number of segments to reach 20 units high
    const geometry = new THREE.TorusGeometry(0.2, 0.07, 16, 100);
	const loader = new THREE.TextureLoader();
    const texture = loader.load('/static/src/textures/chain.jpg');

    const material = new THREE.MeshBasicMaterial({ map: texture, color: 0x333333 });

    for (let i = 0; i < segmentCount; i++) {
        const segment = new THREE.Mesh(geometry, material);
        segment.position.set(x, i * segmentHeight, z);
        segment.rotation.x *= Math.PI / 2; // Rotate to make it vertical
		if (i % 2)
			segment.rotation.y = Math.PI / 2;
        chain.add(segment);
    }

    return chain;
}