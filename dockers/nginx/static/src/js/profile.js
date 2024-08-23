export function viewProfile(player) {
    //const playerData = getPlayerData(player);

    if (playerData) {
        const modalTitle = document.querySelector('#playerProfileModal .modal-title');
        const modalBody = document.querySelector('#playerProfileModal .modal-body');

        modalTitle.textContent = playerProfile.name;
        modalBody.textContent = playerProfile.details;

        const modal = new bootstrap.Modal(document.getElementById('playerProfileModal'));
        modal.show();
    }
	else
		console.log('no data for', player);
}

async function getPlayerData(player) {
	const response = await fetch('/api/account_info/');
	const result = await response.json();

	if (result.success)
		return result.data;
	else
		return;
}




export function showPlayerPreview(row, playerId) {
    const preview = document.createElement('div');
    preview.className = 'player-preview-tooltip';
    preview.textContent = `Preview for ${playerId}`;
    document.body.appendChild(preview);

    const rect = row.getBoundingClientRect();
    preview.style.position = 'absolute';
    preview.style.top = `${rect.top - preview.offsetHeight}px`;
    preview.style.left = `${rect.left}px`;
    preview.style.zIndex = '1000';
    preview.style.backgroundColor = '#fff';
    preview.style.border = '1px solid #ccc';
    preview.style.padding = '5px';
    preview.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';

    row._previewTooltip = preview;
}

export function hidePlayerPreview(row) {
    if (row._previewTooltip) {
        row._previewTooltip.remove();
        row._previewTooltip = null;
    }
}


