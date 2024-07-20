import * as THREE from 'three';

export function buildDesert(plane, scene) {
    const group = new THREE.Group();

    // Load the texture
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/static/src/textures/desert.jpg');
    const textureScene = loader.load('/static/src/textures/desert_background.jpg');
	const textureP = loader.load('/static/src/textures/pyramid.jpg');

    // Set the scene background to textureScene
    scene.background = textureScene;

    // If 'plane' is a mesh and you want to apply the texture to it
    if (plane instanceof THREE.Mesh) {
        plane.material.map = texture;
        plane.material.needsUpdate = true; // Ensure the material update is flagged
    }

    // Create the geometry for the mountain
    const geometry = new THREE.CircleGeometry(100, 32);

    // Create the material with the texture for the mountain
    const material = new THREE.MeshStandardMaterial({ map: texture });

    // Create the mesh with the geometry and textured material
    const desert = new THREE.Mesh(geometry, material);

	const geometryPs = new THREE.CylinderGeometry(0.1, 20, 20, 4);
	const geometryP = new THREE.CylinderGeometry(0.1, 12.5, 12.5, 4);
	const materialP = new THREE.MeshStandardMaterial({ map: textureP });
	const pyramidS = new THREE.Mesh(geometryPs, materialP);
	const pyramid = new THREE.Mesh(geometryP, materialP);

	pyramidS.position.set(-40, 0, -10);
	pyramid.position.set(15, 0, -15);	

	desert.rotation.x = -Math.PI / 2;
	desert.position.y = 0.45;

	group.add(pyramidS);
	group.add(pyramid);
    group.add(desert);

    return group;
}