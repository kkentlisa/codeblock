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
