const workspace = document.querySelector('.workSpace');

window.typeNames = {
    'start': 'Старт',
    'input': 'Ввод',
    'print': 'Вывод',
    'variableInit': 'Объявление переменной',
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
};

function renderBlock(blockData) {
    const container = document.createElement('div');

    container.className = 'block-container';
    container.dataset.id = blockData.id;
    container.style.position = 'absolute';
    container.style.left = blockData.position.x + 'px';
    container.style.top = blockData.position.y + 'px';

    const block = document.createElement('div');
    block.classList.add('block');
    block.classList.add(`block-${blockData.type}`);
    block.dataset.id = blockData.id;

    if (['add', 'subtract', 'multiply', 'div', 'gt', 'lt', 'eq', 'neq', 'gte', 'lte', 'and', 'or'].includes(blockData.type)){
        const leftSlot = document.createElement('div');
        leftSlot.className = 'slot-left';
        block.appendChild(leftSlot);

        const textSpan = document.createElement('span');
        textSpan.textContent = typeNames[blockData.type];
        textSpan.className = 'block-text';
        block.appendChild(textSpan);

        const rightSlot = document.createElement('div');
        rightSlot.className = 'slot-right';
        block.appendChild(rightSlot);
    }

    else if(blockData.type === 'not'){
        const textSpan = document.createElement('span');
        textSpan.textContent = typeNames[blockData.type];
        textSpan.className = 'block-text';
        block.appendChild(textSpan);

        const operandSlot = document.createElement('div');
        operandSlot.className = 'slot-operand';
        block.appendChild(operandSlot);
    }

    else if (blockData.type === 'input') {
        const textSpan = document.createElement('span');
        textSpan.textContent = typeNames[blockData.type];
        textSpan.className = 'block-text';
        block.appendChild(textSpan);

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'blocks-input';
        input.value = blockData.data.value;
        input.placeholder = 'введите переменную';

        input.addEventListener('input', function(e) {
            blockData.data.value = e.target.value;
            SaveBlocksToStorage();
        });
        input.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });

        block.appendChild(input);
    }
    else if (blockData.type === 'variableInit') {
        const textSpan = document.createElement('span');
        textSpan.textContent = typeNames[blockData.type];
        textSpan.className = 'block-text';
        block.appendChild(textSpan);

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'blocks-input';
        nameInput.value = blockData.data.name;
        nameInput.placeholder = 'имя переменной';

        nameInput.addEventListener('input', function(e) {
            blockData.data.name = e.target.value;
            SaveBlocksToStorage();
        });

        nameInput.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });

        block.appendChild(nameInput);
    }
    else if (blockData.type === 'assignValue') {
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.className = 'blocks-input';
        valueInput.value = blockData.data.variable;
        valueInput.placeholder = 'имя переменной';

        valueInput.addEventListener('input', function(e) {
            blockData.data.variable = e.target.value;
            SaveBlocksToStorage();
        });

        valueInput.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });

        block.appendChild(valueInput);

        const textSpan = document.createElement('span');
        textSpan.textContent = typeNames[blockData.type];
        textSpan.className = 'block-text';
        block.appendChild(textSpan);

        const valueSlot = document.createElement('div');
        valueSlot.className = 'slot-value';
        block.appendChild(valueSlot);
    }

    else if (blockData.type === 'if') {
        const textSpan = document.createElement('span');
        textSpan.textContent = "Если";
        textSpan.className = 'block-text';
        block.appendChild(textSpan);

        const conditionSlot = document.createElement('div');
        conditionSlot.className = 'slot-condition';
        block.appendChild(conditionSlot);

        const text = document.createElement('span');
        text.textContent = ", то";
        text.className = 'block-text';
        block.appendChild(text);

        const bodyArea = document.createElement('div');
        bodyArea.className = 'block-body';
        block.appendChild(bodyArea);
    }

    else if (blockData.type === 'if-else'){
        const textSpan = document.createElement('span');
        textSpan.textContent = "Если";
        textSpan.className = 'block-text';
        block.appendChild(textSpan);

        const conditionSlot = document.createElement('div');
        conditionSlot.className = 'slot-condition';
        block.appendChild(conditionSlot);

        const text = document.createElement('span');
        text.textContent = ", то";
        text.className = 'block-text';
        block.appendChild(text);

        const bodyArea = document.createElement('div');
        bodyArea.className = 'block-body';
        block.appendChild(bodyArea);

        const textBlock = document.createElement('span');
        textBlock.textContent = ", иначе";
        textBlock.className = 'block-text';
        block.appendChild(textBlock);
    }

    else if (blockData.type === 'while'){
        const textSpan = document.createElement('span');
        textSpan.textContent = "Пока";
        textSpan.className = 'block-text';
        block.appendChild(textSpan);

        const conditionSlot = document.createElement('div');
        conditionSlot.className = 'slot-condition';
        block.appendChild(conditionSlot);

        const text = document.createElement('span');
        text.textContent = ", выполнить";
        text.className = 'block-text';
        block.appendChild(text);

        const bodyArea = document.createElement('div');
        bodyArea.className = 'block-body';
        block.appendChild(bodyArea);
    }

    else if (blockData.type === 'print') {
        const textSpan = document.createElement('span');
        textSpan.textContent = typeNames[blockData.type];
        textSpan.className = 'block-text';
        block.appendChild(textSpan);

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'blocks-input';
        nameInput.value = blockData.data.variable;
        nameInput.placeholder = 'имя переменной';

        nameInput.addEventListener('input', function(e) {
            blockData.data.variable = e.target.value;
            SaveBlocksToStorage();
        });

        nameInput.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });

        block.appendChild(nameInput);
    }
    else{
        const textSpan = document.createElement('span');
        textSpan.textContent = typeNames[blockData.type];
        textSpan.className = 'block-text';
        block.appendChild(textSpan);
    }

    const deleteBtn = document.createElement('span');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '⛌';

    container.appendChild(deleteBtn);
    container.appendChild(block);

    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        DeleteBlock(blockData.id);
        container.remove();
    };

    if (blockData.slotSizes) {
        Object.keys(blockData.slotSizes).forEach(slotName => {
            const size = blockData.slotSizes[slotName];
            const slotElement = block.querySelector(`.slot-${slotName}`);
            if (slotElement) {
                slotElement.style.width = size.width + 'px';
                slotElement.style.height = size.height + 'px';

                block.style.width = 'auto';
                block.style.minWidth = (size.width + 40) + 'px';
                block.style.minHeight = (size.height + 20) + 'px';
            }
        });
    }
        return container;

}

function renderAllBlocks(blocksArray) {
    if (!workspace) return;

    const blocks = workspace.querySelectorAll('.block-container');
    blocks.forEach(block => block.remove());

    blocksArray.forEach(blockData => {
        const containerElement = renderBlock(blockData);
        workspace.appendChild(containerElement);
        setupDraggable(containerElement);
    });
}