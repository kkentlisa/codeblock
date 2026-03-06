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
    if (!block.data.left || !block.data.right) {
        LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не все операнды заполнены`);
        highlightErrorBlock(block.id);
        throw new Error(`Не все операнды заполнены`);
    }
}

function validateCondition(block){
    if (!block.data.condition) {
        LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не заполнено условие`);
        highlightErrorBlock(block.id);
        throw new Error(`Не заполнено условие`);
    }
}

function EvaluateExpression(block) {
    if (block.type === "input") {
        const value = block.data.value;
        if (isNaN(value)) {
            const variableValue =  GetVariable(value);
            if (variableValue === undefined){
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: переменная "${value}" не найдена`);
                highlightErrorBlock(block.id);
                throw new Error(`Переменная "${value}" не найдена`);
            }
            return variableValue;
        }
        else
            return Number(value);
    }

    else if (block.type === "add") {
        validateOperands(block);
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue + rightValue;
    }

    else if (block.type === "subtract") {
        validateOperands(block);
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue - rightValue;
    }

    else if (block.type === "multiply") {
        validateOperands(block);
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue * rightValue;
    }

    else if (block.type === "div") {
        validateOperands(block);
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);

        if (rightValue === 0) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: деление на 0`);
            highlightErrorBlock(block.id);
            throw new Error(`Деление на 0`);
        }

        return Math.floor(leftValue / rightValue);
    }

    else if (block.type === "mod") {
        validateOperands(block);
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);

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
        if (!arrayName) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не указано имя массива`);
            highlightErrorBlock(block.id);
            throw new Error(`Не указано имя массива`);
        }
        if (!arrays[arrayName]) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: массив ${arrayName} не найден`);
            highlightErrorBlock(block.id);
            throw new Error(`Массив ${arrayName} не найден`);
        }
        if (!block.data.index) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не указан индекс для чтения из массива`);
            highlightErrorBlock(block.id);
            throw new Error(`Не указан индекс для записи в массив`);
        }
        const index = EvaluateExpression(block.data.index);
        if (!Number.isInteger(index)) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: индекс должен быть целым числом`);
            highlightErrorBlock(block.id);
            throw new Error(`Индекс должен быть целым числом`);
        }
        if (index < 0 || index > arrays[arrayName].length - 1) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: индекс вне границ массива`);
            highlightErrorBlock(block.id);
            throw new Error(`Индекс вне границ массива`);
        }
        return arrays[arrayName][index];
    }
    else if (block.type === "arrayLength") {
        const arrayName = block.data.name;
        if (!arrayName) {
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
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue > rightValue;
    }

    else if (block.type === "lt") {
        validateOperands(block);
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue < rightValue;
    }

    else if (block.type === "eq") {
        validateOperands(block);
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue === rightValue;
    }

    else if (block.type === "neq") {
        validateOperands(block);
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue !== rightValue;
    }

    else if (block.type === "gte") {
        validateOperands(block);
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue >= rightValue;
    }

    else if (block.type === "lte") {
        validateOperands(block);
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue <= rightValue;
    }

    else if (block.type === "and") {
        validateOperands(block);
        const leftValue = EvaluateCondition(block.data.left);
        const rightValue = EvaluateCondition(block.data.right);
        return leftValue && rightValue;
    }

    else if (block.type === "or") {
        validateOperands(block);
        const leftValue = EvaluateCondition(block.data.left);
        const rightValue = EvaluateCondition(block.data.right);
        return leftValue || rightValue;
    }

    else if (block.type === "not") {
        if (!block.data.operand) {
            LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: операнд не заполнен`);
            highlightErrorBlock(block.id);
            throw new Error(`Операнд не заполнен`);
        }
        const operandValue = EvaluateCondition(block.data.operand);
        return !operandValue;
    }
}

function ExecuteBlock(block) {
    if (!block) return;

    switch (block.type) {
        case "variableInit":
            SetVariable(block.data.name, block.data.value);
            break;
        case "assignValue":
            if (!block.data.value) {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не заполнено значение для присваивания`);
                highlightErrorBlock(block.id);
                throw new Error(`Не заполнено значение для присваивания`);
            }
            const value = EvaluateExpression(block.data.value);
            SetVariable(block.data.variable, value);
            break;
        case "if":
            validateCondition(block);
            if (EvaluateCondition(block.data.condition)) {
                block.data.thenBlocks.forEach(id =>{
                    const childBlock = GetBlockById(id);
                    if (childBlock) ExecuteBlock(childBlock);
                });
            }
            break;
        case "ifElse":
            validateCondition(block);
            if (EvaluateCondition(block.data.condition)) {
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
            while (EvaluateCondition(block.data.condition)){
                block.data.bodyBlocks.forEach(id =>{
                    const childBlock = GetBlockById(id);
                    if (childBlock) ExecuteBlock(childBlock);
                });
            }
            break;
        case "print": {
            const value = GetVariable(block.data.variable);
            if (value === undefined){
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: переменная "${block.data.variable}" не найдена`);
                highlightErrorBlock(block.id);
                throw new Error(`Переменная "${block.data.variable}" не найдена`);
            }
            else {
                LogToOutputPanel(String(value));
            }
            break;
        }
        case "arrayDeclare":
            arrays[block.data.name] = new Array(block.data.size).fill(0);
            break;
        case "arrayAssignByIndex":
            const arrayName = block.data.name;
            if (!arrayName) {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не указано имя массива`);
                highlightErrorBlock(block.id);
                throw new Error(`Не указано имя массива`);
            }
            if (!arrays[arrayName]) {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: массив ${arrayName} не найден`);
                highlightErrorBlock(block.id);
                throw new Error(`Массив ${arrayName} не найден`);
            }
            if (!block.data.index) {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не указан индекс для записи в массив`);
                highlightErrorBlock(block.id);
                throw new Error(`Не указан индекс для записи в массив`);
            }
            const index = EvaluateExpression(block.data.index);
            if (!Number.isInteger(index)) {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: индекс должен быть целым числом`);
                highlightErrorBlock(block.id);
                throw new Error(`Индекс должен быть целым числом`);
            }
            if (index < 0 || index > arrays[arrayName].length - 1) {
                LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: индекс вне границ массива`);
                highlightErrorBlock(block.id);
                throw new Error(`Индекс вне границ массива`);
            }
            arrays[arrayName][index] = EvaluateExpression(block.data.value);
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
        return;
    }

    variables = {};
    arrays = {};

    let currentBlockId = startBlock.child;

    while (currentBlockId) {
        const currentBlock = GetBlockById(currentBlockId);
        if (!currentBlock) return;

        ExecuteBlock(currentBlock);
        currentBlockId = currentBlock.child;
    }
}