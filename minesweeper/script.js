let cellSize = 12; // px

const mediaQuerySmall = window.matchMedia('(min-width: 576px)')
const mediaQueryMedium = window.matchMedia('(min-width: 768px)')
const mediaQueryLarge = window.matchMedia('(min-width: 992px)')
const mediaQueryXLarge = window.matchMedia('(min-width: 1200px)')
const mediaQueryXXLarge = window.matchMedia('(min-width: 1400px)')
mediaQueries();

let strokeSize = cellSize / 8; // px

const colors = {
    silver: '#c0c0c0',
    white: '#fff',
    gray: '#808080',
}

const cellStatus = {
    mine: 'mine',
    empty: 'mt',
    number: 'num',
}

const game = {
	canvas: document.getElementById('canvas'),
    ctx: null,
    canvasUndo: document.getElementById('undo'),
    ctxUndo: null,
    canvasNewGame: document.getElementById('new-game'),
    ctxNewGame: null,
    canvasRestart: document.getElementById('restart'),
    ctxRestart: null,
    canvasReveal: document.getElementById('reveal'),
    ctxReveal: null,
    canvasGameType: document.getElementById('game-type'),
    ctxGameType: null,
    inputWidth: document.getElementById('inputWidth'),
    inputHeight: document.getElementById('inputHeight'),
    inputMines: document.getElementById('inputMines'),
    wonMessage: document.getElementById('won'),
    loseMessage: document.getElementById('lose'),
    heading: document.getElementById('heading'),
	cells: [],
    memory: [],
    opened: [],
	init() {
        this.ctx = this.canvas.getContext('2d');
        this.ctxUndo = this.canvasUndo.getContext('2d');
        this.ctxNewGame = this.canvasNewGame.getContext('2d');
        this.ctxRestart = this.canvasRestart.getContext('2d');
        this.ctxReveal = this.canvasReveal.getContext('2d');
        this.ctxGameType = this.canvasGameType.getContext('2d');

        //creating and initializing a 2d array with cells
        for (let i = 0; i < fieldWidth; i++) {
            game.cells[i] = [];
            for (let j = 0; j < fieldHeight; j++) {
                game.cells[i][j] = new Cell(i * cellSize + cellSize / 2 + strokeSize * 2,  j * cellSize + cellSize / 2 + strokeSize * 2, i, j);
            }
        }

        generateMines(Number(this.inputMines.value));
        drawField();
        //undo button
        drawButton(game.canvasUndo, game.ctxUndo, cellSize * 5 + 1, cellSize * 3, 'Undo');
        movingCanvas(game.canvasUndo, game.ctxUndo, cellSize * 5 + 1, cellSize * 3, 'Undo');
        buttonHit(game.canvasUndo, game.ctxUndo, undo, 'Undo');
        //new game button
        drawButton(game.canvasNewGame, game.ctxNewGame, cellSize * 8 + 1, cellSize * 3, 'New game');
        movingCanvas(game.canvasNewGame, game.ctxNewGame, cellSize * 8 + 1, cellSize * 3, 'New game');
        buttonHit(game.canvasNewGame, game.ctxNewGame, newGame, 'New game');
        //restart button
        drawButton(game.canvasRestart, game.ctxRestart, cellSize * 6 + 1, cellSize * 3, 'Restart');
        movingCanvas(game.canvasRestart, game.ctxRestart, cellSize * 6 + 1, cellSize * 3, 'Restart');
        buttonHit(game.canvasRestart, game.ctxRestart, restart, 'Restart');
        //reveal button
        drawButton(game.canvasReveal, game.ctxReveal, cellSize * 6 + 1, cellSize * 3, 'Reveal');
        movingCanvas(game.canvasReveal, game.ctxReveal, cellSize * 6 + 1, cellSize * 3, 'Reveal');
        buttonHit(game.canvasReveal, game.ctxReveal, revealField, 'Reveal');
        //game type button
        drawGameTypeButton();
        movingGameType(game.canvasGameType, game.ctxGameType, game.inputWidth, game.inputHeight, game.inputMines, cellSize * 2.5);

        drawInput(game.inputWidth, cellSize * 2.5, '#39373f');
        drawInput(game.inputHeight, cellSize * 5.5, '#39373f');
        drawInput(game.inputMines, cellSize * 8.5, '#39373f');
        for (let row of this.cells) {
            for (let cell of row) {
                if (cell.NearMines > 0) cell.status = cellStatus.number;
                else if (cell.status !== 'mine') cell.status = cellStatus.empty;
            }
        }
	},
	update() {
        game.inputWidth.style.left = parseInt(window.getComputedStyle(game.canvasGameType).left) + strokeSize + 'px';
        game.inputWidth.style.top = parseInt(window.getComputedStyle(game.canvasGameType).top) + 2.5 * cellSize + 'px';
        game.inputHeight.style.left = parseInt(window.getComputedStyle(game.canvasGameType).left) + strokeSize + 'px';    
        game.inputHeight.style.top = parseInt(window.getComputedStyle(game.canvasGameType).top) + 5.5 * cellSize + 'px';
        game.inputMines.style.left = parseInt(window.getComputedStyle(game.canvasGameType).left) + strokeSize + 'px';
        game.inputMines.style.top = parseInt(window.getComputedStyle(game.canvasGameType).top) + 8.5 * cellSize + 'px';
        //mediaQueries();
	},
};

let fieldWidth = Number(game.inputWidth.value); // cells
let fieldHeight = Number(game.inputHeight.value); //cells
let fieldMines = Number(this.inputMines.value);
game.canvas.setAttribute('width', fieldWidth * cellSize + cellSize + strokeSize * 4);
game.canvas.setAttribute('height', fieldHeight * cellSize + cellSize + strokeSize * 4);

class Cell {
    constructor(x, y, i, j) {
        this.status = null;
        this.nearMines = 0;
        this.coords = {x: x, y: y};
        this.isMarked = false;
        this.isOpened = false;
        this.ind = i;
        this.jnd = j;
    }
    get NearMines() {
        return this.nearMines;
    }
    set NearMines(value) {
        if (this.status !== 'mine') {
            this.nearMines = value;
        }
    }
    draw() {
        //bg
        game.ctx.fillStyle = colors.silver;
        game.ctx.fillRect(this.coords.x, this.coords.y, cellSize, cellSize);
        //white borders
        game.ctx.fillStyle = colors.white;
        game.ctx.fillRect(this.coords.x, this.coords.y, strokeSize, cellSize - strokeSize); // left
        game.ctx.fillRect(this.coords.x, this.coords.y, cellSize - strokeSize, strokeSize); // up
        //gray borders
        game.ctx.fillStyle = colors.gray;
        game.ctx.fillRect(this.coords.x + cellSize - strokeSize, this.coords.y + strokeSize, strokeSize, cellSize - (strokeSize * 2)); // right
        game.ctx.fillRect(this.coords.x + strokeSize, this.coords.y + cellSize - strokeSize, cellSize - strokeSize, strokeSize); // down
        //shadow
        game.ctx.fillStyle = colors.white;
        game.ctx.fillRect(this.coords.x + cellSize - strokeSize, this.coords.y, strokeSize / 2, strokeSize / 2);
        game.ctx.fillRect(this.coords.x, this.coords.y + cellSize - strokeSize, strokeSize / 2, strokeSize / 2);
        game.ctx.fillStyle = colors.gray;
        game.ctx.fillRect(this.coords.x + cellSize - (strokeSize / 2), this.coords.y + (strokeSize / 2), strokeSize / 2, strokeSize / 2);
        game.ctx.fillRect(this.coords.x + strokeSize / 2, this.coords.y + cellSize - strokeSize / 2, strokeSize / 2, strokeSize / 2);
    }
    open() {
        this.isOpened = true;
        game.memory.push([this, 1]);
        game.opened.push(this);
        //mine
        if (this.status === 'mine') {
            game.heading.style.display = 'none';
            game.loseMessage.style.display = 'block';
            //bg
            game.ctx.fillStyle = colors.silver;
            game.ctx.fillRect(this.coords.x, this.coords.y, cellSize, cellSize);
            //mine itself
           /*  game.ctx.fillStyle = '#000';
            game.ctx.fillRect(this.coords.x + cellSize / 4, this.coords.y + cellSize / 4, cellSize / 2, cellSize / 2); */
            game.ctx.beginPath();
            game.ctx.arc(this.coords.x + cellSize / 2, this.coords.y + cellSize / 2, cellSize / 3, 0, 2 * Math.PI, false);
            game.ctx.fillStyle = '#000';
            game.ctx.fill();
            //borders
            game.ctx.fillStyle = colors.gray;
            game.ctx.fillRect(this.coords.x, this.coords.y, strokeSize / 4, cellSize);
            game.ctx.fillRect(this.coords.x, this.coords.y, cellSize, strokeSize / 4);
            //removing event listener
            game.canvas.removeEventListener('click', clickHandler);
            game.canvas.removeEventListener('contextmenu', rightClickHandler);
        }
        //empty
        else if (this.status === 'mt') {
            //bg
            game.ctx.fillStyle = colors.silver;
            game.ctx.fillRect(this.coords.x, this.coords.y, cellSize, cellSize);
            //borders
            game.ctx.fillStyle = colors.gray;
            game.ctx.fillRect(this.coords.x, this.coords.y, strokeSize / 4, cellSize);
            game.ctx.fillRect(this.coords.x, this.coords.y, cellSize, strokeSize / 4);
        }
        //number
        else if (this.status === 'num') {
            //bg
            game.ctx.fillStyle = colors.silver;
            game.ctx.fillRect(this.coords.x, this.coords.y, cellSize, cellSize);
            //borders
            game.ctx.fillStyle = colors.gray;
            game.ctx.fillRect(this.coords.x, this.coords.y, strokeSize / 4, cellSize);
            game.ctx.fillRect(this.coords.x, this.coords.y, cellSize, strokeSize / 4);
            //numbers
            game.ctx.font = `bold ${cellSize / 2 + Math.sqrt(cellSize / 2)}px sans-serif`;
            game.ctx.textAlign = 'center';
            game.ctx.textBaseline = 'middle';
            function drawNumber(color, number, cell) {
                game.ctx.fillStyle = color;
                game.ctx.fillText(number, cell.coords.x + cellSize / 2, cell.coords.y + cellSize / 2 + 1);
            }
            switch (this.NearMines) {
                case 1: 
                    drawNumber('#00f', '1', this);
                    break;
                case 2:
                    drawNumber('#008000', '2', this);
                    break;
                case 3:
                    drawNumber('#f00', '3', this);
                    break;
                case 4:
                    drawNumber('#2b2b8e', '4', this);
                    break;
                case 5:
                    drawNumber('#903131', '5', this);
                    break;
                case 6:
                    drawNumber('#007a7a', '6', this);
                    break;
                case 7:
                    drawNumber('#080a09', '7', this);
                    break;
                case 8:
                    drawNumber('#7b7b7b', '8', this);
                    break;
                default:
                    console.log('This number does not exist');
            }
        }
    }
    markMine() {
        this.isMarked = true;
        game.ctx.fillStyle = '#f00';
        game.ctx.fillRect(this.coords.x + cellSize / 4, this.coords.y + cellSize / 4, cellSize / 2, cellSize / 2);
    }
}

function drawInput(input, offsety, color) {
    input.style.width = parseInt(window.getComputedStyle(game.canvasGameType).width) - strokeSize * 2 + 'px';
    input.style.height = cellSize + 'px';
    input.style.left = parseInt(window.getComputedStyle(game.canvasGameType).left) + strokeSize + 'px';
    input.style.top = parseInt(window.getComputedStyle(game.canvasGameType).top) + offsety + 'px';
    input.style.color = color;
    input.style.fontSize = cellSize + 'px';
    input.style.fontFamily = 'tahoma';
    input.style.border = `2px solid #cdcdcd`;
    input.style.borderRadius = `5px`;
    //input.style.textAlign = right;
}

function drawField() {
    game.ctx.fillStyle = colors.silver;
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    outerBorder(game.canvas, game.ctx, 0, 0);
    innerBorder(game.canvas, game.ctx, cellSize / 2 + strokeSize, cellSize / 2 + strokeSize);
    //drawing every cell
    for (let row of game.cells) {
        for (let cell of row) {
            cell.draw();
        }
    }
}

function drawGameTypeButton() {
    game.canvasGameType.setAttribute('width', cellSize * 8 + 1);
    game.canvasGameType.setAttribute('height', cellSize * 10);
    game.ctxGameType.fillStyle = colors.silver;
    game.ctxGameType.fillRect(0, 0, game.canvasGameType.width, game.canvasGameType.height);
    outerBorder(game.canvasGameType, game.ctxGameType, 0, 0);
    game.ctxGameType.fillStyle = '#fff';
    game.ctxGameType.font = `${cellSize}px arial`;
    game.ctxGameType.textAlign = 'center';
    game.ctxGameType.textBaseline = 'middle';
    game.ctxGameType.fillText('Width', game.canvasGameType.width / 2, cellSize * 2);
    game.ctxGameType.fillText('Height', game.canvasGameType.width / 2, cellSize * 5);
    game.ctxGameType.fillText('Mines', game.canvasGameType.width / 2, cellSize * 8);
    drawMovingPanel(game.canvasGameType, game.ctxGameType);
}

function drawButton(canvas, ctx, width, height, str) {
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    ctx.fillStyle = colors.silver;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    outerBorder(canvas, ctx, 0, 0);
    innerBorder(canvas, ctx, cellSize / 2 + strokeSize, cellSize / 2 + strokeSize);
    outerBorder(canvas, ctx, cellSize / 2 + strokeSize * 2, cellSize / 2 + strokeSize * 2);
    ctx.fillStyle = colors.white;
    ctx.font = `${cellSize + cellSize / 10}px arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, canvas.width / 2, canvas.height / 2 + 1 );
    drawMovingPanel(canvas, ctx);
    //movingCanvas(canvas, ctx, width, height, str);
}

function drawMovingPanel(canvas, ctx) {
    ctx.fillStyle = colors.gray;
    let amount = (canvas.width - strokeSize * 4) / strokeSize;
    for (let i = 0; i < amount; i++) {
        drawMovingItem(ctx, i);
    }
}

function drawMovingItem(ctx, offsetx) { 
    ctx.fillRect(strokeSize * 2 + offsetx * strokeSize, strokeSize * 2, strokeSize / 2, cellSize / 4);
}

function outerBorder(canvas, ctx, x0, y0) {
    ctx.fillStyle = colors.white;
    //left
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, canvas.height - y0);
    ctx.lineTo(strokeSize + x0, canvas.height - strokeSize - y0);
    ctx.lineTo(strokeSize + x0, strokeSize + y0);
    ctx.fill();
    ctx.closePath();
    //up
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(canvas.width - x0, y0);
    ctx.lineTo(canvas.width - strokeSize - x0, strokeSize + y0);
    ctx.lineTo(strokeSize + x0, strokeSize + y0);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = colors.gray;
    //right
    ctx.beginPath();
    ctx.moveTo(canvas.width - x0, y0);
    ctx.lineTo(canvas.width - x0, canvas.height - y0);
    ctx.lineTo(canvas.width - strokeSize - x0, canvas.height - strokeSize - y0);
    ctx.lineTo(canvas.width - strokeSize - x0, strokeSize + y0);
    ctx.fill();
    ctx.closePath();
    //down
    ctx.beginPath();
    ctx.moveTo(canvas.width - x0, canvas.height - y0);
    ctx.lineTo(x0, canvas.height - y0);
    ctx.lineTo(strokeSize + x0, canvas.height - strokeSize - y0);
    ctx.lineTo(canvas.width - strokeSize - x0, canvas.height - strokeSize - y0);
    ctx.fill();
    ctx.closePath();
}

function innerBorder(canvas, ctx, x0, y0) {
    ctx.fillStyle = colors.gray;
    //left
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, canvas.height - y0);
    ctx.lineTo(strokeSize + x0, canvas.height - strokeSize - y0);
    ctx.lineTo(strokeSize + x0, strokeSize + y0);
    ctx.fill();
    ctx.closePath();
    //up
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(canvas.width - x0, y0);
    ctx.lineTo(canvas.width - strokeSize - x0, strokeSize + y0);
    ctx.lineTo(strokeSize + x0, strokeSize + y0);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = colors.white;
    //right
    ctx.beginPath();
    ctx.moveTo(canvas.width - x0, y0);
    ctx.lineTo(canvas.width - x0, canvas.height - y0);
    ctx.lineTo(canvas.width - strokeSize - x0, canvas.height - strokeSize - y0);
    ctx.lineTo(canvas.width - strokeSize - x0, strokeSize + y0);
    ctx.fill();
    ctx.closePath();
    //down
    ctx.beginPath();
    ctx.moveTo(canvas.width - x0, canvas.height - y0);
    ctx.lineTo(x0, canvas.height - y0);
    ctx.lineTo(strokeSize + x0, canvas.height - strokeSize - y0);
    ctx.lineTo(canvas.width - strokeSize - x0, canvas.height - strokeSize - y0);
    ctx.fill();
    ctx.closePath();
}

function generateMines(mines) {
    let cur = 0;
    let i, j;
    while (cur !== mines) {
        i = Math.floor(Math.random() * (fieldWidth - 1));
        j = Math.floor(Math.random() * (fieldHeight - 1));
        if (game.cells[i][j].status !== 'mine') {
            game.cells[i][j].status = cellStatus.mine;
            cur++;
        }
        else {
            do {
                i = Math.floor(Math.random() * (fieldWidth - 1));
                j = Math.floor(Math.random() * (fieldHeight - 1));
            }
            while (game.cells[i][j].status === 'mine');
            game.cells[i][j].status = cellStatus.mine;
            cur++;
        }
    }
    for (let i = 0; i < fieldWidth; i++) {
        for (let j = 0; j < fieldHeight; j++) {
            if (game.cells[i][j].status === 'mine') {
                for (let [di, dj] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
                    const nextI = i + di;
                    const nextJ = j + dj;
                    if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].status !== 'mine') {
                        game.cells[nextI][nextJ].NearMines++;
                    }
                }
            }
        }
    }
}

function revealField() {
    game.canvas.removeEventListener('click', clickHandler);
    game.canvas.removeEventListener('contextmenu', rightClickHandler);
    for (let row of game.cells) {
        for (let cell of row) {
            if (cell.isOpened === false) {
                cell.isOpened = true;
                game.memory.push([cell, 1]);
                if (cell.status !== 'mine') {
                    cell.open();
                }
                else {
                    cell.markMine();
                    game.memory.push([cell, 2]);
                }             
            }
        }
    }
}

function depthFirstSearch(i, j) {
    game.cells[i][j].open();
    if (game.cells[i][j].status !== 'mine') {
        for (let [di, dj] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
            const nextI = i + di;
            const nextJ = j + dj;
            if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].isOpened === false && game.cells[nextI][nextJ].isMarked === false && game.cells[nextI][nextJ].status === 'mt') {
                depthFirstSearch(nextI, nextJ);
            }
            else if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].isOpened === false && game.cells[nextI][nextJ].isMarked === false && game.cells[nextI][nextJ].status === 'num' && game.cells[i][j].status !== 'num') {
                game.cells[nextI][nextJ].open();
            }
        }
    }
}

function withinField(i, j) {
    return 0 <= i && i < fieldWidth && 0 <= j && j < fieldHeight;
}

function solvingAlgorithm() {
/*     let moveIsExist = true;
    while (moveIsExist) {
        let moveIsExist = false;
        for (let cell of game.opened) {
            if (cell.status === 'num') {
                let unrevealedCells = 0;
                for (let [di, dj] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
                    const nextI = cell.ind + di;
                    const nextJ = cell.jnd + dj;
                    if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].isOpened === false) {
                        unrevealedCells++;
                    }
                }
                if (unrevealedCells === cell.NearMines) {
                    moveIsExist = true;
                    for (let [di, dj] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
                        const nextI = cell.ind + di;
                        const nextJ = cell.jnd + dj;
                        if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].isOpened === false) {
                            game.cells[nextI][nextJ].markMine();
                        }
                    }
                }
            }
        }
        for (let cell of game.opened) {
            if (cell.status === 'num') {
                let markedCells = 0;
                for (let [di, dj] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
                    const nextI = cell.ind + di;
                    const nextJ = cell.jnd + dj;
                    if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].isOpened === false && game.cells[nextI][nextJ].isMarked === true) {
                        markedCells++;
                    }
                }
                if (markedCells === cell.NearMines) {
                    moveIsExist = true;
                    for (let [di, dj] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
                        const nextI = cell.ind + di;
                        const nextJ = cell.jnd + dj;
                        if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].isOpened === false && game.cells[nextI][nextJ].isMarked === false) {
                            depthFirstSearch(nextI, nextJ);
                        }
                    }
                }
            }
        }
    }
    console.log('Yeah!');
    return; */
    let moveIsExist = false;
    for (let cell of game.opened) {
        if (cell.status === 'num') {
            let unrevealedCells = 0;
            for (let [di, dj] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
                const nextI = cell.ind + di;
                const nextJ = cell.jnd + dj;
                if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].isOpened === false) {
                    unrevealedCells++;
                }
            }
            if (unrevealedCells === cell.NearMines) {
                moveIsExist = true;
                for (let [di, dj] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
                    const nextI = cell.ind + di;
                    const nextJ = cell.jnd + dj;
                    if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].isOpened === false) {
                        game.cells[nextI][nextJ].markMine();
                    }
                }
            }
        }
    }
    for (let cell of game.opened) {
        if (cell.status === 'num') {
            let markedCells = 0;
            for (let [di, dj] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
                const nextI = cell.ind + di;
                const nextJ = cell.jnd + dj;
                if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].isOpened === false && game.cells[nextI][nextJ].isMarked === true) {
                    markedCells++;
                }
            }
            if (markedCells === cell.NearMines) {
                moveIsExist = true;
                for (let [di, dj] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
                    const nextI = cell.ind + di;
                    const nextJ = cell.jnd + dj;
                    if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].isOpened === false && game.cells[nextI][nextJ].isMarked === false) {
                        depthFirstSearch(nextI, nextJ);
                    }
                }
            }
        }
    }
    return moveIsExist;
}

//open a cell
let isFirst = false; ///
game.canvas.addEventListener('click', clickHandler);
function clickHandler(e) {
    if (isFirst) {
        isFirst = false;
        let ind = 0, jnd = 0;
        top:
        for (let i = 0; i < fieldWidth; i++) {
            for (let j = 0; j < fieldHeight; j++) {
                if (!game.cells[i][j].isOpened && game.cells[i][j].isMarked === false && ((e.offsetX >= game.cells[i][j].coords.x && e.offsetX <= (game.cells[i][j].coords.x + cellSize)) && 
                    (e.offsetY >= game.cells[i][j].coords.y && e.offsetY <= (game.cells[i][j].coords.y + cellSize)))) {
                    game.memory = [];
                    //depthFirstSearch(i, j);
                    ind = i;
                    jnd = j;
                    break top;
                }
            }
        }
        function generateLogicalField(i, j) {
            depthFirstSearch(i, j);
/*             let i = 0;
            let intervalID = setInterval(() => {
                solvingAlgorithm();
                if (i++ === 20) clearInterval(intervalID);
            }, 0); */
            while (solvingAlgorithm()) solvingAlgorithm();
            // if (!isWon()) {
            //     newGame();   
            //     generateLogicalField();
            // }
        }
        console.log(isWon());
        while (!isWon()) {
            newGame();
            generateLogicalField(ind, jnd);
        }
        //generateLogicalField();
/*         for (let row of game.cells) {
            for (let cell of row) {
                if (cell.isOpened) {
                    cell.isOpened = false;
                    cell.draw();
                }
            }
        } */
    }
    else {
        top:
        for (let i = 0; i < fieldWidth; i++) {
            for (let j = 0; j < fieldHeight; j++) {
                if (!game.cells[i][j].isOpened && game.cells[i][j].isMarked === false && ((e.offsetX >= game.cells[i][j].coords.x && e.offsetX <= (game.cells[i][j].coords.x + cellSize)) && 
                (e.offsetY >= game.cells[i][j].coords.y && e.offsetY <= (game.cells[i][j].coords.y + cellSize)))) {
                    game.memory = [];
                    depthFirstSearch(i, j);
                    break top;
                }
/*                 else if (game.cells[i][j].isOpened && ((e.offsetX >= game.cells[i][j].coords.x && e.offsetX <= (game.cells[i][j].coords.x + cellSize)) && 
                (e.offsetY >= game.cells[i][j].coords.y && e.offsetY <= (game.cells[i][j].coords.y + cellSize)))) {
                    for (let [di, dj] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
                        const nextI = i + di;
                        const nextJ = j + dj;
                        if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].isOpened === false && game.cells[nextI][nextJ].isMarked === false && game.cells[nextI][nextJ].status === 'mt') {
                            game.cells[i][j].open();
                        }
                        else if (withinField(nextI, nextJ) && game.cells[nextI][nextJ].isOpened === false && game.cells[nextI][nextJ].isMarked === false && game.cells[nextI][nextJ].status === 'num' && game.cells[i][j].status !== 'num') {
                            game.cells[nextI][nextJ].open();
                        }
                    }
                } */
            }
        }
    }
}

//mark cell as a mine
game.canvas.addEventListener('contextmenu', rightClickHandler);
function rightClickHandler(e) {
    e.preventDefault();
    top:
    for (let row of game.cells) {
        for (let cell of row) {
            if (cell.isOpened === false && (e.offsetX >= cell.coords.x && e.offsetX <= (cell.coords.x + cellSize)) && 
            (e.offsetY >= cell.coords.y && e.offsetY <= (cell.coords.y + cellSize))) {
                if (cell.isMarked === false) {
                    game.memory = [];
                    cell.markMine();
                    game.memory.push([cell, 2]);
                    break top;
                }
                else {
                    game.memory = [];
                    cell.isMarked = false;
                    game.ctx.fillStyle = colors.silver;
                    game.ctx.fillRect(cell.coords.x + cellSize / 4, cell.coords.y + cellSize / 4, cellSize / 2, cellSize / 2);
                    game.memory.push([cell, 2]);
                    break top;
                }
            }
        }
    }
}

//moving canvasGameType - separate cuz it requires different algorithm (more difficult (cuz of inputs))
function movingGameType(canvas, ctx, input1, input2, input3, offsety) {
    let x = 0, y = 0, isDragging = false;
    canvas.addEventListener('mousedown', e => {
        if (isHit(e, canvas)) {
            x = e.offsetX;
            y = e.offsetY;
            isDragging = true;
        }
    });
    document.addEventListener('mousemove', e => {
        if (isDragging) {
            canvas.style.left = e.clientX - x + 'px';
            canvas.style.top = e.clientY - y + 'px';
            input1.style.left = parseInt(window.getComputedStyle(game.canvasGameType).left) + strokeSize + 'px';
            input1.style.top = parseInt(window.getComputedStyle(game.canvasGameType).top) + offsety + 'px';
            input2.style.left = parseInt(window.getComputedStyle(game.canvasGameType).left) + strokeSize + 'px';    
            input2.style.top = parseInt(window.getComputedStyle(game.canvasGameType).top) + offsety + 3*cellSize + 'px';
            input3.style.left = parseInt(window.getComputedStyle(game.canvasGameType).left) + strokeSize + 'px';
            input3.style.top = parseInt(window.getComputedStyle(game.canvasGameType).top) + offsety + 6*cellSize + 'px';
        }
    });
    document.addEventListener('mouseup', e => {
        isDragging = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGameTypeButton();
    });
}

//moving the canvases
function movingCanvas(canvas, ctx, width, height, str) {
    let x = 0, y = 0, isDragging = false;
    canvas.addEventListener('mousedown', e => {
        if (isHit(e, canvas)) {
            x = e.offsetX;
            y = e.offsetY;
            isDragging = true;
        }
    });
    document.addEventListener('mousemove', e => {
        if (isDragging) {
            canvas.style.left = e.clientX - x + 'px';
            canvas.style.top = e.clientY - y + 'px';
        }
    });
    document.addEventListener('mouseup', e => {
        isDragging = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawButton(canvas, ctx, width, height, str);
    });
}

function isHit(e, canvas) {
    if (e.offsetX >= 0 && e.offsetX <= canvas.width && e.offsetY >= 0 && e.offsetY <= cellSize / 2 + strokeSize) return true;
}

//undo
document.addEventListener('keydown', undoHandler);
function undoHandler(e) {   
    if ((e.key === 'z' || e.key === 'я') && e.ctrlKey === true) {
        if (game.canvas.getAttribute('listener') !== 'true') {
            game.canvas.addEventListener('click', clickHandler);
            game.canvas.addEventListener('contextmenu', rightClickHandler);
        }
        undo();
    }
    if (e.key === 'p' || e.key === 'з') {
        solvingAlgorithm();
    }
}
function undo() {
    game.heading.style.display = 'block';
    game.wonMessage.style.display = 'none';
    game.loseMessage.style.display = 'none';
    for (let step of game.memory) {
        if (step[1] === 1) {
                step[0].draw();
                step[0].isOpened = false;
        }
        else if (step[1] === 2) {
            if (step[0].isMarked === false) {
                step[0].markMine();
                step[0].isMarked = true;
            }
            else {
                game.ctx.fillStyle = colors.silver;
                game.ctx.fillRect(step[0].coords.x + cellSize / 4, step[0].coords.y + cellSize / 4, cellSize / 2, cellSize / 2);
                step[0].isMarked = false;
            }
        }
        game.memory = [];
    }
}

//new game
function newGame() {
    game.heading.style.display = 'block';
    game.wonMessage.style.display = 'none';
    game.loseMessage.style.display = 'none';
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    if (Number(game.inputWidth.value) <= 50) fieldWidth = Number(game.inputWidth.value); // cells
    else {
        fieldWidth = 22;
        game.inputWidth.value = 22;
    }
    if (Number(game.inputHeight.value) <= 50) fieldHeight = Number(game.inputHeight.value); // cells
    else {
        fieldHeight = 22;
        game.inputHeight.value = 22;
    }
    game.canvas.setAttribute('width', fieldWidth * cellSize + cellSize + strokeSize * 4);
    game.canvas.setAttribute('height', fieldHeight * cellSize + cellSize + strokeSize * 4);
    game.memory = [];
    game.cells = [];
    for (let i = 0; i < fieldWidth; i++) {
        game.cells[i] = [];
        for (let j = 0; j < fieldHeight; j++) {
            game.cells[i][j] = new Cell(i * cellSize + cellSize / 2 + strokeSize * 2,  j * cellSize + cellSize / 2 + strokeSize * 2, i, j);
        }
    }
    if (Number(this.inputMines.value) < fieldWidth * fieldHeight - 30) fieldMines = Number(this.inputMines.value)
    else {
        fieldMines = 1;
        game.inputMines.value = 1;
    }
    generateMines(fieldMines);
    for (let row of game.cells) {
        for (let cell of row) {
            if (cell.NearMines > 0) cell.status = cellStatus.number;
            else if (cell.status !== 'mine') cell.status = cellStatus.empty;
        }
    }
    drawField();
}

//restart game
function restart() {
    game.heading.style.display = 'block';
    game.wonMessage.style.display = 'none';
    game.loseMessage.style.display = 'none';
    fieldWidth = Number(game.inputWidth.value); // cells
    fieldHeight = Number(game.inputHeight.value); //cells
    game.memory = [];
    for (let row of game.cells) {
        for (let cell of row) {
            if (cell.isOpened) {
                cell.draw(); 
                cell.isOpened = false;
            }
            else if (cell.isMarked) {
                cell.draw();
                cell.isMarked = false;
            }
        }
    }
}

function buttonHit(canvas, ctx, action, str) {
    canvas.addEventListener('mousedown', e => {
        if (isHitButton(e, canvas)) {
            if (game.canvas.getAttribute('listener') !== 'true') {
                game.canvas.addEventListener('click', clickHandler);
                game.canvas.addEventListener('contextmenu', rightClickHandler);
            }
            action();
            ctx.fillStyle = colors.silver;
            ctx.fillRect(cellSize / 2 + strokeSize * 2, cellSize / 2 + strokeSize * 2, canvas.width - cellSize - strokeSize * 4, canvas.height - cellSize - strokeSize * 4);

            ctx.fillStyle = colors.gray;
            ctx.font = `${cellSize + cellSize / 10}px arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(str, canvas.width / 2, canvas.height / 2 + 1);
        }
    });
}
function isHitButton(e, canvas) {
    if ((e.offsetX >= cellSize / 2 + strokeSize * 2 && e.offsetX <= canvas.width - cellSize / 2 - strokeSize * 2) && (e.offsetY >= cellSize / 2 + strokeSize * 2 && e.offsetY <= canvas.height - cellSize / 2 - strokeSize * 2)) return true;
}

function isWon() {
    for (let row of game.cells) {
        for (let cell of row) {
            if (cell.status === 'mine' && cell.isOpened) return false;
            else if (!cell.isOpened) {
                if (!cell.isMarked) {
                    return false;
                }
                else if (cell.status !== 'mine') return false;
            }
        }
    }
    return true;
}

function mediaQueries() {
    if (mediaQuerySmall.matches) {
        cellSize = 16;
    }
    if (mediaQueryMedium.matches) {
        cellSize = 20;
    }                                  5
    if (mediaQueryLarge.matches) {
        cellSize = 24;
    }
    if (mediaQueryXLarge.matches) {
        cellSize = 28;
    }   
    if (mediaQueryXXLarge.matches) {
        cellSize = 32;
    }
}

game.init();
setInterval(() => { 
    game.update();
    if (isWon()) {
        game.heading.style.display = 'none';
        game.wonMessage.style.display = 'block';
    }
}, 100);

