const workspace =document.querySelector('.workSpace');
window.typeNames = {
    'start': 'Старт',
    'input': 'Ввод',
    'print': 'Вывод',
    'variableInit': 'Новая переменная',
    'assignValue': '=',
    'if': 'Условие if',
    'if-else': 'Условие if-else',
    'while': 'Цикл while',
    'add': '+',
    'subtract': '-',
    'multiply': '*',
    'div': '/',
    'mod': 'Остаток',
    'gt': '>',
    'lt': '<',
    'eq': '=',
    'neq': '≠',
    'gte': '≥',
    'lte': '≤',
    'and': 'И',
    'or': 'ИЛИ',
    'not': 'НЕ',
    'arrayDeclare': 'Новый массив',
    'arrayAssignByIndex': 'Записать в массив',
    'arrayGet': 'Чтение из массива',
    'arrayLength': 'Длина массива'
};

function renderBlock(blockData){
    const container=document.createElement('div');
    container.className='block-container';
    container.dataset.id = blockData.id;

    if(blockData.parent === null){
        container.style.position = 'absolute';
        container.style.left = blockData.position.x + 'px';
        container.style.top = blockData.position.y + 'px';
    }
    else{
        container.style.position = 'relative';
        container.style.margin='0';
    }

    const blockBody=document.createElement('div');
    blockBody.className=`block block-${blockData.type}`;

    const label = document.createElement('span');
    label.className ='block-text';
    label.textContent=window.typeNames[blockData.type] || blockData.type;
    blockBody.appendChild(label);

    const slots = BLOCK_SLOTS[blockData.type] || [];
    slots.forEach(slotName => {
        const slotElement = document.createElement('div');
        slotElement.className=`slot slot-${slotName}`;

        const childBlockId=blockData.data[slotName];
        if(childBlockId){
            const childBlockData=GetBlockById(childBlockId);
            if(childBlockData){
                const childElement = renderBlock(childBlockData);
                slotElement.appendChild(childElement);
            }
        }
        blockBody.appendChild(slotElement);
    });

    const deleteBtn = document.createElement('span');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '⛌';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        DeleteBlock(blockData.id);
        renderAllBlocks(blocksInWorkSpace);
    };

    container.appendChild(deleteBtn);
    container.appendChild(blockBody);

    if(blockData.child !== null){
        const nextBlockData = GetBlockById(blockData.child);
        if(nextBlockData){
            const nextElement=renderBlock(nextBlockData);
            container.appendChild(nextElement);
        }
    }
    return container;
}

function renderAllBlocks(blocksArray) {
    if(!workspace) return;

    const UIButtons =workspace.querySelector('.blockWorkSpaceButton');
    workspace.innerHTML='';
    if(UIButtons) workspace.appendChild(UIButtons);
    const rootBlocks = blocksArray.filter(b => b.parent === null);

    rootBlocks.forEach(blockData => {
        const element = renderBlock(blockData);
        workspace.appendChild(element);

        setupDraggable(element);
    })
}


