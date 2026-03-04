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

    positionBlockInSlot(parentId, childId, slotName);
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

    const containerRect=containerElement.getBoundingClientRect();
    const slots = BLOCK_SLOTS[container.type] || [];

    const blockCenterX = movedRect.left + movedRect.width / 2;
    const containerCenterX = containerRect.left + containerRect.width / 2;

    if (blockCenterX > containerCenterX) {
        if (slots.includes('right')) {
            const rightZone = {
                x1: containerRect.right,
                x2: containerRect.right + 100,
                y1: containerRect.top - 50,
                y2: containerRect.bottom + 50
            };
            if (rectsIntersect(movedRect, rightZone)) return 'right';
        }
        if (slots.includes('left')) {
            const leftZone = {
                x1: containerRect.left - 100,
                x2: containerRect.left,
                y1: containerRect.top - 50,
                y2: containerRect.bottom + 50
            };
            if (rectsIntersect(movedRect, leftZone)) return 'left';
        }
    }
    else {
        if (slots.includes('left')) {
            const leftZone = {
                x1: containerRect.left - 100,
                x2: containerRect.left,
                y1: containerRect.top - 50,
                y2: containerRect.bottom + 50
            };
            if (rectsIntersect(movedRect, leftZone)) return 'left';
        }
        if (slots.includes('right')) {
            const rightZone = {
                x1: containerRect.right,
                x2: containerRect.right + 100,
                y1: containerRect.top - 50,
                y2: containerRect.bottom + 50
            };
            if (rectsIntersect(movedRect, rightZone)) return 'right';
        }
    }

    const topSlots = slots.filter(s=> ['condition', 'value', 'operand'].includes(s));
    if(topSlots.length > 0) {
        const topZone = {
            x1: containerRect.left - 50,
            x2: containerRect.right + 50,
            y1: containerRect.top - 100,
            y2: containerRect.top
        };
        if (rectsIntersect(movedRect, topZone)) {
            return topSlots[0];
        }
    }
    return null;
}
function positionBlockInSlot(parentId, childId, slotName) {
    const parent = GetBlockById(parentId);
    const child = GetBlockById(childId);
    if (!parent || !child) return;

    const parentElement = document.querySelector(`[data-id="${parentId}"]`);
    const childElement = document.querySelector(`[data-id="${childId}"]`);
    if (!parentElement || !childElement) return;

    const parentRect = parentElement.getBoundingClientRect();
    const childRect = childElement.getBoundingClientRect();

    if (slotName === 'left') {
        child.position.x = parent.position.x - childRect.width - 10;
        child.position.y = parent.position.y + (parentRect.height - childRect.height) / 2;
    } else if (slotName === 'right') {
        child.position.x = parent.position.x + parentRect.width + 10;
        child.position.y = parent.position.y + (parentRect.height - childRect.height) / 2;
    } else {
        child.position.x = parent.position.x + (parentRect.width - childRect.width) / 2;
        child.position.y = parent.position.y - childRect.height - 10;
    }
}


