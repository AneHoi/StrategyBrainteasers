import express from 'express';
import path from 'path';
import crypto from 'crypto';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const PORT = 3000;

// Store games. In memory is fine for this single-player game.
const games: Record<string, string[]> = {};
const COLORS = ['red', 'blue', 'yellow', 'green', 'white', 'black'];

app.post('/api/start', (req, res) => {
    const gameId = crypto.randomUUID();
    // According to rules: "The Codemaker can use any combination of the 6 colors he chooses. He can also use 2 or more Code Pegs of the same color if he wishes."
    const secretCode = Array.from({ length: 4 }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
    games[gameId] = secretCode;
    console.log(`New Game Started: ${gameId}`); 
    // Uncomment for debugging: console.log(`Code: ${secretCode}`);
    res.json({ gameId });
});

app.post('/api/guess', (req, res) => {
    const { gameId, guess } = req.body;
    if (!games[gameId]) {
        return res.status(404).json({ error: 'Game not found' });
    }
    if (!Array.isArray(guess) || guess.length !== 4) {
        return res.status(400).json({ error: 'Invalid guess' });
    }

    const secretCode = games[gameId];
    let exactMatches = 0; // Black pegs
    let colorMatches = 0; // White pegs

    const secretCodeCopy = [...secretCode] as (string | null)[];
    const guessCopy = [...guess] as (string | null)[];

    // First pass: exact matches (black key peg)
    for (let i = 0; i < 4; i++) {
        if (guessCopy[i] === secretCodeCopy[i]) {
            exactMatches++;
            secretCodeCopy[i] = null;
            guessCopy[i] = null;
        }
    }

    // Second pass: color matches (white key peg) in wrong position
    for (let i = 0; i < 4; i++) {
        if (guessCopy[i] !== null) {
            const index = secretCodeCopy.indexOf(guessCopy[i]);
            if (index !== -1) {
                colorMatches++;
                secretCodeCopy[index] = null;
            }
        }
    }

    res.json({ exactMatches, colorMatches });
});

app.listen(PORT, () => {
    console.log(`Mastermind backend running on http://localhost:${PORT}/mastermind.html`);
});
