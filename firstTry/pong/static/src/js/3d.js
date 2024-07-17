// import * as THREE from 'three';

import { create2Pgame } from './2pGame/create2p.js';
import { createMultigame } from './multigame/createMultigame.js';


const LOCALGAME = 0;
const P1_POV = 1;
const P2_POV = 2;

// make player names centered
startGame(7, 1);

function startGame(playerCount, mappov)
{
	if (playerCount == 2 && mappov < 3)
		create2Pgame(mappov);
	else if (playerCount > 2 && playerCount <= 8)
		createMultigame(playerCount, mappov);
}
