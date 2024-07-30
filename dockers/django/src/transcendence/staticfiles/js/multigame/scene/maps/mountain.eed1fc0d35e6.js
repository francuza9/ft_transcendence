import * as THREE from 'three';

export function buildMountain(pcount, plane, scene) {
    const group = new THREE.Group();

    // Load the texture
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/static/src/textures/mountain_blue.jpg');
    const textureScene = loader.load('/static/src/textures/mountain_background.jpg');

    // Set the scene background to textureScene
    scene.background = textureScene;

    // If 'plane' is a mesh and you want to apply the texture to it
    if (plane instanceof THREE.Mesh) {
        plane.material.map = texture;
        plane.material.needsUpdate = true; // Ensure the material update is flagged
    }

    // Create the geometry for the mountain
    const geometry = new THREE.CylinderGeometry(10.5, 25, 15, pcount);

    // Create the material with the texture for the mountain
    const material = new THREE.MeshStandardMaterial({ map: texture });

    // Create the mesh with the geometry and textured material
    const mountain = new THREE.Mesh(geometry, material);

    mountain.position.y -= 8;

    group.add(mountain);

    return group;
}