import * as THREE from 'three';

export function initRenderer()
{
    const existingCanvas = document.querySelector('canvas');
	if (existingCanvas)
		existingCanvas.remove();
	const renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize( window.innerWidth, window.innerHeight);
	document.body.appendChild( renderer.domElement );

	return (renderer);
}

export function initCamera(n)
{
	const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	
	if (n != 1 && n != 2)
	{
		camera.position.y = 10;
		camera.position.z = 9;
	}
	else if (n == 1)
	{
		camera.position.y = 3;
		camera.position.x = -10;
	}
	else if (n == 2)
	{
		camera.position.y = 3;
		camera.position.x = 10;
	}
	return (camera);
}

export function initScene()
{
	return (new THREE.Scene());
}
