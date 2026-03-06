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

            if (block.parent !== null || block.previous !== null) {

                const rect = e.target.getBoundingClientRect();
                const workspace = document.querySelector('.workSpace');
                const wsRect = workspace.getBoundingClientRect();

                if(block.parent !== null){
                    DisconnectFromSlot(blockId);
                }
                else{
                    disconnectBlock(blockId);
                }

                workspace.appendChild(e.target);

                block.position.x = rect.left - wsRect.left;
                block.position.y = rect.top - wsRect.top;

                e.target.style.position = 'absolute';
                e.target.style.margin = '0';
                e.target.style.left = block.position.x + 'px';
                e.target.style.top = block.position.y + 'px';
            }
        },

        onmove: function(e) {
            if (!isDragging) return;
            const target = e.target;
            const blockId = parseInt(target.dataset.id);
            const block = GetBlockById(blockId);

            block.position.x += e.dx;
            block.position.y += e.dy;
            target.style.left = block.position.x + 'px';
            target.style.top = block.position.y + 'px';
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

