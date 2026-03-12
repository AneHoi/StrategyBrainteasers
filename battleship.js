const SHIPS = [
    { id: 'carrier', name: 'Carrier', length: 5 },
    { id: 'battleship', name: 'Battleship', length: 4 },
    { id: 'cruiser', name: 'Cruiser', length: 3 },
    { id: 'submarine', name: 'Submarine', length: 3 },
    { id: 'destroyer', name: 'Destroyer', length: 2 },
];

let playerGrid = [];
let computerGrid = [];
let isHorizontal = true;
let selectedShip = null;
let placedShipsCount = 0;
let playerShips = [];
let computerShips = [];

let gameState = 'SETUP'; // SETUP, PLAYER_TURN, COMPUTER_TURN, GAME_OVER

// Initialize Grids
function initGrids() {
    const primaryGridEl = document.getElementById('primary-grid');
    const targetGridEl = document.getElementById('target-grid');
    
    primaryGridEl.innerHTML = '';
    targetGridEl.innerHTML = '';
    playerGrid = Array(10).fill(null).map(() => Array(10).fill(null));
    computerGrid = Array(10).fill(null).map(() => Array(10).fill(null));

    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            // Player grid cell
            const pCell = document.createElement('div');
            pCell.className = 'cell';
            pCell.dataset.row = row;
            pCell.dataset.col = col;
            pCell.addEventListener('mouseenter', handleCellHovering);
            pCell.addEventListener('mouseleave', handleCellLeave);
            pCell.addEventListener('click', handleCellClick);
            primaryGridEl.appendChild(pCell);

            // Target grid cell (Computer)
            const tCell = document.createElement('div');
            tCell.className = 'cell';
            tCell.dataset.row = row;
            tCell.dataset.col = col;
            tCell.addEventListener('click', handleTargetClick);
            targetGridEl.appendChild(tCell);
        }
    }
}

// Render Fleet Selection
function renderFleetSelection() {
    const fleetContainer = document.getElementById('fleet-container');
    fleetContainer.innerHTML = '';
    
    SHIPS.forEach(ship => {
        const shipEl = document.createElement('div');
        shipEl.className = 'ship-item';
        shipEl.id = `ship-ui-${ship.id}`;
        shipEl.dataset.id = ship.id;
        
        const nameEl = document.createElement('span');
        nameEl.textContent = `${ship.name} (${ship.length})`;
        
        const blocksEl = document.createElement('div');
        blocksEl.className = 'ship-blocks';
        for (let i = 0; i < ship.length; i++) {
            const block = document.createElement('div');
            block.className = 'ship-block';
            blocksEl.appendChild(block);
        }
        
        shipEl.appendChild(nameEl);
        shipEl.appendChild(blocksEl);
        
        shipEl.addEventListener('click', () => {
            if (shipEl.classList.contains('placed')) return;
            document.querySelectorAll('.ship-item').forEach(el => el.classList.remove('selected'));
            shipEl.classList.add('selected');
            selectedShip = ship;
            document.getElementById('setup-instructions').textContent = `Placing ${ship.name} (Length: ${ship.length}). Use rotation button to change direction.`;
        });
        
        fleetContainer.appendChild(shipEl);
    });
}

document.getElementById('rotate-btn').addEventListener('click', () => {
    isHorizontal = !isHorizontal;
    document.getElementById('rotate-btn').textContent = `Rotate Ship (${isHorizontal ? 'Horizontal' : 'Vertical'})`;
    
    // Trigger leave to clear invalid hover states
    handleCellLeave();
});

function handleCellHovering(e) {
    if (gameState !== 'SETUP' || !selectedShip) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    const isValid = checkPlacementValid(playerGrid, row, col, selectedShip.length, isHorizontal);
    
    for (let i = 0; i < selectedShip.length; i++) {
        let r = isHorizontal ? row : row + i;
        let c = isHorizontal ? col + i : col;
        if (r < 10 && c < 10) {
            const cell = document.querySelector(`#primary-grid .cell[data-row="${r}"][data-col="${c}"]`);
            if (cell) cell.classList.add(isValid ? 'hover-valid' : 'hover-invalid');
        }
    }
}

function handleCellLeave(e) {
    if (gameState !== 'SETUP') return;
    document.querySelectorAll('#primary-grid .cell').forEach(cell => {
        cell.classList.remove('hover-valid');
        cell.classList.remove('hover-invalid');
    });
}

function checkPlacementValid(grid, row, col, length, horizontal) {
    if (horizontal) {
        if (col + length > 10) return false;
        for (let i = 0; i < length; i++) {
            if (grid[row][col + i] !== null) return false;
        }
    } else {
        if (row + length > 10) return false;
        for (let i = 0; i < length; i++) {
            if (grid[row + i][col] !== null) return false;
        }
    }
    return true;
}

function handleCellClick(e) {
    if (gameState !== 'SETUP' || !selectedShip) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    if (checkPlacementValid(playerGrid, row, col, selectedShip.length, isHorizontal)) {
        // Place ship
        const shipData = { id: selectedShip.id, name: selectedShip.name, coords: [], hits: 0 };
        for (let i = 0; i < selectedShip.length; i++) {
            let r = isHorizontal ? row : row + i;
            let c = isHorizontal ? col + i : col;
            playerGrid[r][c] = selectedShip.id;
            shipData.coords.push({ r, c });
            const cell = document.querySelector(`#primary-grid .cell[data-row="${r}"][data-col="${c}"]`);
            cell.classList.add('ship');
        }
        playerShips.push(shipData);
        
        document.getElementById(`ship-ui-${selectedShip.id}`).classList.add('placed');
        document.getElementById(`ship-ui-${selectedShip.id}`).classList.remove('selected');
        selectedShip = null;
        placedShipsCount++;
        handleCellLeave();
        
        if (placedShipsCount === SHIPS.length) {
            document.getElementById('start-btn').disabled = false;
            document.getElementById('setup-instructions').textContent = "All ships placed. Ready to initiate battle!";
            document.getElementById('start-btn').classList.add('cta-btn');
        } else {
            document.getElementById('setup-instructions').textContent = "Select next ship to place.";
        }
    }
}

// Computer Placement
function placeComputerShips() {
    computerShips = [];
    SHIPS.forEach(ship => {
        let placed = false;
        while (!placed) {
            const horizontal = Math.random() > 0.5;
            const r = Math.floor(Math.random() * 10);
            const c = Math.floor(Math.random() * 10);
            
            if (checkPlacementValid(computerGrid, r, c, ship.length, horizontal)) {
                const shipData = { id: ship.id, name: ship.name, coords: [], hits: 0 };
                for (let i = 0; i < ship.length; i++) {
                    let cr = horizontal ? r : r + i;
                    let cc = horizontal ? c + i : c;
                    computerGrid[cr][cc] = ship.id;
                    shipData.coords.push({ r: cr, c: cc });
                }
                computerShips.push(shipData);
                placed = true;
            }
        }
    });
}

document.getElementById('start-btn').addEventListener('click', () => {
    placeComputerShips();
    gameState = 'PLAYER_TURN';
    document.getElementById('setup-panel').classList.add('hidden');
    document.getElementById('battle-panel').classList.remove('hidden');
    document.getElementById('target-grid').classList.add('active');
    updateStatusDisplay();
});

// Battle Logic
function handleTargetClick(e) {
    if (gameState !== 'PLAYER_TURN') return;
    const cell = e.target;
    if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Play shot
    processShot(row, col, computerGrid, computerShips, 'target-grid');
    
    if (checkWin(computerShips)) {
        endGame('VICTORY - ENEMY FLEET DESTROYED');
    } else {
        gameState = 'COMPUTER_TURN';
        document.getElementById('target-grid').classList.remove('active');
        document.getElementById('turn-indicator').textContent = 'Enemy Turn... Detecting incomings...';
        document.getElementById('turn-indicator').style.color = 'var(--accent-red)';
        
        // Delay for computer turn
        setTimeout(computerTurn, 1200);
    }
}

function processShot(row, col, grid, ships, gridElementId) {
    const cellId = grid[row][col];
    const cellElement = document.querySelector(`#${gridElementId} .cell[data-row="${row}"][data-col="${col}"]`);
    
    if (cellId !== null) {
        // Hit
        cellElement.classList.add('hit');
        const ship = ships.find(s => s.id === cellId);
        ship.hits++;
        
        let sunkMessage = '';
        if (ship.hits === ship.coords.length) {
            // Sunk
            ship.coords.forEach(coord => {
                const c = document.querySelector(`#${gridElementId} .cell[data-row="${coord.r}"][data-col="${coord.c}"]`);
                c.classList.add('sunk');
            });
            sunkMessage = ` (Sunk ${ship.name}!)`;
            updateStatusDisplay();
        }
        
        return true; 
    } else {
        // Miss
        cellElement.classList.add('miss');
        return false; 
    }
}

// Computer AI variables tracking algorithm
let aiState = {
    huntHits: [],         // Queue of hits we are actively tracking
    mode: 'HUNT',         // HUNT or TARGET
    currentDirection: null, // Attempted direction (0=Up, 1=Right, 2=Down, 3=Left)
    firstHit: null        // First successful hit in the cluster
};

function computerTurn() {
    if (gameState !== 'COMPUTER_TURN') return;
    
    let targetR, targetC;
    
    const validShot = (row, col) => {
        if (row < 0 || row > 9 || col < 0 || col > 9) return false;
        const cell = document.querySelector(`#primary-grid .cell[data-row="${row}"][data-col="${col}"]`);
        return !cell.classList.contains('hit') && !cell.classList.contains('miss');
    };

    let foundTarget = false;

    // AI logic: HUNT vs TARGET
    if (aiState.mode === 'TARGET' && aiState.huntHits.length > 0) {
        // We have active hits to investigate
        let attempts = 0;
        
        while (!foundTarget && attempts < 20) {
            const lastHit = aiState.huntHits[aiState.huntHits.length - 1]; // most recent hot spot
            
            // Generate adjacent possibilities
            const adjacent = [
                { r: lastHit.r - 1, c: lastHit.c, dir: 0 }, // Up
                { r: lastHit.r, c: lastHit.c + 1, dir: 1 }, // Right
                { r: lastHit.r + 1, c: lastHit.c, dir: 2 }, // Down
                { r: lastHit.r, c: lastHit.c - 1, dir: 3 }  // Left
            ];
            
            let possible = adjacent.filter(adj => validShot(adj.r, adj.c));
            
            if (possible.length > 0) {
                // Pick one randomly
                const pick = possible[Math.floor(Math.random() * possible.length)];
                targetR = pick.r;
                targetC = pick.c;
                foundTarget = true;
            } else {
                // Stuck at the end of a line, backtrack to the first hit or previous hit
                if (aiState.huntHits.length > 1) {
                    // Remove last hit since it's a dead end
                    aiState.huntHits.pop();
                } else {
                    // Fallback to mode Hunt if completely stuck
                    aiState.mode = 'HUNT';
                    aiState.huntHits = [];
                    break;
                }
            }
            attempts++;
        }
    }
    
    if (aiState.mode === 'HUNT' || !foundTarget) {
        // Checkered pattern for hunting
        let attempts = 0;
        while (!foundTarget && attempts < 100) {
            targetR = Math.floor(Math.random() * 10);
            targetC = Math.floor(Math.random() * 10);
            
            // Prefer checkered pattern to maximize ship findings
            if ((targetR + targetC) % 2 === 0 && validShot(targetR, targetC)) {
                foundTarget = true;
            }
            attempts++;
        }
        
        // Fallback if checkered spots are exhausting
        while (!foundTarget) {
            targetR = Math.floor(Math.random() * 10);
            targetC = Math.floor(Math.random() * 10);
            if (validShot(targetR, targetC)) foundTarget = true;
        }
    }

    const isHit = processShot(targetR, targetC, playerGrid, playerShips, 'primary-grid');
    
    if (isHit) {
        aiState.huntHits.push({ r: targetR, c: targetC });
        aiState.mode = 'TARGET';
        
        // Did we sink a ship?
        const shipId = playerGrid[targetR][targetC];
        const ship = playerShips.find(s => s.id === shipId);
        
        if (ship.hits === ship.coords.length) {
            // Sunk! Clear tracking for this specific ship's coordinates
            ship.coords.forEach(c => {
                aiState.huntHits = aiState.huntHits.filter(h => !(h.r === c.r && h.c === c.c));
            });
            
            // If we have remaining hits we tracked earlier (adjacent ships?), switch to target, else hunt
            aiState.mode = aiState.huntHits.length > 0 ? 'TARGET' : 'HUNT';
        }
    } else {
        // If we missed while targeting, we don't want to keep going in that direction on next turn
        // the while loop in TARGET mode will naturally try another branch from huntHits next time.
    }

    if (checkWin(playerShips)) {
        endGame('DEFEAT - YOUR FLEET WAS DESTROYED');
    } else {
        gameState = 'PLAYER_TURN';
        document.getElementById('target-grid').classList.add('active');
        document.getElementById('turn-indicator').textContent = 'Your Turn. Awaiting Orders.';
        document.getElementById('turn-indicator').style.color = '';
    }
}

function checkWin(ships) {
    return ships.every(s => s.hits === s.coords.length);
}

function updateStatusDisplay() {
    const playerActive = playerShips.filter(s => s.hits < s.coords.length).length;
    const computerActive = computerShips.filter(s => s.hits < s.coords.length).length;
    
    document.getElementById('player-fleet-status').textContent = `${playerActive} / 5 Operational`;
    document.getElementById('enemy-fleet-status').textContent = `${computerActive} / 5 Operational`;
}

function endGame(message) {
    gameState = 'GAME_OVER';
    document.getElementById('turn-indicator').textContent = message;
    document.getElementById('turn-indicator').style.color = message.includes('VICTORY') ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('restart-btn').classList.remove('hidden');
    document.getElementById('target-grid').classList.remove('active');
}

document.getElementById('restart-btn').addEventListener('click', () => {
    // Reset Everything
    placedShipsCount = 0;
    playerShips = [];
    computerShips = [];
    selectedShip = null;
    isHorizontal = true;
    aiState = { huntHits: [], mode: 'HUNT' };
    
    document.getElementById('setup-panel').classList.remove('hidden');
    document.getElementById('battle-panel').classList.add('hidden');
    document.getElementById('restart-btn').classList.add('hidden');
    document.getElementById('start-btn').disabled = true;
    document.getElementById('start-btn').classList.remove('cta-btn');
    document.getElementById('turn-indicator').style.color = '';
    
    document.querySelectorAll('.ship-item').forEach(el => {
        el.classList.remove('placed', 'selected');
    });
    document.getElementById('setup-instructions').textContent = "Select a ship to place on your grid.";
    
    initGrids();
    renderFleetSelection();
    gameState = 'SETUP';
});

// Start
initGrids();
renderFleetSelection();
