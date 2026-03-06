function connectToSlot(parentId, childId, slotName) {
    const parent = GetBlockById(parentId);
    const child = GetBlockById(childId);
    if (!parent || !child) return;

    parent.data[slotName] = childId;
    child.parent = parentId;

    const childElement = document.querySelector(`[data-id="${childId}"]`);
    if (childElement) {
        const rect = childElement.getBoundingClientRect();
        if (!parent.slotSizes) parent.slotSizes = {};
        parent.slotSizes[slotName] = {
            width: rect.width,
            height: rect.height
        };
    }
    SaveBlocksToStorage();
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
    const SLOT_THRESHOLD=30;

    return (distanceX<SLOT_THRESHOLD && distanceY<SLOT_THRESHOLD);
}

