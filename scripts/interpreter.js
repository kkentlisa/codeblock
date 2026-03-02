let variables = {};

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
        throw new Error(`Не все операнды заполнены`);
    }
}

function validateCondition(block){
    if (!block.data.condition) {
        LogToOutputPanel(`Ошибка в блоке ${GetBlockName(block)}: не заполнено условие`);
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
            throw new Error(`Деление на 0`);
        }

        return leftValue % rightValue;
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
                throw new Error(`Переменная "${block.data.variable}" не найдена`);
            }
            else {
                LogToOutputPanel(String(value));
            }
            break;
        }

    }
}

function RunProgram(){
    ClearOutputPanel();

    const startBlock = blocksInWorkSpace.find(b => b.type === "start");
    if (!startBlock) {
        LogToOutputPanel("Нет стартового блока!");
        return;
    }

    variables = {};

    let currentBlockId = startBlock.child;

    while (currentBlockId) {
        const currentBlock = GetBlockById(currentBlockId);
        if (!currentBlock) return;

        ExecuteBlock(currentBlock);
        currentBlockId = currentBlock.child;
    }
}