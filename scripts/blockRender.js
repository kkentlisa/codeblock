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

    let currentLine = document.createElement('div');
    currentLine.className = 'block-line';
    blockBody.appendChild(currentLine);

    blockStructure.elements.forEach(element => {
        if (element.type === 'break') {
            currentLine = document.createElement('div');
            currentLine.className = 'block-line';
            blockBody.appendChild(currentLine);
        }
        else {
            const elementContainer = document.createElement('div');
            elementContainer.className = 'block-element';
            switch (element.type) {
                case 'text':
                    renderText(elementContainer, element.content);
                    break;
                case 'input':
                    renderInput(elementContainer, blockData, element.key, element.placeholder);
                    break;
                case 'slot':
                    if(['then', 'else', 'body'].includes(element.slotName)) {
                        renderSlotInBody(elementContainer, blockData, element.slotName, element.placeholder);
                    }
                    else {
                        renderSlot(elementContainer, blockData, element.slotName, element.placeholder);
                    }
                    break;
            }
            currentLine.appendChild(elementContainer);
        }
        });

    if(blockData.parent === null) {
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '⛌';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteBlock(blockData.id);
            renderAllBlocks(blocksInWorkSpace);
        };
        container.appendChild(deleteBtn);
    }
    
    container.appendChild(blockBody);

    if(blockData.parent == null && blockData.next !== null){
        const nextBlockData = getBlockById(blockData.next);
        if(nextBlockData){
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'flex-start';
            const nextElement = renderBlock(nextBlockData);
            container.appendChild(nextElement);
        }
    }

    container.addEventListener('mouseover', (e) => {
        e.stopPropagation();

        document.querySelectorAll('.block-container.hovered').forEach(element => {
            element.classList.remove('hovered');
        });

        container.classList.add('hovered');
    });
    container.addEventListener('mouseout', (e) => {
        e.stopPropagation();
        container.classList.remove('hovered');
    })

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
    const span = document.createElement('span');
    span.contentEditable = 'true';
    span.className = `blocks-input`;
    span.textContent = blockData.data[key] || '';
    span.dataset.placeholder = placeholder;

    span.oninput = (e) => {
        const text = e.target.textContent.trim();
        blockData.data[key] = text;
        saveBlocksToStorage();
    };
    span.onblur = (e) => {
        const text = e.target.textContent.trim();
        if (text === '') {
            blockData.data[key] = '';
        }
        saveBlocksToStorage();
    };

    container.appendChild(span);
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
        const childBlockData = getBlockById(childId);
        if(childBlockData) {
            const childElement = renderBlock(childBlockData);
            slotContainer.appendChild(childElement);
        }
    }
    container.appendChild(slotContainer);
}
function renderSlotInBody(container, blockData, slotName, placeholder) {
    const slotContainer = document.createElement('div');
    slotContainer.className = `slot-body slot-${slotName}`;
    slotContainer.dataset.slot = slotName;
    slotContainer.dataset.parentId = blockData.id;

    const arrayName = slotName+ 'Blocks';
    const childIds=blockData.data[arrayName];

    if(!childIds||childIds.length===0){
        const placeholderEl = document.createElement('div');
        placeholderEl.className = 'slot-placeholder';
        placeholderEl.textContent = placeholder || `[${slotName}]`;
        slotContainer.appendChild(placeholderEl);
    }
    else{
        childIds.forEach(childId=>{
            const childBlockData = getBlockById(childId);
            if(childBlockData){
                const childElement = renderBlock(childBlockData);
                slotContainer.appendChild(childElement);
            }
        })
    }
    container.appendChild(slotContainer);
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
                { type: 'input', key: 'value', placeholder: 'значение' }
            ]
        },
        'print': {
            elements: [
                { type: 'text', content: 'Вывод' },
                { type: 'slot', slotName: 'value', placeholder: 'значение' }
            ]
        },
        'variableInit': {
            elements: [
                { type: 'text', content: 'Новая переменная' },
                { type: 'input', key: 'name', placeholder: 'имя переменной' }
            ]
        },
        'assignValue': {
            elements: [
                { type: 'input', key: 'variable', placeholder: 'Переменная' },
                { type: 'text', content: '=' },
                { type: 'slot', slotName: 'value', placeholder: 'значение' }
            ]
        },
        'arrayDeclare': {
            elements: [
                { type: 'text', content: 'Новый массив' },
                { type: 'input', key: 'name', placeholder: 'имя массива' },
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
                { type: 'input', key: 'name', placeholder: 'массив' },
                { type: 'text', content: ')' }
            ]
        },
        'if': {
            elements: [
                { type: 'text', content: 'если' },
                { type: 'slot', slotName: 'condition', placeholder: 'условие' },
                { type: 'text', content: 'то' },
                { type: 'break' },
                { type: 'slot', slotName: 'then', placeholder: ' '}
            ]
        },
        'if-else': {
            elements: [
                { type: 'text', content: 'если' },
                { type: 'slot', slotName: 'condition', placeholder: 'условие' },
                { type: 'text', content: 'то' },
                { type: 'break' },
                { type: 'slot', slotName: 'then', placeholder: ' '},
                { type: 'break'},
                { type: 'text', content: 'иначе' },
                { type: 'break' },
                { type: 'slot', slotName: 'else', placeholder: ' '},
            ]
        },
        'while': {
            elements: [
                { type: 'text', content: 'пока' },
                { type: 'slot', slotName: 'condition', placeholder: 'условие' },
                { type: 'text', content: 'выполнять' },
                { type: 'break' },
                { type: 'slot', slotName: 'body', placeholder: ' ' }
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


