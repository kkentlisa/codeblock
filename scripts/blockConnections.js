function canConnect(parentBlock, childBlock) {
    if (childBlock.type === 'start') return false;
    if (parentBlock.type === 'print') return false;
    if (parentBlock.child !== null) return false;
    if (childBlock.parent !== null) return false;
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
            parent.child = null;
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

    if (VALUE_BLOCKS.includes(movedBlock.type)) {
        let connected = false;
        for (const otherBlock of blocksInWorkSpace) {
            if (otherBlock.id === movedBlockId) continue;

            const slots = BLOCK_SLOTS[otherBlock.type] || [];

            for (const slotName of slots) {
                const isOverThisSlot = findSlotByPosition(otherBlock.id, movedBlock.id, slotName);

                if (isOverThisSlot && IsSlotFree(otherBlock.id, slotName)) {
                    connectToSlot(otherBlock.id, movedBlock.id, slotName);
                    connected = true;
                    break;
                }
            }

            if (connected) break;
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

    if (direction === 'all'||  direction === 'up') {
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
    return !(rect2.left > rect1.right||
    rect2.right < rect1.left||
    rect2.top > rect1.bottom||
    rect2.bottom < rect1.top);
}

function findSlotByPosition(containerId, movedRect) {
    const container = GetBlockById(containerId);
    if (!container) return null;

    const containerElement = document.querySelector(`[data-id="${containerId}"]`);
    if (!containerElement) return null;

    const containerRect = containerElement.getBoundingClientRect();
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

    const topSlots = slots.filter(s => ['condition', 'value', 'operand'].includes(s));
    if (topSlots.length > 0) {
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