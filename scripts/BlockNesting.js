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

