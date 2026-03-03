function canConnect(parentBlock, childBlock) {
    if (childBlock.type === 'start') return false;
    if (parentBlock.type === 'print') return false;
    if (parentBlock.child !== null) return false;
    if (childBlock.parent !== null) return false;
    if(VALUE_BLOCKS.includes(childBlock.type)) return false;
    return true;
}

function connectBlocks(parentId, childId) {
    const parent = GetBlockById(parentId);
    const child = GetBlockById(childId);

    if (!parent || !child) return;

    if (!canConnect(parent, child)) return;

    if (child.parent !== null) {
        const oldParent = GetBlockById(child.parent);
        if (oldParent) {
            oldParent.child = null;
        }
    }
    if (parent.child !== null) {
        const oldChild=GetBlockById(parent.child);
        if (oldChild ) {
            oldChild.parent = null;
        }
    }

    parent.child = childId;
    child.parent = parentId;

    const childGroup = getBlockGroup(childId, 'down');

    const parentElement = document.querySelector(`[data-id="${parent.id}"]`);
    if (!parentElement) return;

    const parentRect = parentElement.getBoundingClientRect();

    const dy = (parent.position.y + parentRect.height - 12) - child.position.y;

    childGroup.forEach(block => {
        block.position.y += dy;
        block.position.x = parent.position.x;
    })
    SaveBlocksToStorage();
    renderAllBlocks(blocksInWorkSpace);
}

function disconnectBlock(blockId) {
    const block = GetBlockById(blockId);
    if (!block) return;

    if (block.parent !== null) {
        const parent = GetBlockById(block.parent);
        if (parent) {
            if(VALUE_CONTAINERS.includes(parent.type)){
                DisconnectFromSlot(blockId)
            }
            else {
                parent.child = null;
            }
        }
        block.parent = null;
    }

    SaveBlocksToStorage();
    renderAllBlocks(blocksInWorkSpace);
}

function checkForConnection(movedBlockId, e) {
    const movedBlock = GetBlockById(movedBlockId);
    if (!movedBlock) return;

    const movedElement = document.querySelector(`[data-id="${movedBlockId}"]`);
    if (!movedElement) return;

    const movedRect = movedElement.getBoundingClientRect();

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (VALUE_BLOCKS.includes(movedBlock.type)) {
        for (const otherBlock of blocksInWorkSpace) {
            if (otherBlock.id === movedBlockId) continue;

            const slotName = findSlotByPosition(otherBlock.id, mouseX, mouseY);
            if (slotName && IsSlotFree(otherBlock.id, slotName)) {
                connectToSlot(otherBlock.id, movedBlock.id, slotName);
                return;
            }
        }
    }
    if (!VALUE_BLOCKS.includes(movedBlock.type)) {
        for (const otherBlock of blocksInWorkSpace) {
            if (otherBlock.id === movedBlockId) continue;

            const otherElement = document.querySelector(`[data-id="${otherBlock.id}"]`);
            if (!otherElement) continue;

            const otherRect = otherElement.getBoundingClientRect();
            const verticalProximity = Math.abs(movedRect.top - otherRect.bottom);
            const horizontalProximity = Math.abs(movedRect.left - otherRect.left);

            const CONNECTION_THRESHOLD = 30;

            if (verticalProximity < CONNECTION_THRESHOLD &&
                horizontalProximity < CONNECTION_THRESHOLD &&
                canConnect(otherBlock, movedBlock)) {
                connectBlocks(otherBlock.id, movedBlock.id);
                return;
            }
            if (Math.abs(movedRect.bottom - otherRect.top) < CONNECTION_THRESHOLD &&
                Math.abs(movedRect.left - otherRect.left) < CONNECTION_THRESHOLD &&
                canConnect(movedBlock, otherBlock)) {
                connectBlocks(movedBlock.id, otherBlock.id);
                return;
            }
        }
    }
}

function getBlockGroup(blockId, direction = 'all') {
    const group = [];
    const block = GetBlockById(blockId);
    if (!block) return group;

    if (direction === 'all' || direction === 'up') {
        let current = block;
        while (current.parent !== null) {
            current =GetBlockById(current.parent);
            if (current) group.push(current);
        }
    }

    group.push(block);

    if (direction === 'all' || direction === 'down') {
        let current = block;
        while (current.child !== null) {
            current = GetBlockById(current.child);
            if (current) group.push(current);
        }
    }

    return group;
}

