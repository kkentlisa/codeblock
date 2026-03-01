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
