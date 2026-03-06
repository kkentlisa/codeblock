function setupDraggable(element) {
    let isDragging = false;

    interact(element).draggable({
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: false
            })
        ],
        onstart: function(e) {
            const blockId = parseInt(e.target.dataset.id);
            const block = GetBlockById(blockId);
            if (!block) return;

            isDragging = true;

            if (block.parent !== null) {
                if(IsBlockInSlot(blockId)){
                    DisconnectFromSlot(blockId);
                }
                else{
                    disconnectBlock(blockId);
                }

                const workspace =document.querySelector('.workSpace');
                workspace.appendChild(e.target);

                const rect = e.target.getBoundingClientRect();
                const wsRect= workspace.getBoundingClientRect();

                block.position.x = rect.left - wsRect.left;
                block.position.y = rect.top - wsRect.top;
                e.target.style.left = block.position.x + 'px';
                e.target.style.top = block.position.y + 'px';
            }
        },

        onmove: function(e) {
            if (!isDragging) return;
            const target = e.target;
            const blockId = parseInt(target.dataset.id);

            moveBlockGroup(blockId, e.dx, e.dy, 'down');
            updateAllBlockPositions();
        },

        onend: function(e) {
            isDragging = false;

            const blockId = parseInt(e.target.dataset.id);
            checkForConnection(blockId, e);
            SaveBlocksToStorage();
            renderAllBlocks(blocksInWorkSpace);
        }
    });
}
function moveBlockGroup(blockId, dx, dy, direction = 'down') {
    const groupBlocks = getBlockGroup(blockId, direction);

    groupBlocks.forEach(block => {
        block.position.x += dx;
        block.position.y += dy;
    });
}
function updateAllBlockPositions() {
    blocksInWorkSpace.forEach(block => {
        const element = document.querySelector(`[data-id="${block.id}"]`);
        if (element) {
            element.style.left = block.position.x + 'px';
            element.style.top = block.position.y + 'px';
        }
    });
}

