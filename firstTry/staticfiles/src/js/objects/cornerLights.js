import * as THREE from 'three';

const PI = 3.141592653589793;


export function initCornerLights()
{
	const tempGroup = new THREE.Group();

	// creating cylinders on the corners
	const geometryCorners = new THREE.CylinderGeometry(0.2,0.2,3.4,32);
	const materialCorners = new THREE.MeshStandardMaterial( 0xffffff);

	const cylinder1 = new THREE.Mesh(geometryCorners, materialCorners);
	cylinder1.position.x = -5.8;
	cylinder1.position.y = 2.2;
	cylinder1.position.z = -4.3;
	const cylinder2 = new THREE.Mesh(geometryCorners, materialCorners);
	cylinder2.position.x = -5.8;
	cylinder2.position.y = 2.2;
	cylinder2.position.z = 4.3;
	const cylinder3 = new THREE.Mesh(geometryCorners, materialCorners);
	cylinder3.position.x = 5.8;
	cylinder3.position.y = 2.2;
	cylinder3.position.z = 4.3;
	const cylinder4 = new THREE.Mesh(geometryCorners, materialCorners);
	cylinder4.position.x = 5.8;
	cylinder4.position.y = 2.2;
	cylinder4.position.z = -4.3;

	tempGroup.add(cylinder1);
	tempGroup.add(cylinder2);
	tempGroup.add(cylinder3);
	tempGroup.add(cylinder4);

	// create target for the lightsasdsa
	const targetGeometry = new THREE.SphereGeometry(0.1, 1, 0);
	const targetMaterial = new THREE.MeshBasicMaterial(0.1, 1, 0);

	const lightTarget = new THREE.Mesh(targetGeometry, targetMaterial);

	// creating 'projectors' on the top of the cylinders
	const geometryProjector = new THREE.CylinderGeometry(0.2,0.3,0.5,32);

	const projector1 = new THREE.Mesh(geometryProjector, materialCorners);
	projector1.position.x = -5.8;
	projector1.position.y = 4;
	projector1.position.z = -4.3;
	projector1.rotation.x += 0;
	projector1.rotation.y += -(PI / 4) +0.1;
	projector1.rotation.z += 1.2;
	const projector2 = new THREE.Mesh(geometryProjector, materialCorners);
	projector2.position.x = -5.8;
	projector2.position.y = 4;
	projector2.position.z = 4.3;
	projector2.rotation.x += 0;
	projector2.rotation.y += (PI / 4) -0.1;
	projector2.rotation.z += 1.2;
	const projector3 = new THREE.Mesh(geometryProjector, materialCorners);
	projector3.position.x = 5.8;
	projector3.position.y = 4;
	projector3.position.z = 4.3;
	projector3.rotation.x += 0;
	projector3.rotation.y += -(PI / 4) +0.1;
	projector3.rotation.z += -1.2;
	const projector4 = new THREE.Mesh(geometryProjector, materialCorners);
	projector4.position.x = 5.8;
	projector4.position.y = 4;
	projector4.position.z = -4.3;
	projector4.rotation.x += 0;
	projector4.rotation.y += (PI / 4) -0.1;
	projector4.rotation.z += -1.2;

	tempGroup.add(projector1);
	tempGroup.add(projector2);
	tempGroup.add(projector3);
	tempGroup.add(projector4);

	// create light sources
	const light1 = new THREE.SpotLight(0xff00ff, 50, 0);
	light1.position.set(-5.7, 5.7, -4.2);
	light1.angle = 0.4;
	light1.castShadow = true;
	light1.target = lightTarget;
	const light2 = new THREE.SpotLight(0xff00ff, 50, 0);
	light2.position.set(-5.7, 5.7, 4.2);
	light2.angle = 0.4;
	light2.castShadow = true;
	light2.target = lightTarget;
	const light3 = new THREE.SpotLight(0xff00ff, 50, 0);
	light3.position.set(5.7, 5.7, 4.2);
	light3.angle = 0.4;
	light3.castShadow = true;
	light3.target = lightTarget;
	const light4 = new THREE.SpotLight(0xff00ff, 50, 0);
	light4.position.set(5.7, 5.7, -4.2);
	light4.angle = 0.4;
	light4.castShadow = true;
	light4.target = lightTarget;

	tempGroup.add(lightTarget);

	tempGroup.add(light1);
	tempGroup.add(light2);
	tempGroup.add(light3);
	tempGroup.add(light4);

	return (tempGroup);
}
