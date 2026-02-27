function setupDraggable(element) {
    if (typeof interact === 'undefined') return;

    let isDragging = false;

    interact(element).draggable({
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: true
            })
        ],
        onstart: function(event) {
            const blockId = parseInt(event.target.dataset.id);
            const block = blocksInWorkSpace.find(b => b.id === blockId);

            if (!block) return;

            isDragging = true;

            if (block.parent !== null) {
                disconnectBlock(blockId);
            }
        },

        onmove: function(event) {
            if (!isDragging) return;

            const target = event.target;
            const blockId = parseInt(target.dataset.id);

            moveBlockGroup(blockId, event.dx, event.dy, 'all');
            updateAllBlockPositions();
            SaveBlocksToStorage();
        },

        onend: function(event) {
            if (!isDragging) {
                isDragging = false;
                return;
            }

            isDragging = false;

            const blockId = parseInt(event.target.dataset.id);
            checkForConnection(blockId);
        }
    });
}
function canConnect(parentBlock, childBlock) {
    if (childBlock.type === 'start') return false;
    if (parentBlock.type === 'print') return false;
    if (parentBlock.child !== null) return false;
    if (childBlock.parent !== null) return false;
    return true;
}

function connectBlocks(parentId, childId) {
    const parentIndex = blocksInWorkSpace.findIndex(b => b.id === parentId);
    const childIndex = blocksInWorkSpace.findIndex(b => b.id === childId);

    if (parentIndex === -1 || childIndex === -1) return;

    const parent = blocksInWorkSpace[parentIndex];
    const child = blocksInWorkSpace[childIndex];

    if (!canConnect(parent, child)) return;

    if (child.parent !== null) {
        const oldParentIndex = blocksInWorkSpace.findIndex(b => b.id === child.parent);
        if (oldParentIndex !== -1) {
            blocksInWorkSpace[oldParentIndex].child = null;
        }
    }

    parent.child = childId;
    child.parent = parentId;

    const childGroup = getBlockGroup(childId, 'down');

    const parentElement = document.querySelector(`[data-id="${parent.id}"]`);
    if (!parentElement) return;

    const parentRect = parentElement.getBoundingClientRect();

    const deltaY = (parent.position.y + parentRect.height - 10) - child.position.y;

    childGroup.forEach(block => {
        block.position.y += deltaY;
        block.position.x = parent.position.x; // Выравниваем по X
    })
    SaveBlocksToStorage();
    renderAllBlocks(blocksInWorkSpace);
}

function updateChildPosition(parent, child) {
    const parentElement = document.querySelector(`[data-id="${parent.id}"]`);
    const childElement = document.querySelector(`[data-id="${child.id}"]`);

    if (parentElement && childElement) {
        const parentRect = parentElement.getBoundingClientRect();

        child.position.x = parent.position.x;
        child.position.y = parent.position.y + parentRect.height ;

        childElement.style.left = child.position.x + 'px';
        childElement.style.top = child.position.y + 'px';
    }
}

function disconnectBlock(blockId) {
    const blockIndex = blocksInWorkSpace.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const block = blocksInWorkSpace[blockIndex];

    if (block.parent !== null) {
        const parentIndex = blocksInWorkSpace.findIndex(b => b.id === block.parent);
        if (parentIndex !== -1) {
            blocksInWorkSpace[parentIndex].child = null;
        }
        block.parent = null;
    }

    SaveBlocksToStorage();
    renderAllBlocks(blocksInWorkSpace);
}
ß
function moveBlockGroup(blockId, deltaX, deltaY, direction = 'all') {
    const groupBlocks = getBlockGroup(blockId, direction);

    groupBlocks.forEach(block => {
        block.position.x += deltaX;
        block.position.y += deltaY;
    });
}

function checkForConnection(movedBlockId) {
    const movedBlock = blocksInWorkSpace.find(b => b.id === movedBlockId);
    if (!movedBlock) return;

    const movedElement = document.querySelector(`[data-id="${movedBlockId}"]`);
    if (!movedElement) return;

    const movedRect = movedElement.getBoundingClientRect();

    blocksInWorkSpace.forEach(otherBlock => {
        if (otherBlock.id === movedBlockId) return;

        const otherElement = document.querySelector(`[data-id="${otherBlock.id}"]`);
        if (!otherElement) return;

        const otherRect = otherElement.getBoundingClientRect();

        const verticalProximity = Math.abs(movedRect.top - otherRect.bottom);
        const horizontalProximity = Math.abs(movedRect.left - otherRect.left);

        const CONNECTION_THRESHOLD = 20;
        if (verticalProximity < CONNECTION_THRESHOLD &&
            horizontalProximity < CONNECTION_THRESHOLD) {
            if (canConnect(otherBlock, movedBlock)) {
                connectBlocks(otherBlock.id, movedBlock.id);
            }
        }

        if (Math.abs(movedRect.bottom - otherRect.top) < CONNECTION_THRESHOLD &&
            Math.abs(movedRect.left - otherRect.left) < CONNECTION_THRESHOLD) {
            if (canConnect(movedBlock, otherBlock)) {
                connectBlocks(movedBlock.id, otherBlock.id);
            }
        }
    });
}

function updateAllBlockPositions() {
    blocksInWorkSpace.forEach(block => {
        const element = document.querySelector(`[data-id="${block.id}"]`);
        if (element) {
            element.style.left = block.position.x + 'px';
            element.style.top = block.position.y + 'px';
        }
    });
}

function getBlockGroup(blockId, direction = 'all') {
    const group = [];
    const block = blocksInWorkSpace.find(b => b.id === blockId);
    if (!block) return group;

    if (direction === 'all' || direction === 'up') {
        let current = block;
        while (current.parent !== null) {
            current = blocksInWorkSpace.find(b => b.id === current.parent);
            if (current) group.push(current);
        }
    }

    group.push(block);
    if (direction === 'all' || direction === 'down') {
        let current = block;
        while (current.child !== null) {
            current = blocksInWorkSpace.find(b => b.id === current.child);
            if (current) group.push(current);
        }
    }

    return group;
}