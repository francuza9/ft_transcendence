import * as THREE from 'three';

import { buildMountain } from './mountain.js';
import { buildDesert } from './desert.js';
import { buildHell } from './hell.js';
import { buildSpace } from './space.js';

const NO_MAP = 0;
const MOUNTAIN_MAP = 1;
const DESERT_MAP = 2;
const HELL_MAP = 3;
const SPACE_MAP = 4;

export function buildMap(map, pcount, plane, scene, vectorObjects)
{
	const group = new THREE.Group();

	let x = null;

	if (map === MOUNTAIN_MAP)
		x = buildMountain(pcount, plane, scene);
	else if (map === DESERT_MAP)
		x = buildDesert(plane, scene);
	else if (map === HELL_MAP)
		x = buildHell(pcount, plane, scene, vectorObjects);
	else if (map === SPACE_MAP)
		x = buildSpace(plane, scene, vectorObjects, pcount);

	group.add(x);

	return (group);
}
