let blocksInWorkSpace = [];
let blockId = 0;

const VALUE_BLOCKS = ['input', 'add', 'subtract', 'multiply', 'div', 'mod',
    'gt', 'lt', 'eq', 'neq', 'gte', 'lte', 'and', 'or', 'not', 'arrayGet', 'arrayLength'];
const BOOLEAN_BLOCKS = ['gt', 'lt', 'eq', 'neq', 'gte', 'lte', 'and', 'or', 'not'];

const BLOCK_SLOTS = {
    'assignValue': ['value'],
    'add': ['left', 'right'],
    'subtract': ['left', 'right'],
    'multiply': ['left', 'right'],
    'div': ['left', 'right'],
    'mod': ['left', 'right'],
    'if': ['condition', 'then'],
    'if-else': ['condition', 'then', 'else'],
    'while': ['condition', 'body'],
    'gt': ['left', 'right'],
    'lt': ['left', 'right'],
    'eq': ['left', 'right'],
    'neq': ['left', 'right'],
    'gte': ['left', 'right'],
    'lte': ['left', 'right'],
    'and': ['left', 'right'],
    'or': ['left', 'right'],
    'not': ['operand'],
    'arrayAssignByIndex': ['index', 'value'],
    'arrayGet': ['index'],
    'print': ['value']
}

function createBlock(type, x, y){
    let data = {};

    if (type === "start"){
        const existingStart = blocksInWorkSpace.find(b => b.type === "start");
        if (existingStart){
            logToOutputPanel("Стартовый блок уже существует!");
            return null;
        }
    }

    else if (type === "input"){
        data.value = "";
    }

    else if (type === "print"){
        data.value = null;
    }

    else if (type === "variableInit"){
        data.name = "";
        data.value = 0;
    }

    else if (type === "assignValue"){
        data.variable = "";
        data.value = null;
    }

    else if (type === "add"){
        data.left = null;
        data.right = null;
    }

    else if (type === "subtract"){
        data.left = null;
        data.right = null;
    }

    else if (type === "multiply"){
        data.left = null;
        data.right = null;
    }

    else if (type === "div"){
        data.left = null;
        data.right = null;
    }

    else if (type === "mod"){
        data.left = null;
        data.right = null;
    }

    else if (type === "if"){
        data.condition = null;
        data.thenBlocks = [];
    }

    else if (type === "if-else"){
        data.condition = null;
        data.thenBlocks = [];
        data.elseBlocks = [];
    }

    else if (type === "gt"){
        data.left = null;
        data.right = null;
    }

    else if (type === "lt"){
        data.left = null;
        data.right = null;
    }

    else if (type === "eq"){
        data.left = null;
        data.right = null;
    }

    else if (type === "neq"){
        data.left = null;
        data.right = null;
    }

    else if (type === "gte"){
        data.left = null;
        data.right = null;
    }

    else if (type === "lte"){
        data.left = null;
        data.right = null;
    }

    else if (type === "and"){
        data.left = null;
        data.right = null;
    }

    else if (type === "or"){
        data.left = null;
        data.right = null;
    }

    else if (type === "not"){
        data.operand = null;
    }

    else if (type === "while"){
        data.condition = null;
        data.bodyBlocks = [];
    }

    else if (type === "arrayDeclare"){
        data.name = "";
        data.size = 3;
    }

    else if (type === "arrayAssignByIndex"){
        data.name = "";
        data.index = null;
        data.value = null;
    }

    else if (type === "arrayGet"){
        data.name = "";
        data.index = null;
    }

    else if (type === "arrayLength"){
        data.name = "";
    }

    const newBlock = {
        id: blockId++,
        type: type,
        position: {x: x, y: y},
        parent: null,
        previous: null,
        next: null,
        data: data
    }

    blocksInWorkSpace.push(newBlock);
    saveBlocksToStorage();
    return newBlock;
}

function getBlockById(id){
    return blocksInWorkSpace.find(block => block.id === id);
}

function deleteBlock(id){
    const blockToDelete=getBlockById(id);
    if (!blockToDelete) return;

    if (blockToDelete.previous !== null){
        const prevBlock=getBlockById(blockToDelete.previous);
        if (prevBlock) prevBlock.next = null;
    }
    if (blockToDelete.next !== null){
        const nextBlock=getBlockById(blockToDelete.next);
        if (nextBlock) nextBlock.previous = null;
    }

    for (let slot in blockToDelete.data) {
        const childId = blockToDelete.data[slot];
        if (childId) {
            const child = getBlockById(childId);
            if (child) child.parent = null;
        }
    }

    if (blockToDelete.data.thenBlocks){
        blockToDelete.data.thenBlocks.forEach(childId => {
            const child = getBlockById(childId);
            if (child) child.parent = null;
        })
    }
    if (blockToDelete.data.elseBlocks){
        blockToDelete.data.elseBlocks.forEach(childId => {
            const child = getBlockById(childId);
            if (child) child.parent = null;
        })
    }
    if (blockToDelete.data.bodyBlocks){
        blockToDelete.data.bodyBlocks.forEach(childId => {
            const child = getBlockById(childId);
            if (child) child.parent = null;
        })
    }

    const index = blocksInWorkSpace.findIndex(block => block.id === id);
    if (index !== -1){
        blocksInWorkSpace.splice(index, 1);
        saveBlocksToStorage();
    }
}

function saveBlocksToStorage(){
    sessionStorage.setItem("blocksInWorkSpace", JSON.stringify(blocksInWorkSpace));
}

function loadBlocksFromStorage(){
    const blocks = sessionStorage.getItem("blocksInWorkSpace");
    if (blocks){
        blocksInWorkSpace = JSON.parse(blocks);
        if (blocksInWorkSpace.length > 0){
            const maxId = Math.max(...blocksInWorkSpace.map(block => block.id));
            blockId = maxId + 1;
        }
    }
}

function resetAllBlocks(){
    blocksInWorkSpace = [];
    blockId = 0;

    sessionStorage.removeItem("blocksInWorkSpace");
    clearOutputPanel()
}

function addToBody(parentId, childId, slotType){
    const parentBlock = getBlockById(parentId);
    let childBlock = getBlockById(childId);
    if (!parentBlock || !childBlock){
        return;
    }

    while(childBlock) {
        if (parentBlock.type === "if" && slotType === "then") {
            if(!parentBlock.data.thenBlocks.includes(childBlock.id)) parentBlock.data.thenBlocks.push(childBlock.id);
        } else if (parentBlock.type === "if-else" && slotType === "then") {
            if(!parentBlock.data.thenBlocks.includes(childBlock.id)) parentBlock.data.thenBlocks.push(childBlock.id);
        } else if (parentBlock.type === "if-else" && slotType === "else") {
            if(!parentBlock.data.elseBlocks.includes(childBlock.id)) parentBlock.data.elseBlocks.push(childBlock.id);
        } else if (parentBlock.type === "while") {
            if(!parentBlock.data.bodyBlocks.includes(childBlock.id)) parentBlock.data.bodyBlocks.push(childBlock.id);
        }
        childBlock.parent = parentId;
        childBlock = getBlockById(childBlock.next);
    }
    saveBlocksToStorage();
}

function removeFromBody(parentId, childId){
    const parentBlock = getBlockById(parentId);
    let childBlock = getBlockById(childId);
    if (!parentBlock || !childBlock){
        return;
    }
    while(childBlock) {
        if (parentBlock.type === "if") {
            const index = parentBlock.data.thenBlocks.indexOf(childBlock.id);
            if (index !== -1) {
                parentBlock.data.thenBlocks.splice(index, 1);
            }
        } else if (parentBlock.type === "if-else") {
            const thenIndex = parentBlock.data.thenBlocks.indexOf(childBlock.id);
            if (thenIndex !== -1) {
                parentBlock.data.thenBlocks.splice(thenIndex, 1);
            }
            const elseIndex = parentBlock.data.elseBlocks.indexOf(childBlock.id);
            if (elseIndex !== -1) {
                parentBlock.data.elseBlocks.splice(elseIndex, 1);
            }
        } else if (parentBlock.type === "while") {
            const index = parentBlock.data.bodyBlocks.indexOf(childBlock.id);
            if (index !== -1) {
                parentBlock.data.bodyBlocks.splice(index, 1);
            }
        }
        childBlock.parent = null;
        childBlock = getBlockById(childBlock.next);
    }
    saveBlocksToStorage();
}

function disconnectFromSlot(blockId){
    const block = getBlockById(blockId);
    if (!block || block.parent===null){
        return;
    }
    const parentBlock = getBlockById(block.parent);
    if (!parentBlock){
        return
    }

    for (let slotName in parentBlock.data){
        if (parentBlock.data[slotName] === block.id){
            parentBlock.data[slotName] = null;
            block.parent = null;

            saveBlocksToStorage();
            return;
        }
    }
}

function isSlotFree(parentId, slotName){
    const parentBlock = getBlockById(parentId);
    if (!parentBlock){
        return false;
    }
    return parentBlock.data[slotName] === null;
}