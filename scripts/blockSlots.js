const SLOT_THRESHOLD=30;

function connectToSlot(parentId, childId, slotName) {
    const parent = getBlockById(parentId);
    const child = getBlockById(childId);
    if (!parent || !child) return;

    parent.data[slotName] = childId;
    child.parent = parentId;

    saveBlocksToStorage();
}

function connectToBodySlot(parentId, childId, slotName) {
    const parent = getBlockById(parentId);
    const child = getBlockById(childId);
    if (!parent || !child) return;

    addToBody(parentId, childId, slotName);

    saveBlocksToStorage();
}

function findSlotByPosition(containerId, movedBlockId, slotName) {
    const movedElement = document.querySelector(`[data-id="${movedBlockId}"]`);
    const containerElement = document.querySelector(`[data-id="${containerId}"]`);
    if (!movedElement || !containerElement) return;

    const slotElement = containerElement.querySelector(`.slot-${slotName}`);
    if (!slotElement) return false;

    const movedRect = movedElement.getBoundingClientRect();
    const slotRect = slotElement.getBoundingClientRect();

    const movedCenterX= movedRect.left + movedRect.width/2;
    const movedCenterY= movedRect.top + movedRect.height/2;
    const slotCenterX=slotRect.left + slotRect.width/2
    const slotCenterY=slotRect.top+slotRect.height/2

    const distanceX= Math.abs(movedCenterX-slotCenterX);
    const distanceY= Math.abs(movedCenterY-slotCenterY);

    return (distanceX<SLOT_THRESHOLD && distanceY<SLOT_THRESHOLD);
}

