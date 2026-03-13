let variables = {};
let arrays = {};

function getBlockName(block) {
    return window.typeNames?.[block.type];
}

function setVariable(name, value) {
    variables[name] = value;
}

function getVariable(name) {
    return variables[name];
}

function validateOperands(block){
    if (block.data.left === null || block.data.right === null) {
        logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: не все операнды заполнены`);
        highlightErrorBlock(block.id);
        throw new Error(`Не все операнды заполнены`);
    }
}

function validateCondition(block){
    if (block.data.condition === null) {
        logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: не заполнено условие`);
        highlightErrorBlock(block.id);
        throw new Error(`Не заполнено условие`);
    }
}

function validateArrays(block){
    const arrayName = block.data.name;
    if (arrayName === "") {
        logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: не указано имя массива`);
        highlightErrorBlock(block.id);
        throw new Error(`Не указано имя массива`);
    }
    if (!arrays[arrayName]) {
        logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: массив ${arrayName} не найден`);
        highlightErrorBlock(block.id);
        throw new Error(`Массив ${arrayName} не найден`);
    }
}

function evaluateExpression(block) {
    if (block.type === "input") {
        const value = block.data.value;
        if (value === ""){
            logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: не введено значение`);
            highlightErrorBlock(block.id);
            throw new Error(`Не введено значение`);
        }

        if (!isNaN(value)) {
            return Number(value);
        }

        const variableValue = getVariable(value);
        if (variableValue !== undefined) {
            return variableValue;
        }

        return value;
    }

    else if (block.type === "add") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);
        return leftValue + rightValue;
    }

    else if (block.type === "subtract") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);
        return leftValue - rightValue;
    }

    else if (block.type === "multiply") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);
        return leftValue * rightValue;
    }

    else if (block.type === "div") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);

        if (rightValue === 0) {
            logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: деление на 0`);
            highlightErrorBlock(block.id);
            throw new Error(`Деление на 0`);
        }

        return Math.floor(leftValue / rightValue);
    }

    else if (block.type === "mod") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);

        if (rightValue === 0) {
            logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: деление на 0`);
            highlightErrorBlock(block.id);
            throw new Error(`Деление на 0`);
        }

        return leftValue % rightValue;
    }
    else if (["gt", "lt", "eq", "neq", "gte", "lte", "and", "or", "not"].includes(block.type)) {
        return evaluateCondition(block);
    }
    else if (block.type === "arrayGet") {
        validateArrays(block);
        if (block.data.index === null) {
            logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: не указан индекс для чтения из массива`);
            highlightErrorBlock(block.id);
            throw new Error(`Не указан индекс для чтения из массива`);
        }

        const indexBlock = getBlockById(block.data.index);
        const index = evaluateExpression(indexBlock);

        if (!Number.isInteger(index)) {
            logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: индекс должен быть целым числом`);
            highlightErrorBlock(block.id);
            throw new Error(`Индекс должен быть целым числом`);
        }
        if (index < 0 || index >= arrays[block.data.name].length) {
            logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: индекс вне границ массива`);
            highlightErrorBlock(block.id);
            throw new Error(`Индекс вне границ массива`);
        }
        return arrays[block.data.name][index];
    }
    else if (block.type === "arrayLength") {
        validateArrays(block);
        return arrays[block.data.name].length;
    }
}

function evaluateCondition(block) {
    if (block.type === "gt") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);
        return leftValue > rightValue;
    }

    else if (block.type === "lt") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);
        return leftValue < rightValue;
    }

    else if (block.type === "eq") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);
        return leftValue === rightValue;
    }

    else if (block.type === "neq") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);
        return leftValue !== rightValue;
    }

    else if (block.type === "gte") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);
        return leftValue >= rightValue;
    }

    else if (block.type === "lte") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);
        return leftValue <= rightValue;
    }

    else if (block.type === "and") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);
        return leftValue && rightValue;
    }

    else if (block.type === "or") {
        validateOperands(block);
        const leftBlock=getBlockById(block.data.left);
        const rightBlock=getBlockById(block.data.right);

        const leftValue = evaluateExpression(leftBlock);
        const rightValue = evaluateExpression(rightBlock);
        return leftValue || rightValue;
    }

    else if (block.type === "not") {
        if (block.data.operand === null) {
            logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: операнд не заполнен`);
            highlightErrorBlock(block.id);
            throw new Error(`Операнд не заполнен`);
        }
        const operandBlock =getBlockById(block.data.operand);
        const operandValue = evaluateCondition(operandBlock);
        return !operandValue;
    }
}

function executeBlock(block) {
    if (!block) return;

    switch (block.type) {
        case "variableInit":
            if (block.data.name === ""){
                logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: не указано имя переменной`);
                highlightErrorBlock(block.id);
                throw new Error(`Не указано имя переменной`);
            }
            setVariable(block.data.name, block.data.value);
            break;
        case "assignValue":
            if (block.data.variable === ""){
                logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: не указано имя переменной`);
                highlightErrorBlock(block.id);
                throw new Error(`Не указано имя переменной`);
            }
            if (block.data.value === null) {
                logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: не заполнено значение для присваивания`);
                highlightErrorBlock(block.id);
                throw new Error(`Не заполнено значение для присваивания`);
            }
            const valueBlock=getBlockById(block.data.value);
            const value = evaluateExpression(valueBlock);
            setVariable(block.data.variable, value);
            break;
        case "if":
            validateCondition(block);
            if (evaluateCondition(getBlockById(block.data.condition))) {
                block.data.thenBlocks.forEach(id =>{
                    const childBlock = getBlockById(id);
                    if (childBlock) executeBlock(childBlock);
                });
            }
            break;
        case "if-else":
            validateCondition(block);

            if (evaluateCondition(getBlockById(block.data.condition))) {
                block.data.thenBlocks.forEach(id =>{
                    const childBlock = getBlockById(id);
                    if (childBlock) executeBlock(childBlock);
                });
            }
            else {
                block.data.elseBlocks.forEach(id =>{
                    const childBlock = getBlockById(id);
                    if (childBlock) executeBlock(childBlock);
                });
            }
            break;
        case "while":
            validateCondition(block);

            let iterations = 0;
            const MAX_ITERATIONS = 10000;
            while (evaluateCondition(getBlockById(block.data.condition))) {
                iterations ++;
                if (iterations > MAX_ITERATIONS) {
                    logToOutputPanel(`Превышен лимит итераций в блоке ${getBlockName(block)}`);
                    highlightErrorBlock(block.id);
                    throw new Error(`Превышен лимит итераций`);
                }
                block.data.bodyBlocks.forEach(id =>{
                    const childBlock = getBlockById(id);
                    if (childBlock) executeBlock(childBlock);
                });
            }
            break;
        case "print": {
            if (block.data.value === null){
                logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: не задано значение для вывода`);
                highlightErrorBlock(block.id);
                throw new Error(`Не задано значение для вывода`);
            }
            const value = evaluateExpression(getBlockById(block.data.value));
            logToOutputPanel(String(value));
            break;
        }
        case "arrayDeclare":
            if (block.data.name === ""){
                logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: не указано имя массива`);
                highlightErrorBlock(block.id);
                throw new Error(`Не указано имя массива`);
            }
            const size = Number(block.data.size);
            if (size <= 0 || isNaN(size)) {
                logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: не корректный размер массива`);
                highlightErrorBlock(block.id);
                throw new Error(`Не корректный размер массива`);
            }
            arrays[block.data.name] = new Array(size).fill(0);
            break;
        case "arrayAssignByIndex":
            validateArrays(block);
            if (block.data.index === null) {
                logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: не указан индекс для записи в массив`);
                highlightErrorBlock(block.id);
                throw new Error(`Не указан индекс для записи в массив`);
            }
            const index = evaluateExpression(getBlockById(block.data.index));
            if (!Number.isInteger(index)) {
                logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: индекс должен быть целым числом`);
                highlightErrorBlock(block.id);
                throw new Error(`Индекс должен быть целым числом`);
            }
            if (index < 0 || index >= arrays[block.data.name].length) {
                logToOutputPanel(`Ошибка в блоке ${getBlockName(block)}: индекс вне границ массива`);
                highlightErrorBlock(block.id);
                throw new Error(`Индекс вне границ массива`);
            }
            arrays[block.data.name][index] = evaluateExpression(getBlockById(block.data.value));
            break;
    }
}

function runProgram(){
    document.querySelectorAll('.block-error').forEach((block) => {
        block.classList.remove('block-error');
    });

    clearOutputPanel();

    try {
        const startBlock = blocksInWorkSpace.find(b => b.type === "start");
        if (!startBlock) {
            logToOutputPanel("Нет стартового блока!");
            return;
        }

        variables = {};
        arrays = {};

        let currentBlockId = startBlock.next;

        while (currentBlockId) {
            const currentBlock = getBlockById(currentBlockId);
            if (!currentBlock) return;

            executeBlock(currentBlock);
            currentBlockId = currentBlock.next;
        }
    }
    catch (error){
        logToOutputPanel(`Программа завершена с ошибкой!`);
    }
}