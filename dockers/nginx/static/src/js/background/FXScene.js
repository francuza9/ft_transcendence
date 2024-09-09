import * as THREE from "three";

const objCount = 2000;
function getMeshProps() {
const arr = [];
for (let i = 0; i < objCount; i += 1) {
	arr.push(
	{
		position: {
		x: Math.random() * 10000 - 5000,
		y: Math.random() * 6000 - 3000,
		z: Math.random() * 8000 - 4000
		},
		rotation: {
		x: Math.random() * 2 * Math.PI,
		y: Math.random() * 2 * Math.PI,
		z: Math.random() * 2 * Math.PI,
		},
		scale: Math.random() * 200 + 100
	}
	)
}
return arr;
}

const dummyProps = getMeshProps();
function getMesh(material, needsAnimatedColor = false, size = 0.5) {
	const geometry = new THREE.IcosahedronGeometry(size, 1);
	const mesh = new THREE.InstancedMesh(geometry, material, objCount);

	const dummy = new THREE.Object3D();
	const color = new THREE.Color();
	let props;
	for (let i = 0; i < objCount; i++) {
		props = dummyProps[i];
		dummy.position.x = props.position.x;
		dummy.position.y = props.position.y;
		dummy.position.z = props.position.z;

		dummy.rotation.x = props.rotation.x;
		dummy.rotation.y = props.rotation.y;
		dummy.rotation.z = props.rotation.z;

		dummy.scale.set(props.scale, props.scale, props.scale);

		dummy.updateMatrix();

		mesh.setMatrixAt(i, dummy.matrix);
		if (needsAnimatedColor) { mesh.setColorAt(i, color.setScalar(0.1 + 0.9 * Math.random())); }
	}
	return mesh;
}

let removeListener;

export function getFXScene({ renderer, material, clearColor, needsAnimatedColor = false }) {
	const w = window.innerWidth;
	const h = window.innerHeight;
	const camera = new THREE.PerspectiveCamera(50, w / h, 1, 10000);
	camera.position.z = 2000;

	// Load the texture but don't apply it immediately
	const textureLoader = new THREE.TextureLoader();
	const texture = textureLoader.load('/static/src/images/gtskitis.jpg');

	// Create the textured material
	const texturedMaterial = new THREE.MeshStandardMaterial({
		map: texture,
	});

	// Setup the initial scene with the provided material
	const scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(clearColor, 0.0002);

	scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 1.0));
	const mesh = getMesh(material, needsAnimatedColor);
	scene.add(mesh);

	const fbo = new THREE.WebGLRenderTarget(w, h);

	const rotationSpeed = new THREE.Vector3(0.01, -0.02, 0.015);
	let colorChangeEnabled = needsAnimatedColor;

	const update = (delta) => {
		mesh.rotation.x += delta * rotationSpeed.x;
		mesh.rotation.y += delta * rotationSpeed.y;
		mesh.rotation.z += delta * rotationSpeed.z;
		if (colorChangeEnabled) {
			material.color.setHSL(0.1 + 0.5 * Math.sin(0.0002 * Date.now()), 1, 0.5);
		}
	}

	const render = (delta, rtt) => {
		update(delta);

		renderer.setClearColor(clearColor);

		if (rtt) {
			renderer.setRenderTarget(fbo);
			renderer.clear();
			renderer.render(scene, camera);
		} else {
			renderer.setRenderTarget(null);
			renderer.render(scene, camera);
		}
	};

	let isTextured = false; 

	const handleKeyPress = (event) => {
		if (event.key.toLowerCase() === 'g') {
			isTextured = !isTextured; 

			if (isTextured) {
				mesh.material = texturedMaterial; 
				colorChangeEnabled = false; 
			} else {
				mesh.material = material; 
				colorChangeEnabled = needsAnimatedColor; 
			}
		}
	};

	window.addEventListener('keydown', handleKeyPress);

	removeListener = () => {
		window.removeEventListener('keydown', handleKeyPress);
	};

	return { fbo, render, update, removeListener };
};

export { removeListener };

