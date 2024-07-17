import * as THREE from 'three';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/FontLoader.js';

export function initText()
{
	const	loader = new FontLoader();
	let geometry;
	// load a font
	loader.load('./static/src/js/fonts/Roboto_Regular.json', function (font) {
		geometry = new TextGeometry( 'transcendence', {
			font: font,
			size: 80,
			depth: 5,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 10,
			bevelSize: 8,
			bevelOffset: 0,
			bevelSegments: 5
		} );
	});
	const material = new THREE.MeshLambertMaterial( {color: 0xffffff, emissive: 0xff00ff, emissiveIntensity: 2} );
	const text = new THREE.Mesh(geometry, material);


	return (text);
}