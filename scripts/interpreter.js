let variables = {};
let arrays = {};

function GetBlockName(block) {
    return window.typeNames?.[block.type];
}

function SetVariable(name, value) {
    variables[name] = value;
}

function GetVariable(name) {
    return variables[name];
}

function validateOperands(block){
    if (block.data.left === null || block.data.right === null) {
        LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не все операнды заполнены`);
        highlightErrorBlock(block.id);
        throw new Error(`Не все операнды заполнены`);
    }
}

function validateCondition(block){
    if (block.data.condition === null) {
        LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не заполнено условие`);
        highlightErrorBlock(block.id);
        throw new Error(`Не заполнено условие`);
    }
}

function EvaluateExpression(block) {
    if (block.type === "input") {
        const value = block.data.value;
        if (value === ""){
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не введено значение`);
            highlightErrorBlock(block.id);
            throw new Error(`Не введено значение`);
        }

        if (!isNaN(value)) {
            return Number(value);
        }

        const variableValue = GetVariable(value);
        if (variableValue !== undefined) {
            return variableValue;
        }

        return value;
    }

    else if (block.type === "add") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);
        return leftValue + rightValue;
    }

    else if (block.type === "subtract") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);
        return leftValue - rightValue;
    }

    else if (block.type === "multiply") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);
        return leftValue * rightValue;
    }

    else if (block.type === "div") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);

        if (rightValue === 0) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: деление на 0`);
            highlightErrorBlock(block.id);
            throw new Error(`Деление на 0`);
        }

        return Math.floor(leftValue / rightValue);
    }

    else if (block.type === "mod") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);

        if (rightValue === 0) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: деление на 0`);
            highlightErrorBlock(block.id);
            throw new Error(`Деление на 0`);
        }

        return leftValue % rightValue;
    }
    else if (["gt", "lt", "eq", "neq", "gte", "lte", "and", "or", "not"].includes(block.type)) {
        return EvaluateCondition(block);
    }
    else if (block.type === "arrayGet") {
        const arrayName = block.data.name;
        if (arrayName === "") {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не указано имя массива`);
            highlightErrorBlock(block.id);
            throw new Error(`Не указано имя массива`);
        }
        if (!arrays[arrayName]) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: массив ${arrayName} не найден`);
            highlightErrorBlock(block.id);
            throw new Error(`Массив ${arrayName} не найден`);
        }
        if (block.data.index === null) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не указан индекс для чтения из массива`);
            highlightErrorBlock(block.id);
            throw new Error(`Не указан индекс для записи в массив`);
        }

        const indexBlock = GetBlockById(block.data.index);
        const index = EvaluateExpression(indexBlock);

        if (!Number.isInteger(index)) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: индекс должен быть целым числом`);
            highlightErrorBlock(block.id);
            throw new Error(`Индекс должен быть целым числом`);
        }
        if (index < 0 || index >= arrays[arrayName].length) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: индекс вне границ массива`);
            highlightErrorBlock(block.id);
            throw new Error(`Индекс вне границ массива`);
        }
        return arrays[arrayName][index];
    }
    else if (block.type === "arrayLength") {
        const arrayName = block.data.name;
        if (arrayName === "") {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не указано имя массива`);
            highlightErrorBlock(block.id);
            throw new Error(`Не указано имя массива`);
        }
        if (!arrays[arrayName]) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: массив ${arrayName} не найден`);
            highlightErrorBlock(block.id);
            throw new Error(`Массив ${arrayName} не найден`);
        }
        return arrays[arrayName].length;
    }
}

function EvaluateCondition(block) {
    if (block.type === "gt") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);
        return leftValue > rightValue;
    }

    else if (block.type === "lt") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);
        return leftValue < rightValue;
    }

    else if (block.type === "eq") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);
        return leftValue === rightValue;
    }

    else if (block.type === "neq") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);
        return leftValue !== rightValue;
    }

    else if (block.type === "gte") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);
        return leftValue >= rightValue;
    }

    else if (block.type === "lte") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);
        return leftValue <= rightValue;
    }

    else if (block.type === "and") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);
        return leftValue && rightValue;
    }

    else if (block.type === "or") {
        validateOperands(block);
        const leftBlock=GetBlockById(block.data.left);
        const rightBlock=GetBlockById(block.data.right);

        const leftValue = EvaluateExpression(leftBlock);
        const rightValue = EvaluateExpression(rightBlock);
        return leftValue || rightValue;
    }

    else if (block.type === "not") {
        if (block.data.operand === null) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: операнд не заполнен`);
            highlightErrorBlock(block.id);
            throw new Error(`Операнд не заполнен`);
        }
        const operandBlock =GetBlockById(block.data.operand);
        const operandValue = EvaluateCondition(operandBlock);
        return !operandValue;
    }
}

function ExecuteBlock(block) {
    if (!block) return;

    switch (block.type) {
        case "variableInit":
            if (block.data.name === ""){
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не указано имя переменной`);
                highlightErrorBlock(block.id);
                throw new Error(`Не указано имя переменной`);
            }
            SetVariable(block.data.name, block.data.value);
            break;
        case "assignValue":
            if (block.data.variable === ""){
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не указано имя переменной`);
                highlightErrorBlock(block.id);
                throw new Error(`Не указано имя переменной`);
            }
            if (block.data.value === null) {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не заполнено значение для присваивания`);
                highlightErrorBlock(block.id);
                throw new Error(`Не заполнено значение для присваивания`);
            }
            const valueBlock=GetBlockById(block.data.value);
            const value = EvaluateExpression(valueBlock);
            SetVariable(block.data.variable, value);
            break;
        case "if":
            validateCondition(block);
            if (EvaluateCondition(GetBlockById(block.data.condition))) {
                block.data.thenBlocks.forEach(id =>{
                    const childBlock = GetBlockById(id);
                    if (childBlock) ExecuteBlock(childBlock);
                });
            }
            break;
        case "if-else":
            validateCondition(block);

            if (EvaluateCondition(GetBlockById(block.data.condition))) {
                block.data.thenBlocks.forEach(id =>{
                    const childBlock = GetBlockById(id);
                    if (childBlock) ExecuteBlock(childBlock);
                });
            }
            else {
                block.data.elseBlocks.forEach(id =>{
                    const childBlock = GetBlockById(id);
                    if (childBlock) ExecuteBlock(childBlock);
                });
            }
            break;
        case "while":
            validateCondition(block);
            while (EvaluateCondition(GetBlockById(block.data.condition))) {
                block.data.bodyBlocks.forEach(id =>{
                    const childBlock = GetBlockById(id);
                    if (childBlock) ExecuteBlock(childBlock);
                });
            }
            break;
        case "print": {
            if (block.data.value === null){
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не задано значение для вывода`);
                highlightErrorBlock(block.id);
                throw new Error(`Не задано значение для вывода`);
            }
            const value = EvaluateExpression(GetBlockById(block.data.value));
            LogToOutputPanel(String(value));
            break;
        }
        case "arrayDeclare":
            if (block.data.name === ""){
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не указано имя массива`);
                highlightErrorBlock(block.id);
                throw new Error(`Не указано имя массива`);
            }
            const size = Number(block.data.size);
            if (size <= 0 || isNaN(size)) {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не корректный размер массива`);
                highlightErrorBlock(block.id);
                throw new Error(`Не корректный размер массива`);
            }
            arrays[block.data.name] = new Array(size).fill(0);
            break;
        case "arrayAssignByIndex":
            const arrayName = block.data.name;
            if (arrayName === "") {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не указано имя массива`);
                highlightErrorBlock(block.id);
                throw new Error(`Не указано имя массива`);
            }
            if (!arrays[arrayName]) {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: массив ${arrayName} не найден`);
                highlightErrorBlock(block.id);
                throw new Error(`Массив ${arrayName} не найден`);
            }
            if (block.data.index === null) {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не указан индекс для записи в массив`);
                highlightErrorBlock(block.id);
                throw new Error(`Не указан индекс для записи в массив`);
            }
            const index = EvaluateExpression(GetBlockById(block.data.index));
            if (!Number.isInteger(index)) {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: индекс должен быть целым числом`);
                highlightErrorBlock(block.id);
                throw new Error(`Индекс должен быть целым числом`);
            }
            if (index < 0 || index >= arrays[arrayName].length) {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: индекс вне границ массива`);
                highlightErrorBlock(block.id);
                throw new Error(`Индекс вне границ массива`);
            }
            arrays[arrayName][index] = EvaluateExpression(GetBlockById(block.data.value));
            break;
    }
}

function RunProgram(){
    document.querySelectorAll('.block-error').forEach((block) => {
        block.classList.remove('block-error');
    });

    ClearOutputPanel();

    const startBlock = blocksInWorkSpace.find(b => b.type === "start");
    if (!startBlock) {
        LogToOutputPanel("Нет стартового блока!");
        throw new Error(`Нет стартового блока`);
    }

    variables = {};
    arrays = {};

    let currentBlockId = startBlock.next;

    while (currentBlockId) {
        const currentBlock = GetBlockById(currentBlockId);
        if (!currentBlock) return;

        ExecuteBlock(currentBlock);
        currentBlockId = currentBlock.next;
    }
}