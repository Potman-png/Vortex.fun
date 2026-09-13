const rows = 10;
const cols = 10;
const mineCount = 15;

let board = [];
let revealed = [];
let flagged = [];
let gameOver = false;
let gameWon = false;

const boardElement = document.getElementById('gameBoard');
const statusElement = document.getElementById('status');
const resetButton = document.getElementById('resetBtn');

function updateStatus(message) {
    if (statusElement) {
        statusElement.textContent = message;
    }
}

function initGame() {
    board = createBoard();
    revealed = Array.from({ length: rows }, () => Array(cols).fill(false));
    flagged = Array.from({ length: rows }, () => Array(cols).fill(false));
    gameOver = false;
    gameWon = false;

    renderBoard();
    updateStatus('Start a game by clicking a tile.');
}

function createBoard() {
    const newBoard = Array.from({ length: rows }, () => Array(cols).fill(0));

    let placedMines = 0;

    while (placedMines < mineCount) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);

        if (newBoard[r][c] !== 'mine') {
            newBoard[r][c] = 'mine';
            placedMines++;
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (newBoard[r][c] === 'mine') {
                continue;
            }

            newBoard[r][c] = countAdjacentMines(newBoard, r, c);
        }
    }

    return newBoard;
}

function countAdjacentMines(boardArray, row, col) {
    let count = 0;

    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < rows && c >= 0 && c < cols) {
                if (boardArray[r][c] === 'mine') {
                    count++;
                }
            }
        }
    }

    return count;
}

function renderBoard() {
    if (!boardElement) {
        return;
    }

    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 40px)`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('button');
            cell.className = 'cell';
            cell.dataset.row = String(r);
            cell.dataset.col = String(c);

            cell.addEventListener('click', () => {
                revealCell(r, c);
            });

            cell.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                toggleFlag(r, c);
            });

            updateCellDisplay(cell, r, c);
            boardElement.appendChild(cell);
        }
    }
}

function updateCellDisplay(cell, row, col) {
    cell.classList.remove('revealed', 'mine', 'flagged');
    cell.textContent = '';
    cell.disabled = false;

    if (flagged[row][col]) {
        cell.textContent = '🚩';
        cell.classList.add('flagged');
        cell.disabled = true;
        return;
    }

    if (!revealed[row][col]) {
        return;
    }

    cell.classList.add('revealed');
    cell.disabled = true;

    if (board[row][col] === 'mine') {
        cell.textContent = '💣';
        cell.classList.add('mine');
        return;
    }

    if (board[row][col] > 0) {
        cell.textContent = String(board[row][col]);
        cell.style.color = getNumberColor(board[row][col]);
    }
}

function getNumberColor(value) {
    const colors = {
        1: '#1f4fd4',
        2: '#1f8f3d',
        3: '#d13a3a',
        4: '#2b1b7a',
        5: '#7d1d1d',
        6: '#1f7a7a',
        7: '#222',
        8: '#666'
    };

    return colors[value] || '#222';
}

function toggleFlag(row, col) {
    if (gameOver || gameWon || revealed[row][col]) {
        return;
    }

    flagged[row][col] = !flagged[row][col];
    updateStatus(flagged[row][col] ? 'Tile flagged.' : 'Flag removed.');
    renderBoard();
}

function revealCell(row, col) {
    if (gameOver || gameWon || revealed[row][col] || flagged[row][col]) {
        return;
    }

    revealed[row][col] = true;

    if (board[row][col] === 'mine') {
        gameOver = true;
        revealAllMines();
        updateStatus('Boom! You hit a mine.');
        renderBoard();
        return;
    }

    if (board[row][col] === 0) {
        floodReveal(row, col);
    }

    if (checkWin()) {
        gameWon = true;
        revealAllMines();
        updateStatus('You cleared the board!');
    } else {
        updateStatus('Keep going!');
    }

    renderBoard();
}

function floodReveal(startRow, startCol) {
    const queue = [[startRow, startCol]];

    while (queue.length > 0) {
        const [row, col] = queue.shift();

        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r < 0 || r >= rows || c < 0 || c >= cols) {
                    continue;
                }

                if (revealed[r][c] || flagged[r][c]) {
                    continue;
                }

                revealed[r][c] = true;

                if (board[r][c] === 0) {
                    queue.push([r, c]);
                }
            }
        }
    }
}

function revealAllMines() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === 'mine') {
                revealed[r][c] = true;
            }
        }
    }
}

function checkWin() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] !== 'mine' && !revealed[r][c]) {
                return false;
            }
        }
    }

    return true;
}

if (resetButton) {
    resetButton.addEventListener('click', initGame);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

