// import * as THREE from 'three';

import { create2Pgame } from './2pGame/create2p.js';
import { createMultigame } from './multigame/createMultigame.js';


const LOCALGAME = 0;
const P1_POV = 1;
const P2_POV = 2;

const NO_MAP = 0;
const MOUNTAIN_MAP = 1;
const DESERT_MAP = 2;
const HELL_MAP = 3;
const SPACE_MAP = 4;

// make player names centered
startGame(8, 1, NO_MAP);

function startGame(playerCount, mappov, map)
{
	if (playerCount == 2 && mappov < 3)
		create2Pgame(mappov);
	else if (playerCount > 2 && playerCount <= 8)
		createMultigame(playerCount, mappov, map);
}
