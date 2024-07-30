import * as THREE from 'three';

export function buildSpace(plane, scene, vectorObjects, pcount)
{
	const group = new THREE.Group();

	const loader = new THREE.TextureLoader();
	const texture = loader.load('/static/src/textures/circle.jpg');
	const textureScene = loader.load('/static/src/textures/space.jpg');
	scene.background = textureScene;
	if (plane instanceof THREE.Mesh) {
        plane.material.map = texture;
        plane.material.needsUpdate = true; // Ensure the material update is flagged
    }

	const bowl = createBowl();

	group.add(bowl);

	return group;
}

function createBowl() {
	const group = new THREE.Group();

    const loader = new THREE.TextureLoader();
    const texture = loader.load('/static/src/textures/scifi.jpg');

    const points = [];
    for (let i = 0; i < 10; i++) {
        points.push(new THREE.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
    }
    const geometry = new THREE.LatheGeometry(points);
    const material = new THREE.MeshBasicMaterial({ map: texture, color: 0x666666 });
    const lathe = new THREE.Mesh(geometry, material);

	const geometryS = new THREE.CylinderGeometry(12.54,12,0.001,12);
	const circle = new THREE.Mesh(geometryS, material);
	circle.position.y = 0.45;


    lathe.scale.set(0.85, 0.85, 0.85);
	lathe.position.y = -6.35;

	group.add(lathe);
	group.add(circle);

    return group;
}