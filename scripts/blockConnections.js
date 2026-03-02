function canConnect(parentBlock, childBlock) {
    if (childBlock.type === 'start') return false;
    if (parentBlock.type === 'print') return false;
    if (parentBlock.child !== null) return false;
    if (childBlock.parent !== null) return false;
    return true;
}

function connectBlocks(parentId, childId) {
    const parentIndex = GetBlockById(parentId);
    const childIndex = GetBlockById(childId);

    if (parentIndex === -1 || childIndex === -1) return;

    const parent = blocksInWorkSpace[parentIndex];
    const child = blocksInWorkSpace[childIndex];

    if (!canConnect(parent, child)) return;

    if (child.parent !== null) {
        const oldParentIndex = GetBlockById(child.parent);
        if (oldParentIndex !== -1) {
            blocksInWorkSpace[oldParentIndex].child = null;
        }
    }
    if (parent.child !== null) {
        const oldChildIndex=GetBlockById(parent.child);
        if (oldChildIndex !== -1) {
            blocksInWorkSpace[oldChildIndex].parent = null;
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
    const blockIndex = GetBlockById(blockId);
    if (blockIndex === -1) return;

    const block = blocksInWorkSpace[blockIndex];

    if (block.parent !== null) {
        const parentIndex = GetBlockById(block.parent);
        if (parentIndex !== -1) {
            blocksInWorkSpace[parentIndex].child = null;
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

    blocksInWorkSpace.forEach(otherBlock => {
        if (otherBlock.id === movedBlockId) return;

        const slotName = findSlotByPosition(otherBlock.id, mouseX, mouseY);
        if (slotName && isSlotFree(otherBlock.id, slotName) && VALUE_BLOCKS.includes(movedBlock.type)) {
            connectToSlot(otherBlock.id, movedBlock.id, slotName);
            return;
        }

        const otherElement = document.querySelector(`[data-id="${otherBlock.id}"]`);
        if (!otherElement) return;

        const otherRect = otherElement.getBoundingClientRect();

        const verticalProximity = Math.abs(movedRect.top - otherRect.bottom);
        const horizontalProximity = Math.abs(movedRect.left - otherRect.left);

        const CONNECTION_THRESHOLD = 20;
        if (verticalProximity < CONNECTION_THRESHOLD && horizontalProximity < CONNECTION_THRESHOLD) {
            if (canConnect(otherBlock, movedBlock)) {
                connectBlocks(otherBlock.id, movedBlock.id);
            }
        }

        if (Math.abs(movedRect.bottom - otherRect.top) < CONNECTION_THRESHOLD && Math.abs(movedRect.left - otherRect.left) < CONNECTION_THRESHOLD) {
            if (canConnect(movedBlock, otherBlock)) {
                connectBlocks(movedBlock.id, otherBlock.id);
            }
        }
    });
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

function findSlotByPosition(containerId, mouseX, mouseY) {
    const container=GetBlockById(containerId);
    if(!container) return null;

    const containerElement=document.querySelector(`[data-id="${containerId}"]`);
    if (!containerElement) return null;

    const rect=containerElement.getBoundingClientRect();
    const slots = BLOCK_SLOTS[container.type] || []

    if (slots.includes('left')){
        const leftZone ={
            x1: rect.left - 40,
            x2: rect.left,
            y1: rect.top - 20,
            y2: rect.bottom + 20,
        };
        if(mouseX>=leftZone.x1 && mouseX<=leftZone.x2 && mouseY>=leftZone.y1 && mouseY<=leftZone.y2){
            return 'left';
        }
    }
    if (slots.includes('right')){
        const rightZone ={
            x1: rect.right,
            x2: rect.right + 40,
            y1: rect.top - 20,
            y2: rect.bottom + 20,
        };
        if(mouseX>=rightZone.x1 && mouseX<=rightZone.x2 && mouseY>=rightZone.y1 && mouseY<=rightZone.y2){
            return 'right';
        }
    }

    const topSlots = slots.filter(s=> ['condition', 'value', 'operand'].includes(s));
    if(topSlots.length > 0) {
        const topZone = {
            x1: rect.left - 20,
            x2: rect.right + 20,
            y1: rect.top - 40,
            y2: rect.top
        };
        if (mouseX >= topZone.x1 && mouseX <= topZone.x2 && mouseY >= topZone.y1 && mouseY <= topZone.y2) {
            return topSlots[0];
        }
    }
}