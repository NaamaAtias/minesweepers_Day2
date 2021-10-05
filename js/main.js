'use strict'

var MINE_IMG = '<img style="height:25px; width:25px;" src="img/mine.svg"></img>';
var FLAG = '🎯';
var LIFE = '🤍'

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
    renderBoard(gBoard, '.board');
    resetGame();
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

function addMines(cellId) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var idxI = getRandomInt(0, gLevel.SIZE);
        var idxJ = getRandomInt(0, gLevel.SIZE);
        console.log(cellId);
        console.log(idxI, idxJ);
        if (cellId.i !== idxI && cellId.j !== idxJ && !gBoard[idxI][idxJ].isMine && !gBoard[idxI][idxJ].isShown) {
            gBoard[idxI][idxJ].isMine = true;
        } else {
            i--;
        }
    }
}



function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            countMinesNegs({ i: i, j: j });
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
        lives += LIFE;
        elLives.innerText = lives;
    }
}

function cellClicked(elCell) {

    console.log(gGame.isOn);

    var cellId = getCellIdx(elCell.id);
    var currCell = gBoard[cellId.i][cellId.j];

    if (gGame.shownCount === 0 && !gGame.isOn) {
        setTimer();
        gGame.isOn = true;
        console.log('timer on')
        addMines(cellId);
        init();

    } else if (!gGame.isOn) {
        console.log('game off')
        return;
    }

    if (currCell.isMarked || currCell.isShown) return;

    gGame.shownCount++;
    currCell.isShown = true;
    elCell.style.backgroundColor = 'gray';

    if (elCell.classList.contains('mine')) {
        elCell.innerHTML = MINE_IMG;

        if (gGame.lives > 0) {
            gGame.lives--;
            renderLives();
            console.log(gGame.lives);
            return;
        }
        else gameOver(cellId);   
    }

    if (elCell.classList.contains('neg')) {
        elCell.innerHTML = currCell.minesAroundCount;
    }

    if (elCell.classList.contains('noNeg')) {
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
            if (currCell.isMarked) continue;
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
    if ((gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES)) && (gGame.markedCount === gLevel.MINES)) {
        console.log('you won!');
        alert('you won!')
        gGame.lives = 3;
    clearInterval(gIntervalId);
    gGame.isOn = false;
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
    gGame.lives = 3;
    clearInterval(gIntervalId);
    gGame.isOn = false;

}

function resetGame() {
    gGame.isOn = false;
    document.querySelector('.timer').innerText = '00:00';
    gGame.shownCount = 0;
    gGame.markedCount = 0;
}