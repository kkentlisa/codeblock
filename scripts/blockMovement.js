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
                disconnectBlock(blockId);
            }
        },

        onmove: function(e) {
            if (!isDragging) return;

            const target = e.target;
            const blockId = parseInt(target.dataset.id);

            moveBlockGroup(blockId, e.dx, e.dy, 'all');
            updateAllBlockPositions();
            updateSlotExpansion(blockId);
            SaveBlocksToStorage();
        },

        onend: function(e) {
            if (!isDragging) {
                isDragging = false;
                return;
            }

            isDragging = false;

            const blockId = parseInt(e.target.dataset.id);
            checkForConnection(blockId, e);

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

