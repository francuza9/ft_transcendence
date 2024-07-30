import * as THREE from 'three';

const PI = 3.141592653589793;

export function initPlane()
{
	const geometry = new THREE.BoxGeometry( 12, 1, 9 );
	const material = new THREE.MeshStandardMaterial( { color: 0x000000} );
	const plane = new THREE.Mesh( geometry, material );

	return (plane);
}

export function initWalls(n)
{
	const material = new THREE.MeshStandardMaterial( {color: 0x000000} )
	const materialNeon = new THREE.MeshLambertMaterial( {color:0xffffff, emissive:0xffffff} )

	const geometryx = new THREE.BoxGeometry(12, 1, 0.01);
	const geometryy = new THREE.BoxGeometry(0.01, 1, 9);
	const geometryxn = new THREE.CylinderGeometry(0.025, 0.025, 12);
	const geometryyn = new THREE.CylinderGeometry(0.025, 0.025, 9);

	const x2 = new THREE.Mesh(geometryx, material);
	const x2n = new THREE.Mesh(geometryxn, materialNeon);
	x2.position.z = 4.5;
	x2.position.y = 1;
	x2n.rotation.z = PI / 2;
	x2n.position.z = 4.5;
	x2n.position.y = 1.5;

	const x1 = new THREE.Mesh(geometryx, material);
	const x1n = new THREE.Mesh(geometryxn, materialNeon);
	x1.position.z = -4.5;
	x1.position.y = 1;
	x1n.rotation.z = PI / 2;
	x1n.position.z = -4.5;
	x1n.position.y = 1.5;

	const y1 = new THREE.Mesh(geometryy, material);
	const y1n = new THREE.Mesh(geometryyn, materialNeon);
	y1.position.x = -6;
	y1.position.y = 1;
	y1n.rotation.x = PI / 2;
	y1n.position.x = -6;
	y1n.position.y = 1.5;

	const y2 = new THREE.Mesh(geometryy, material);
	const y2n = new THREE.Mesh(geometryyn, materialNeon);
	y2.position.x = 6;
	y2.position.y = 1;
	y2n.rotation.x = PI / 2;
	y2n.position.x = 6;
	y2n.position.y = 1.5;

	const group = new THREE.Group();
	if (n != 1)
	{
		group.add(x2);
		group.add(x2n);
	}
	if (n != 4)
	{
		group.add(x1);
		group.add(x1n);
	}
	if (n != 2)
	{
		group.add(y1);
		group.add(y1n);
	}
	if (n != 3)
	{
		group.add(y2);
		group.add(y2n);
	}
	return (group);
}

export function initEdges(n)
{
	const geometryx = new THREE.CylinderGeometry(0.05, 0.05, 12);
	const geometryz = new THREE.CylinderGeometry(0.05, 0.05, 9);
	const geometryy = new THREE.CylinderGeometry(0.05, 0.05, 1);

	const material = new THREE.MeshLambertMaterial( {color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 10});

	const x1 = new THREE.Mesh(geometryx, material);
	x1.rotation.z += PI / 2;
	x1.position.z += -4.5;
	x1.position.y += 0.5;
	const x2 = new THREE.Mesh(geometryx, material);
	x2.rotation.z += PI / 2;
	x2.position.z += 4.5;
	x2.position.y += 0.5;
	const x3 = new THREE.Mesh(geometryx, material);
	x3.rotation.z += PI / 2;
	x3.position.z += 4.5;
	x3.position.y += -0.5;
	const x4 = new THREE.Mesh(geometryx, material);
	x4.rotation.z += PI / 2;
	x4.position.z += -4.5;
	x4.position.y += -0.5;

	const y1 = new THREE.Mesh(geometryy, material);
	y1.position.z += 4.5;
	y1.position.x += 6;
	const y2 = new THREE.Mesh(geometryy, material);
	y2.position.z += 4.5;
	y2.position.x += -6;
	const y3 = new THREE.Mesh(geometryy, material);
	y3.position.z += -4.5;
	y3.position.x += 6;
	const y4 = new THREE.Mesh(geometryy, material);
	y4.position.z += -4.5;
	y4.position.x += -6;

	const z1 = new THREE.Mesh(geometryz, material);
	z1.rotation.x += PI / 2;
	z1.position.x += -6;
	z1.position.y += 0.5;
	const z2 = new THREE.Mesh(geometryz, material);
	z2.rotation.x += PI / 2;
	z2.position.x += 6;
	z2.position.y += 0.5;
	const z3 = new THREE.Mesh(geometryz, material);
	z3.rotation.x += PI / 2;
	z3.position.x += 6;
	z3.position.y += -0.5;
	const z4 = new THREE.Mesh(geometryz, material);
	z4.rotation.x += PI / 2;
	z4.position.x += -6;
	z4.position.y += -0.5;



	const group = new THREE.Group();

	group.add(x1);
	group.add(x2);
	group.add(x3);
	group.add(x4);

	group.add(y1);
	group.add(y2);
	group.add(y3);
	group.add(y4);

	if (n != 2)
		group.add(z1);
	if (n != 3)
		group.add(z2);
	group.add(z3);
	group.add(z4);

	return (group);
}