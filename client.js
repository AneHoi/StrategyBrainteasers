const COLORS = ['red', 'blue', 'yellow', 'green', 'white', 'black'];
let selectedColor = null;
let currentGuess = [];
let currentRow = 0;
let gameId = null;

async function startGame() {
    try {
        const res = await fetch('/api/start', { method: 'POST' });
        const data = await res.json();
        gameId = data.gameId;

        currentRow = 0;
        currentGuess = [];
        selectedColor = COLORS[0];
        updatePickerUI();

        renderBoard();
        document.getElementById('status').innerText = 'Game started! Select a color to place pegs.';
    } catch (err) {
        document.getElementById('status').innerText = 'Failed to connect to backend server.';
        console.error(err);
    }
}

function selectColor(color) {
    selectedColor = color;
    updatePickerUI();
}

function updatePickerUI() {
    document.querySelectorAll('.picker-peg').forEach(peg => {
        peg.classList.remove('selected');
        if (peg.dataset.color === selectedColor) {
            peg.classList.add('selected');
        }
    });
}

function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    // Rows go from 9 to 0 (top to bottom on screen, conventionally row 9 at top)
    for (let r = 9; r >= 0; r--) {
        const rowDiv = document.createElement('div');
        rowDiv.className = `row ${r === currentRow ? 'active' : ''}`;
        rowDiv.id = `row-${r}`;

        const holesDiv = document.createElement('div');
        holesDiv.className = 'holes';

        for (let i = 0; i < 4; i++) {
            const hole = document.createElement('div');
            hole.className = 'hole';
            hole.id = `hole-${r}-${i}`;
            hole.onclick = () => placePeg(r, i);
            holesDiv.appendChild(hole);
        }

        const submitBtn = document.createElement('button');
        submitBtn.className = 'check-btn';
        submitBtn.innerText = 'CHECK';
        submitBtn.onclick = submitGuess;
        submitBtn.id = `btn-${r}`;

        const keysDiv = document.createElement('div');
        keysDiv.className = 'key-pegs';
        keysDiv.id = `keys-${r}`;
        for (let i = 0; i < 4; i++) {
            const keyHole = document.createElement('div');
            keyHole.className = 'key-hole';
            keysDiv.appendChild(keyHole);
        }

        rowDiv.appendChild(holesDiv);
        rowDiv.appendChild(submitBtn);
        rowDiv.appendChild(keysDiv);

        board.appendChild(rowDiv);
    }
}

function placePeg(r, i) {
    if (r !== currentRow) return; // Only active row can be played
    if (!selectedColor) return;

    currentGuess[i] = selectedColor;
    const hole = document.getElementById(`hole-${r}-${i}`);

    // Remove existing color classes
    COLORS.forEach(c => hole.classList.remove(`bg-${c}`));
    hole.classList.add(`bg-${selectedColor}`);
    hole.classList.add('filled');
}

async function submitGuess() {
    // Check if full guess
    if (currentGuess.filter(Boolean).length !== 4) {
        alert("Please fill all 4 holes to make a guess!");
        return;
    }

    try {
        const res = await fetch('/api/guess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId, guess: currentGuess })
        });

        const { exactMatches, colorMatches, error } = await res.json();

        if (error) {
            alert(error);
            return;
        }

        // Fill key pegs: black for exact match, white for color match
        const keysDiv = document.getElementById(`keys-${currentRow}`);
        const keyHoles = keysDiv.querySelectorAll('.key-hole');

        let pegIndex = 0;
        // Exact matches (Black Pegs) take precedence
        for (let i = 0; i < exactMatches; i++) {
            keyHoles[pegIndex++].classList.add('key-black');
        }
        // Then color matches (White Pegs)
        for (let i = 0; i < colorMatches; i++) {
            keyHoles[pegIndex++].classList.add('key-white');
        }

        if (exactMatches === 4) {
            document.getElementById('status').innerText = '🎉 You broke the code! YOU WIN! 🎉';
            document.getElementById(`row-${currentRow}`).classList.remove('active');
            return;
        }

        if (currentRow === 9) {
            document.getElementById('status').innerText = 'Game Over! You failed to break the code. Please refresh to try again.';
            document.getElementById(`row-${currentRow}`).classList.remove('active');
            return;
        }

        // Advance to next row
        document.getElementById(`row-${currentRow}`).classList.remove('active');
        currentRow++;
        currentGuess = [];
        document.getElementById(`row-${currentRow}`).classList.add('active');
    } catch (err) {
        alert("Error connecting to game server.");
        console.error(err);
    }
}

function closeIntro() {
    document.getElementById('intro-modal').classList.add('hide');
}

window.onload = startGame;
