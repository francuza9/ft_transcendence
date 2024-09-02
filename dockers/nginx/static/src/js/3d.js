import { create2Pgame } from './2pGame/create2p.js';
import { createMultigame } from './multigame/createMultigame.js';



// Make player names centered
export function startGame(playerCount, mappov, map, socket, names) {
    if (playerCount === 2 && mappov < 3)
        create2Pgame(mappov, socket, names);
    else if (playerCount > 2 && playerCount <= 8)
        createMultigame(playerCount, mappov, map, socket);
}