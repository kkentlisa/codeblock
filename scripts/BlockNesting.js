function connectToSlot(parentId, childId, slotName) {
    if (!IsSlotFree(parentId, slotName)) {
        const parent = GetBlockById(parentId);
        const oldBlock = parent.data[slotName];
        if (oldBlock) DisconnectFromSlot(oldBlock.id);
    }

    const parent = GetBlockById(parentId);
    const child = GetBlockById(childId);
    if (!parent || !child) return;

    parent.data[slotName] = child;
    child.parent = parentId;

    SaveBlocksToStorage();
    renderAllBlocks(blocksInWorkSpace);
}

function rectsIntersect(rect1, rect2){
    return !(rect2.left > rect1.right ||
        rect2.right < rect1.left ||
        rect2.top > rect1.bottom ||
        rect2.bottom < rect1.top);
}

function findSlotByPosition(containerId, movedBlockId) {
    const container=GetBlockById(containerId);
    if(!container) return null;

    const containerElement=document.querySelector(`[data-id="${containerId}"]`);
    if (!containerElement) return null;

    const movedElement = document.querySelector(`[data-id="${movedBlockId}"]`);
    if (!movedElement) return null;

    const containerRect=containerElement.getBoundingClientRect();
    const movedRect=movedElement.getBoundingClientRect();
    const slots = BLOCK_SLOTS[container.type] || []

    if (slots.includes('left')){
        const leftZone ={
            x1: containerRect.left - 40,
            x2: containerRect.left,
            y1: containerRect.top - 20,
            y2: containerRect.bottom + 20,
        };
        if (rectsIntersect(movedRect, leftZone)) {
            return 'left';
        }
    }
    if (slots.includes('right')){
        const rightZone ={
            x1: containerRect.right,
            x2: containerRect.right + 40,
            y1: containerRect.top - 20,
            y2: containerRect.bottom + 20,
        };
        if (rectsIntersect(movedRect, rightZone)) {
            return 'right';
        }
    }

    const topSlots = slots.filter(s=> ['condition', 'value', 'operand'].includes(s));
    if(topSlots.length > 0) {
        const topZone = {
            x1: containerRect.left - 20,
            x2: containerRect.right + 20,
            y1: containerRect.top - 40,
            y2: containerRect.top
        };
        if (rectsIntersect(movedRect, topZone)) {
            return topSlots[0];
        }
    }
    return null;
}

