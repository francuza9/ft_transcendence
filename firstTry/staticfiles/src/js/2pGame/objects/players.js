import * as THREE from 'three';

const PI = 3.141592653589793;

export function initPlayers(n)
{
	const geometrySmall = new THREE.CylinderGeometry(0.1,0.1, 2);
	const geometry = new THREE.BoxGeometry(0.5, 0.01, 2);
	const geometryBig = new THREE.BoxGeometry(0.2, 0.2, 2);
	const materialp1 = new THREE.MeshLambertMaterial( {color:0xff0000, emissive: 0xff0000} );
	const materialp2 = new THREE.MeshLambertMaterial( {color:0x0000ff, emissive: 0x0000ff} );

	const group = new THREE.Group();

	// create player 1
	if (n === 2)
	{
		const p1 = new THREE.Mesh(geometrySmall, materialp1);
		const p1hit = new THREE.Mesh(geometry, materialp1);
		p1.rotation.x = PI / 2;
		p1.position.x = -6;
		p1.position.y = 0.5;
		p1hit.position.x = -5.75;
		p1hit.position.y = 0.51;
		group.add(p1hit);
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
		const p2hit = new THREE.Mesh(geometry, materialp2);
		p2.rotation.x = PI / 2;
		p2.position.x = 6;
		p2.position.y = 0.5;
		p2hit.position.x = 5.75;
		p2hit.position.y = 0.51;
		group.add(p2hit);
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