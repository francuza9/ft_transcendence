import * as THREE from 'three';

export function initPlane(n)
{
	const radiusTop = 10.5;
	const radiusBottom = radiusTop;
	const height = 1;
	const radialSegments = n;
	const heightSegments = 1;

	const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments);
	const material = new THREE.MeshStandardMaterial( {color: 0xffffff} );
	const item = new THREE.Mesh(geometry, material);

	return (item);
}