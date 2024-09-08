import * as THREE from 'three';

const PI = 3.141592653589793;

export function initPlayers(n)
{
	const geometrySmall = new THREE.CylinderGeometry(0.1,0.1, 2);
	const geometryBig = new THREE.BoxGeometry(0.2, 0.2, 2);
	const materialp1 = new THREE.MeshLambertMaterial( {color:0xd11913, emissive: 0xd11913} );
	const materialp2 = new THREE.MeshLambertMaterial( {color:0x1653e0, emissive: 0x1653e0} );

	const group = new THREE.Group();

	// create player 1
	if (n === 2)
	{
		const p1 = new THREE.Mesh(geometrySmall, materialp1);
		p1.rotation.x = PI / 2;
		p1.position.x = -6;
		p1.position.y = 0.5;
		group.add(p1);
	}
	else
	{
		const p1 = new THREE.Mesh(geometryBig, materialp1);
		p1.position.x = -5.9;
		p1.position.y = 0.6;
		group.add(p1);
	}
	if (n === 3)
	{
		const p2 = new THREE.Mesh(geometrySmall, materialp2);
		p2.rotation.x = PI / 2;
		p2.position.x = 6;
		p2.position.y = 0.5;
		group.add(p2);
	}
	else
	{
		const p2 = new THREE.Mesh(geometryBig, materialp2);
		p2.position.x = 5.9;
		p2.position.y = 0.6;
		group.add(p2);
	}

	return (group);
}