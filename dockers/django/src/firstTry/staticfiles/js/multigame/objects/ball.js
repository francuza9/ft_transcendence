import * as THREE from 'three';

export function createBall()
{
	const geometry = new THREE.SphereGeometry(0.25, 32, 32);
	const material = new THREE.MeshLambertMaterial({color: 0xffffff, emissive: 0xffffff});
	const ball = new THREE.Mesh(geometry, material);

	ball.position.set(0, 0.75, 0);

	return (ball);
}