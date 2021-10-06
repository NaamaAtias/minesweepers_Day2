'use strict'

var MINE_IMG = '<img style="height:25px; width:25px;" src="img/mine.svg"></img>';
var FLAG = '🎯';
var LIFE = '🤍';
var LOSE = '😭';
var WIN = '😎';
var CAREFULL = '😫';
var SMILE = '😃';

var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    lives: 3
}

var gBoard = buildBoard();
var gIntervalId;
var gSmileyTimeout;

//init
function init() {
    setMinesNegsCount(gBoard);
    renderBoard(gBoard, '.board');
}

//functions

function chooseLevel(size) {
    gLevel.SIZE = size;
    switch (size) {
        case 4: gLevel.MINES = 2;
            break;
        case 8: gLevel.MINES = 12;
            break;
        case 12: gLevel.MINES = 30;
            break;
    }

    gBoard = buildBoard();
    resetGame();
    renderBoard(gBoard, '.board');

}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            };
        }
    }
    console.log(board);
    return board;
}

function addMine() {
    var idxI = getRandomInt(0, gLevel.SIZE);
    var idxJ = getRandomInt(0, gLevel.SIZE);
    if (!gBoard[idxI][idxJ].isMine) gBoard[idxI][idxJ].isMine = true;
    else addMine();
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (!gBoard[i][j].isMine) {
                countMinesNegs({ i: i, j: j });
            }
        }
    }
}

function countMinesNegs(idx) {
    for (var i = idx.i - 1; i <= idx.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = idx.j - 1; j <= idx.j + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === idx.i && j === idx.j) continue;
            if (gBoard[i][j].isMine) {
                gBoard[idx.i][idx.j].minesAroundCount++;
            }
        }
    }
}

function renderBoard(mat, selector) {
    var strHTML = '<table border="1"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var tdId = 'cell-' + i + '-' + j
            if (cell.isMine) {
                var className = ' mine';
            } else if (cell.minesAroundCount === 0) {
                var className = ' noNeg';
            } else var className = ' neg';
            strHTML += '<td oncontextmenu="cellMarked(this)" onclick="cellClicked(this)" class="cell' + className + '" id="' + tdId + '"> </td>';
        }
        strHTML += '</tr>'
    }

    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
    console.log(strHTML);

    renderLives();
}

function renderLives() {
    var lives = '';
    var elLives = document.querySelector('.lives');
    for (var i = 0; i < gGame.lives; i++) {
        console.log(gGame.lives);
        lives += LIFE;
    }
    elLives.innerText = lives;
}

function cellClicked(elCell) {

    console.log(gGame.isOn);

    var cellId = getCellIdx(elCell.id);
    var currCell = gBoard[cellId.i][cellId.j];

    if (gGame.shownCount === 0 && !gGame.isOn) {
        setTimer();
        gGame.isOn = true;
        for (var i = 0; i < gLevel.MINES; i++) {
            addMine();
            if (currCell.isMine) {
                currCell.isMine = false;
                i--;
                continue;
            }
        }
        init();

    } else if (!gGame.isOn) {
        console.log('game off')
        return;
    }

    if (currCell.isMarked || currCell.isShown) return;

    elCell.style.backgroundColor = 'gray';

    if (elCell.classList.contains('mine')) {
        elCell.innerHTML = MINE_IMG;
        gGame.shownCount++;
        currCell.isShown = true;

        if (gGame.lives > 0) {
            if (gGame.lives === 1) {
                gameOver(cellId);
                gGame.lives--;
                renderLives();
                return;
            }
            document.querySelector('.smiley').innerText = CAREFULL;
            setTimeout(function () {
                document.querySelector('.smiley').innerText = SMILE;
            }, 1000);
            gGame.lives--;
            renderLives();
        }

    } else if (elCell.classList.contains('neg')) {
        elCell.innerHTML = currCell.minesAroundCount;
        gGame.shownCount++;
        currCell.isShown = true;

    } else if (elCell.classList.contains('noNeg')) {
        elCell.innerHTML = '';
        expandShown(gBoard, cellId);
    }

    checkGameOver();
}

function expandShown(board, idx) {
    for (var i = idx.i - 1; i <= idx.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = idx.j - 1; j <= idx.j + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            var currCell = board[i][j];
            var elCurrCell = document.getElementById('cell-' + i + '-' + j);
            if (currCell.isMarked || currCell.isMine || currCell.isShown) continue;
            gGame.shownCount++;
            currCell.isShown = true;
            elCurrCell.style.backgroundColor = 'gray';
            if (currCell.minesAroundCount === 0) {
                elCurrCell.innerHTML = '';
            } else if (currCell.minesAroundCount > 0) {
                elCurrCell.innerHTML = currCell.minesAroundCount;
            }
        }
    }
}

function cellMarked(elCell) {
    if (!gIntervalId) {
        setTimer();
        gGame.isOn = true;
    }
    if (!gGame.isOn) return;
    var cellIdx = getCellIdx(elCell.id);
    var currCell = gBoard[cellIdx.i][cellIdx.j];
    if (!currCell.isShown) {
        if (!currCell.isMarked) {
            elCell.innerHTML = FLAG;
            currCell.isMarked = true;
            gGame.markedCount++;
        } else {
            elCell.innerHTML = '';
            currCell.isMarked = false;
            gGame.markedCount--;
        }
    }
    checkGameOver();
}

function setTimer(startTime) {
    var elTimer = document.querySelector('.timer');
    var startTime = Date.now();
    gIntervalId = setInterval(function () {
        elTimer.innerText = getTime(startTime);
    }, 1000);
}

function checkGameOver() {
    if (gGame.shownCount === gLevel.SIZE ** 2) {
        document.querySelector('.smiley').innerText = LOSE;
        clearInterval(gIntervalId);
    }
    var markedMines = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && gBoard[i][j].isMarked) markedMines++;
        }
    }
    if ((gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES)) && (markedMines === gLevel.MINES)) {
        clearInterval(gIntervalId);
        gGame.isOn = false;
        document.querySelector('.smiley').innerText = WIN;
    }
}

function gameOver(cellId) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            var elCurrCell = document.getElementById('cell-' + i + '-' + j);
            if (cellId.i === i && cellId.j === j) elCurrCell.style.backgroundColor = 'red';
            else if (currCell.isMine) {
                currCell.isShown = true;
                elCurrCell.innerHTML = MINE_IMG;
                elCurrCell.style.backgroundColor = 'gray';
            }
        }
    }
    clearInterval(gIntervalId);
    gGame.isOn = false;
    document.querySelector('.smiley').innerText = LOSE;
}

function resetGame() {
    document.querySelector('.smiley').innerText = SMILE;
    clearInterval(gIntervalId);
    document.querySelector('.timer').innerText = '00:00';
    gGame.isOn = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.lives = 3;

}

function startOver() {
    document.querySelector('.smiley').innerText = SMILE;
    chooseLevel(gLevel.SIZE);
}
