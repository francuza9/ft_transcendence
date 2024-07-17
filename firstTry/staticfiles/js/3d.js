import * as THREE from 'three';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

import { initCornerLights } from './objects/cornerLights.js';
import { initText } from './objects/text.js';

// camera

//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const sceneBox = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// const textureLoader = new THREE.TextureLoader();
// const texturea = textureLoader.load('../textures/background_temp.jpg', () => {
	// sceneBox.background = texturea;
// });

// correct camera position
camera.position.y = 0;
camera.position.z = 11;

// create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );


// create plane //
const geometryBox = new THREE.BoxGeometry( 12, 1, 9 );
const materialBox = new THREE.MeshStandardMaterial( { color: 0xffffff , wireframe: false, side:THREE.FrontSide} );
const cube = new THREE.Mesh( geometryBox, materialBox );
// cube.rotation.x = 0.7;

// create outline //const controls = new THREE.OrbitControls();
const geometryOutlineLen = new THREE.CapsuleGeometry(0.1, 7, 2,4);
const geometryOutlineWid = new THREE.CapsuleGeometry(2, 2, 4,8);
const materialOutline = new THREE.MeshLambertMaterial( {
	color: 0xff0000, 
	emissive: 0xff0000,
	emissiveIntensity: 5,})
const outlineLen1 = new THREE.Mesh(geometryOutlineLen, materialOutline);
const outlineLen2 = new THREE.Mesh(geometryOutlineLen, materialOutline);
const outlineWid1 = new THREE.Mesh(geometryOutlineWid, materialOutline);
const outlineWid2 = new THREE.Mesh(geometryOutlineWid, materialOutline);
// outlineLen1.rotation.x = 0.7;
outlineLen1.rotation.z = 1.5;
outlineLen1.position.x = 0.7;


// create light //
const groupCornerLights = new initCornerLights();

const light = new THREE.AmbientLight( 0xffffff, 1 );

const light1 = new THREE.SpotLight(0xffffff);



// controls
// const controls = new THREE.OrbitControls(camera, renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// create a group //
const group = new THREE.Group();

// add objects to group //
group.add(cube);
group.add(outlineLen1);
group.add(groupCornerLights);
group.add(initText());

// add objects to scene //
sceneBox.add(light);
sceneBox.add(group);

function animate() {
	// group.rotation.z += 0.5
	const radius = 3;
	const speed = 0.001;
	const angle = Date.now() * speed;
	const lightTarget = groupCornerLights.children.find(child => child === groupCornerLights.children[8]);
	if (lightTarget)
	{
		lightTarget.position.x = Math.cos(angle) * radius;
		lightTarget.position.z = Math.sin(angle) * radius;
	}

	controls.update();
	renderer.render(sceneBox, camera);
}
