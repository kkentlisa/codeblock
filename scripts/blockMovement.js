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
            const target = e.target;
            const blockId = parseInt(e.target.dataset.id);
            const block = GetBlockById(blockId);
            if (!block) return;

            isDragging = true;

            const rect=target.getBoundingClientRect();
            const wsRect=workspace.getBoundingClientRect();

            const currentX=rect.left - wsRect.left;
            const currentY=rect.top- wsRect.top;

            if (block.parent !== null || block.previous !== null) {
                if(block.parent !== null){
                    const parent = GetBlockById(block.parent);
                    if (parent) {
                        if (parent.data.thenBlocks?.includes(blockId) ||
                            parent.data.elseBlocks?.includes(blockId) ||
                        parent.data.bodyBlocks?.includes(blockId) ){
                            RemoveFromBody(block.parent, blockId);
                        }
                    else{
                            DisconnectFromSlot(blockId);
                        }
                    }
                }
                else{
                    disconnectBlock(blockId);
                }

                if(target.parentNode !== workspace) workspace.appendChild(target);

                block.position.x = currentX;
                block.position.y = currentY;

                target.style.position = 'absolute';
                target.style.left = block.position.x + 'px';
                target.style.top = block.position.y + 'px';
                target.style.zIndex = '1000';
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

