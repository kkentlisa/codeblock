const workspace = document.querySelector('.workSpace');

window.typeNames = {
    'start': 'Старт',
    'input': 'Ввод',
    'print': 'Вывод',
    'variableInit': 'Объявление переменной',
    'assignValue': 'Присваивание',
    'if': 'Условие if',
    'if-else': 'Условие if-else',
    'while': 'Цикл while',
    'add': 'Сложение',
    'subtract': 'Вычитание',
    'multiply': 'Умножение',
    'div': 'Деление',
    'mod': 'Остаток',
    'gt': 'Больше',
    'lt': 'Меньше',
    'eq': 'Равно',
    'neq': 'Не равно',
    'gte': 'Больше или равно',
    'lte': 'Меньше или равно',
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

    block.textContent = typeNames[blockData.type];

    if (blockData.type === 'input') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'blocks-input';
        input.value = blockData.data.message;
        input.placeholder = 'введите переменную';

        input.addEventListener('input', function(e) {
            blockData.data.message = e.target.value;
            SaveBlocksToStorage();
        });
        input.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });

        block.appendChild(input);
    }
    else if (blockData.type === 'variableInit') {
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
    }
    else if (blockData.type === 'print') {
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