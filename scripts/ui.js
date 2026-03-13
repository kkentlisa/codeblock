function blockButtonClick(){
    const buttons = document.querySelectorAll('.blockPanelButton');

    buttons.forEach(function(button){
        button.addEventListener('click', function(){

            const type = button.dataset.type;

            const {x, y} = getRandomPositionInWorkspace();

            const newBlock = createBlock(type, x, y);

            const blockElement = renderBlock(newBlock);

            workspace.appendChild(blockElement);
        })
    });

}

function getRandomPositionInWorkspace(){
    const workspace = document.querySelector('.workSpace');
    const rect = workspace.getBoundingClientRect();
    const padding = 20;

    let maxY = padding;
    blocksInWorkSpace.forEach((block) => {
        if (block.position.y > maxY) {
            maxY = block.position.y;
        }
    });

    const x = padding + Math.random()*(rect.width - 2 * padding - 100);
    const y = maxY + 70;

    return {x, y};

}

function resetButtonClick(){
    const resetButton = document.querySelector('.workSpaceButton[data-type="delete"]');
    resetButton.addEventListener("click", function(){
        resetAllBlocks();
        renderAllBlocks(blocksInWorkSpace);
    });
}

function runButtonClick(){
    const runButton = document.querySelector('.workSpaceButton[data-type="run"]');
    runButton.addEventListener("click", runProgram);
}


window.addEventListener('load', function() {
    loadBlocksFromStorage();
    renderAllBlocks(blocksInWorkSpace);
    blockButtonClick();
    resetButtonClick();
    runButtonClick();
})

function logToOutputPanel(message){
    const outputPanel = document.querySelector('.outputPanel');

    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    outputPanel.appendChild(messageElement);
}

function clearOutputPanel(){
    const outputPanel = document.querySelector('.outputPanel');
    outputPanel.innerHTML = '<h3>Консоль вывода</h3>';

}

function highlightErrorBlock(blockId){
    const container = document.querySelector(`[data-id="${blockId}"]`);
    if (!container) return;

    const block = container.querySelector('.block');
    if (block){
        block.classList.add('block-error');
    }
    else{
        container.classList.add('block-error');
    }
}