function canConnect(previousBlock, nextBlock) {
    if (nextBlock.type === 'start') return false;
    if (previousBlock.type === 'print') return false;
    if (previousBlock.next !== null) return false;
    if (nextBlock.previous !== null) return false;

    return true;
}

function connectBlocks(previousId, nextId) {
    const previous = GetBlockById(previousId);
    const next = GetBlockById(nextId);

    if (!previous || !next) return;
    if (!canConnect(previous, next)) return;

    previous.next = nextId;
    next.previous = previousId;
    SaveBlocksToStorage();
}

function disconnectBlock(blockId) {
    const block = GetBlockById(blockId);
    if (!block) return;

    if (block.previous !== null) {
        const previousBlock = GetBlockById(block.previous);
        if (previousBlock) {
            previousBlock.next = null;
        }
        block.previous = null;
        SaveBlocksToStorage();
    }
}

function checkForConnection(movedBlockId, e) {
    const movedBlock = GetBlockById(movedBlockId);
    if (!movedBlock) return;

    const movedElement = document.querySelector(`[data-id="${movedBlockId}"]`);
    if (!movedElement) return;

    const movedRect = movedElement.getBoundingClientRect();

    for (const otherBlock of blocksInWorkSpace) {
        if (otherBlock.id === movedBlockId) continue;

        const slots = BLOCK_SLOTS[otherBlock.type] || [];

        for (const slotName of slots) {
            const isOverThisSlot = findSlotByPosition(otherBlock.id, movedBlock.id, slotName);

            if (isOverThisSlot) {
                if (['then', 'else', 'body'].includes(slotName)) {
                    if (movedBlock.type !== "start" && !VALUE_BLOCKS.includes(movedBlock.type)) {
                        connectToBodySlot(otherBlock.id, movedBlock.id, slotName);
                        return;
                    }
                }
                else if (slotName === 'condition') {
                    const BOOLEAN_BLOCKS = ['gt', 'lt', 'eq', 'neq', 'gte', 'lte', 'and', 'or', 'not'];
                    if (IsSlotFree(otherBlock.id, slotName) && BOOLEAN_BLOCKS.includes(movedBlock.type)) {
                        connectToSlot(otherBlock.id, movedBlock.id, slotName);
                        return;
                    }
                    else{
                        continue;
                    }
                }
                else {
                    if (IsSlotFree(otherBlock.id, slotName) && VALUE_BLOCKS.includes(movedBlock.type)) {
                        connectToSlot(otherBlock.id, movedBlock.id, slotName);
                        return;
                    }
                }
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

