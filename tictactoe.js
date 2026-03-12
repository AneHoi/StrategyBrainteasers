document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const turnIndicator = document.getElementById('turn-indicator');
    const restartBtn = document.getElementById('restart-btn');
    const scoreXElement = document.getElementById('score-x');
    const scoreOElement = document.getElementById('score-o');
    const playerXCard = document.querySelector('.score-card.player-x');
    const playerOCard = document.querySelector('.score-card.player-o');

    let currentPlayer = 'X';
    let gameState = Array(9).fill('');
    let gameActive = true;
    let scores = { X: 0, O: 0 };
    let piecesPlaced = { X: 0, O: 0 };

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // Initialize board
    function initBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        }
    }

    function handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));

        if (gameState[index] !== '' || !gameActive) {
            return;
        }

        gameState[index] = currentPlayer;
        piecesPlaced[currentPlayer]++;
        
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase(), 'occupied');

        checkWin();
    }

    function checkWin() {
        let roundWon = false;
        let winningCells = [];

        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                roundWon = true;
                winningCells = [a, b, c];
                break;
            }
        }

        if (roundWon) {
            handleWin(winningCells);
            return;
        }

        if (!gameState.includes('')) {
            handleDraw();
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurnIndicator();
    }

    function handleWin(winningCells) {
        gameActive = false;
        turnIndicator.textContent = `Player ${currentPlayer} Wins!`;
        turnIndicator.style.color = currentPlayer === 'X' ? 'var(--accent-x)' : 'var(--accent-o)';
        
        scores[currentPlayer]++;
        updateScores();

        // Highlight winning cells
        const cells = document.querySelectorAll('.cell');
        winningCells.forEach(index => {
            cells[index].classList.add('win-highlight');
        });
    }

    function handleDraw() {
        gameActive = false;
        turnIndicator.textContent = "It's a Draw!";
        turnIndicator.style.color = 'var(--text-primary)';
    }

    function updateTurnIndicator() {
        turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
        turnIndicator.style.color = currentPlayer === 'X' ? 'var(--accent-x)' : 'var(--accent-o)';
        
        if (currentPlayer === 'X') {
            playerXCard.classList.add('active');
            playerOCard.classList.remove('active');
        } else {
            playerOCard.classList.add('active');
            playerXCard.classList.remove('active');
        }
    }

    function updateScores() {
        scoreXElement.textContent = scores.X;
        scoreOElement.textContent = scores.O;
    }

    function restartGame() {
        currentPlayer = 'X';
        gameState = Array(9).fill('');
        piecesPlaced = { X: 0, O: 0 };
        gameActive = true;
        
        turnIndicator.style.color = 'var(--accent-x)';
        updateTurnIndicator();
        
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell'; // Reset classes
        });
    }

    restartBtn.addEventListener('click', restartGame);

    // Start UI
    initBoard();
    updateTurnIndicator();
});
