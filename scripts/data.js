let blocksInWorkSpace = [];
let blockId = 0;

const VALUE_CONTAINERS = ['assignValue','add', 'subtract', 'multiply', 'div',
'mod', 'if', 'ifElse', 'while', 'gt', 'lt', 'eq', 'neq', 'gte', 'lte', 'and', 'or', 'not'];
const BODY_CONTAINERS = ['if', 'ifElse', 'while'];
const VALUE_BLOCKS = ['input', 'add', 'subtract', 'multiply', 'div', 'mod',
'gt', 'lt', 'eq', 'neq', 'gte', 'lte', 'and', 'or', 'not'];

const BLOCK_SLOTS = {
    'assignValue': ['value'],
    'add': ['left', 'right'],
    'subtract': ['left', 'right'],
    'multiply': ['left', 'right'],
    'div': ['left', 'right'],
    'mod': ['left', 'right'],
    'if': ['condition'],
    'ifElse': ['condition'],
    'while': ['condition'],
    'gt': ['left', 'right'],
    'lt': ['left', 'right'],
    'eq': ['left', 'right'],
    'neq': ['left', 'right'],
    'gte': ['left', 'right'],
    'lte': ['left', 'right'],
    'and': ['left', 'right'],
    'or': ['left', 'right'],
    'not': ['operand']
}

function CreateBlock(type, x, y){
    let data = {};

    if (type === "start"){
        const existingStart = blocksInWorkSpace.find(b => b.type === "start");
        if (existingStart){
            LogToOutputPanel("Стартовый блок уже существует!");
            return null;
        }
    }

    else if (type === "input"){
        data.value = "";
    }

    else if (type === "print"){
        data.variable = "";
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

    else if (type === "ifElse"){
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
        data.elements = [];
    }

    else if (type === "arrayAssignByIndex"){
        data.name = "";
        data.index = "";
        data.value = "";
    }

    else if (type === "arrayGet"){
        data.name = "";
        data.index = "";
    }

    else if (type === "arrayLength"){
        data.name = "";
    }

    const newBlock = {
        id: blockId++,
        type: type,
        position: {x: x, y: y},
        parent: null,
        child: null,
        data: data
    }

    blocksInWorkSpace.push(newBlock);
    SaveBlocksToStorage();
    return newBlock;
}

function GetBlockById(id){
    return blocksInWorkSpace.find(block => block.id === id);
}

function DeleteBlock(id){
    const previousBlock = blocksInWorkSpace.find(block => block.child === id);
    if (previousBlock) {
        previousBlock.child = null;
    }
    const nextBlock = blocksInWorkSpace.find(block => block.parent === id);
    if (nextBlock) {
        nextBlock.parent = null;
    }

    const index = blocksInWorkSpace.findIndex(block => block.id === id);
    if (index !== -1){
        blocksInWorkSpace.splice(index, 1);
        SaveBlocksToStorage();
    }
}

function SaveBlocksToStorage(){
    sessionStorage.setItem("blocksInWorkSpace", JSON.stringify(blocksInWorkSpace));
}

function LoadBlocksFromStorage(){
    const blocks = sessionStorage.getItem("blocksInWorkSpace");
    if (blocks){
        blocksInWorkSpace = JSON.parse(blocks);
        if (blocksInWorkSpace.length > 0){
            const maxId = Math.max(...blocksInWorkSpace.map(block => block.id));
            blockId = maxId + 1;
        }
    }
}

function ResetAllBlocks(){
    blocksInWorkSpace = [];
    blockId = 0;

    sessionStorage.removeItem("blocksInWorkSpace");
    ClearOutputPanel()
}

function AddToBody(parentId, childId){
    const parentBlock = GetBlockById(parentId);
    const childBlock = GetBlockById(childId);
    if (!parentBlock || !childBlock){
        return;
    }
    if (parentBlock.type === "if"){
        parentBlock.data.thenBlocks.push(childId);
    }
    else if (parentBlock.type === "ifElse"){
        parentBlock.data.thenBlocks.push(childId);
    }
    else if (parentBlock.type === "while"){
        parentBlock.data.bodyBlocks.push(childId);
    }
    childBlock.parent = parentId;
    SaveBlocksToStorage();
}

function RemoveFromBody(parentId, childId){
    const parentBlock = GetBlockById(parentId);
    const childBlock = GetBlockById(childId);
    if (!parentBlock || !childBlock){
        return;
    }
    if (parentBlock.type === "if"){
        const index = parentBlock.data.thenBlocks.indexOf(childId);
        if (index !== -1){
            parentBlock.data.thenBlocks.splice(index, 1);
        }
    }
    else if (parentBlock.type === "ifElse"){
        const thenIndex = parentBlock.data.thenBlocks.indexOf(childId);
        if (thenIndex !== -1){
            parentBlock.data.thenBlocks.splice(thenIndex, 1);
        }
        const elseIndex = parentBlock.data.elseBlocks.indexOf(childId);
        if (elseIndex !== -1){
            parentBlock.data.elseBlocks.splice(elseIndex, 1);
        }
    }
    else if (parentBlock.type === "while"){
        const index = parentBlock.data.bodyBlocks.indexOf(childId);
        if (index !== -1) {
            parentBlock.data.bodyBlocks.splice(index, 1);
        }
    }
    childBlock.parent = null;
    SaveBlocksToStorage();
}

function IsSlotFree(parentId, slotName){
    const parentBlock = GetBlockById(parentId);
    if (!parentBlock){
        return false;
    }
    return parentBlock.data[slotName] === null;
}

function GetNestingLevel(blockId){
        const block = GetBlockById(blockId);
        if (!block){
            return;
        }
        let level = 0;
        let current = block;

        while(current.parent !== null){
            current = GetBlockById(current.parent);
            level++;
        }
        return level;
}
