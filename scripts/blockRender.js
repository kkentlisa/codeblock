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
    const container = document.createElement('div');
    container.className = 'block-container';
    container.dataset.id = blockData.id;

    if (blockData.parent === null && blockData.previous === null) {
        container.style.position = 'absolute';
        container.style.left = blockData.position.x + 'px';
        container.style.top = blockData.position.y + 'px';
    } else {
        container.style.position = 'relative';
        container.style.margin = '0';
    }

    const blockBody = document.createElement('div');
    blockBody.className = `block block-${blockData.type}`;

    const blockStructure = getBlockStructure(blockData);

    blockStructure.elements.forEach(element => {
        switch (element.type) {
            case 'text':
                renderText(blockBody, element.content);
                break;
            case 'input':
                renderInput(blockBody, blockData, element.key, element.placeholder);
                break;
            case 'slot':
                renderSlot(blockBody, blockData, element.slotName, element.placeholder);
                break;
            case 'body':
                renderBody(blockBody, blockData, element.part);
                break;
        }
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

    if(blockData.next !== null){
        const nextBlockData = GetBlockById(blockData.next);
        if(nextBlockData){
            const nextElement = renderBlock(nextBlockData);
            container.appendChild(nextElement);
        }
    }
    setupDraggable(container);
    return container;
}

function renderText(container, content) {
    const span = document.createElement('span');
    span.className = 'block-text';
    span.textContent = content;
    container.appendChild(span);
}

function renderInput(container, blockData, key, placeholder) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.className = `blocks-input`;
    input.value = blockData.data[key] || '';

    input.oninput = (e) => {
        blockData.data[key] = e.target.value;
        SaveBlocksToStorage();
    };

    container.appendChild(input);
}

function renderSlot(container, blockData, slotName, placeholder) {
    const slotContainer = document.createElement('div');
    slotContainer.className = `slot-${slotName}`;
    slotContainer.dataset.slot = slotName;
    slotContainer.dataset.parentId = blockData.id;

    const childId = blockData.data ? blockData.data[slotName] : null;

    if (!childId) {
        const placeholderEl = document.createElement('div');
        placeholderEl.className = 'slot-placeholder';
        placeholderEl.textContent = placeholder || `[${slotName}]`;
        slotContainer.appendChild(placeholderEl);
    } else {
        slotContainer.dataset.childId = childId;
        const childBlockData = GetBlockById(childId);
        if(childBlockData) {
            const childElement = renderBlock(childBlockData);
            slotContainer.appendChild(childElement);
        }
    }
    container.appendChild(slotContainer);
}

function renderBody(container, blockData, part = 'body') {
    const bodyContainer = document.createElement('div');
    bodyContainer.className = `body-${part}`;
    bodyContainer.dataset.parentId = blockData.id;
    bodyContainer.dataset.bodyPart = part;

    const firstChildId = blockData.data[part];

    if (firstChildId) {
        const childBlockData = GetBlockById(firstChildId);
        if (childBlockData) {
            const childElement = renderBlock(childBlockData);
            bodyContainer.appendChild(childElement);
        }
    }
    container.appendChild(bodyContainer);
}

function getBlockStructure(blockData) {
    const structures = {
        'start': {
            elements: [
                { type: 'text', content: 'Старт' }
            ]
        },
        'input': {
            elements: [
                { type: 'text', content: 'Ввод' },
                { type: 'input', key: 'value', placeholder: 'Имя переменной' }
            ]
        },
        'print': {
            elements: [
                { type: 'text', content: 'Вывод' },
                { type: 'input', key: 'value', placeholder: 'переменная' }
            ]
        },
        'variableInit': {
            elements: [
                { type: 'text', content: 'Новая переменная' },
                { type: 'input', key: 'name', placeholder: 'Имя переменной' }
            ]
        },
        'assignValue': {
            elements: [
                { type: 'input', key: 'variable', placeholder: 'переменная' },
                { type: 'text', content: '=' },
                { type: 'slot', slotName: 'value', placeholder: 'значение' }
            ]
        },
        'arrayDeclare': {
            elements: [
                { type: 'text', content: 'Новый массив' },
                { type: 'input', key: 'name', placeholder: 'Имя массива' },
                { type: 'text', content: 'размером' },
                { type: 'input', key: 'size', placeholder: 'размер' }
            ]
        },
        'arrayAssignByIndex': {
            elements: [
                { type: 'input', key: 'name', placeholder: 'массив' },
                { type: 'text', content: '[' },
                { type: 'slot', slotName: 'index', placeholder: 'индекс' },
                { type: 'text', content: ']' },
                { type: 'text', content: '=' },
                { type: 'slot', slotName: 'value', placeholder: 'значение' }
            ]
        },
        'arrayGet': {
            elements: [
                { type: 'input', key: 'name', placeholder: 'массив' },
                { type: 'text', content: '[' },
                { type: 'slot', slotName: 'index', placeholder: 'индекс' },
                { type: 'text', content: ']' }
            ]
        },
        'arrayLength': {
            elements: [
                { type: 'text', content: 'длина' },
                { type: 'text', content: '(' },
                { type: 'input', slotName: 'name', placeholder: 'массив' },
                { type: 'text', content: ')' }
            ]
        },
        'if': {
            elements: [
                { type: 'text', content: 'если' },
                { type: 'slot', slotName: 'condition', placeholder: 'условие' },
                { type: 'text', content: 'то' },
                { type: 'body' }
            ]
        },
        'if-else': {
            elements: [
                { type: 'text', content: 'если' },
                { type: 'slot', slotName: 'condition', placeholder: 'условие' },
                { type: 'text', content: 'то' },
                { type: 'body', part: 'then' },
                { type: 'text', content: 'иначе' },
                { type: 'body', part: 'else' }
            ]
        },
        'while': {
            elements: [
                { type: 'text', content: 'пока' },
                { type: 'slot', slotName: 'condition', placeholder: 'условие' },
                { type: 'text', content: 'выполнять' },
                { type: 'body' }
            ]
        },
        'add': {
            elements: createBinaryOperation('+')
        },
        'subtract': {
            elements: createBinaryOperation('-')
        },
        'multiply': {
            elements: createBinaryOperation('*')
        },
        'div': {
            elements: createBinaryOperation('/')
        },
        'mod': {
            elements: createBinaryOperation('%')
        },
        'gt': {
            elements: createBinaryOperation('>')
        },
        'lt': {
            elements: createBinaryOperation('<')
        },
        'eq': {
            elements: createBinaryOperation('=')
        },
        'neq': {
            elements: createBinaryOperation('≠')
        },
        'gte': {
            elements: createBinaryOperation('≥')
        },
        'lte': {
            elements: createBinaryOperation('≤')
        },
        'and': {
            elements: createBinaryOperation('И')
        },
        'or': {
            elements: createBinaryOperation('ИЛИ')
        },
        'not': {
            elements: [
                { type: 'text', content: 'НЕ' },
                { type: 'slot', slotName: 'operand', placeholder: 'значение' }
            ]
        }
    };

    return structures[blockData.type] || { elements: [] };
}

function createBinaryOperation(operator) {
    return [
        { type: 'slot', slotName: 'left', placeholder: ' ' },
        { type: 'text', content: operator },
        { type: 'slot', slotName: 'right', placeholder: ' ' }
    ];
}

function renderAllBlocks(blocksArray) {
    if(!workspace) return;

    const UIButtons =workspace.querySelector('.blockWorkSpaceButton');
    workspace.innerHTML = '';
    if(UIButtons) workspace.appendChild(UIButtons);
    const rootBlocks = blocksArray.filter(b => b.parent === null && b.previous === null);

    rootBlocks.forEach(blockData => {
        const element = renderBlock(blockData);
        workspace.appendChild(element);
    });
}


