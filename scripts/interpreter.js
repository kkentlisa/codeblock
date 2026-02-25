let variables = {};

function SetVariable(name, value) {
    variables[name] = value;
}

function GetVariable(name) {
    return variables[name];
}

function EvaluateExpression(block) {
    if (block.type === "input") {
        const value = block.data.value;
        if (isNaN(value)) {
            return GetVariable(value);
        }
        else
            return Number(value);
    }

    else if (block.type === "add") {
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue + rightValue;
    }

    else if (block.type === "subtract") {
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue - rightValue;
    }

    else if (block.type === "multiply") {
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue * rightValue;
    }

    else if (block.type === "div") {
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);

        if (rightValue === 0) {
            LogToOutputPanel("Деление на 0!")
            return 0;
        }

        return Math.floor(leftValue / rightValue);
    }

    else if (block.type === "mod") {
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);

        if (rightValue === 0) {
            LogToOutputPanel("Деление на 0!")
            return 0;
        }

        return leftValue % rightValue;
    }
}

function EvaluateCondition(block) {
    if (block.type === "gt") {
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue > rightValue;
    }

    else if (block.type === "lt") {
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue < rightValue;
    }

    else if (block.type === "eq") {
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue === rightValue;
    }

    else if (block.type === "neq") {
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue !== rightValue;
    }

    else if (block.type === "gte") {
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue >= rightValue;
    }

    else if (block.type === "lte") {
        const leftValue = EvaluateExpression(block.data.left);
        const rightValue = EvaluateExpression(block.data.right);
        return leftValue <= rightValue;
    }

    else if (block.type === "and") {
        const leftValue = EvaluateCondition(block.data.left);
        const rightValue = EvaluateCondition(block.data.right);
        return leftValue && rightValue;
    }

    else if (block.type === "or") {
        const leftValue = EvaluateCondition(block.data.left);
        const rightValue = EvaluateCondition(block.data.right);
        return leftValue || rightValue;
    }

    else if (block.type === "not") {
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
            const value = EvaluateExpression(block.data.value);
            SetVariable(block.data.variable, value);
            break;
        case "if":
            if (EvaluateCondition(block.data.condition)) {
                block.data.thenBlocks.forEach(id =>{
                    const childBlock = blocksInWorkSpace.find(b => b.id === id);
                    if (childBlock) ExecuteBlock(childBlock);
                });
            }
            break;
        case "ifElse":
            if (EvaluateCondition(block.data.condition)) {
                block.data.thenBlocks.forEach(id =>{
                    const childBlock = blocksInWorkSpace.find(b => b.id === id);
                    if (childBlock) ExecuteBlock(childBlock);
                });
            }
            else {
                block.data.elseBlocks.forEach(id =>{
                    const childBlock = blocksInWorkSpace.find(b => b.id === id);
                    if (childBlock) ExecuteBlock(childBlock);
                });
            }
            break;
        case "while":
            while (EvaluateCondition(block.data.condition)){
                block.data.bodyBlocks.forEach(id =>{
                    const childBlock = blocksInWorkSpace.find(b => b.id === id);
                    if (childBlock) ExecuteBlock(childBlock);
                });
            }
            break;
        case "print": {
            const value = GetVariable(block.data.variable);
            LogToOutputPanel(String(value));
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
        const currentBlock = blocksInWorkSpace.find(b => b.id === currentBlockId);
        if (!currentBlock) return;

        ExecuteBlock(currentBlock);
        currentBlockId = currentBlock.child;
    }
}