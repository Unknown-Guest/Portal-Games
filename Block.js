const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const gridSize = 9;
const cellSize = 50;

let board = [];
let score = 0;

const scoreDisplay = document.getElementById("score");
const piecesContainer = document.getElementById("pieces");

// Drag state
let dragging = false;
let dragPiece = null;
let mouseX = 0;
let mouseY = 0;

// Shapes (1 = block, 0 = empty)
const shapes = [
    [[1]],
    [[1, 1]],
    [[1], [1]],
    [[1, 1, 1]],
    [[1], [1], [1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
];

// Colors
const colors = ["#ff9800", "#00aaff", "#39ff14", "#ff3b3b", "#ff00ff"];

// Initialize empty board
function resetBoard() {
    board = Array.from({ length: gridSize }, () =>
        Array(gridSize).fill(0)
    );
}

// Draw board and drag preview
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Board cells
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (board[y][x] !== 0) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * cellSize, y * cellSize, cellSize - 2, cellSize - 2);
            } else {
                ctx.fillStyle = "#222";
                ctx.fillRect(x * cellSize, y * cellSize, cellSize - 2, cellSize - 2);
            }
        }
    }

    // Drag preview
    if (dragging && dragPiece) {
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = dragPiece.color;

        const shape = dragPiece.shape;
        const gx = Math.floor(mouseX / cellSize);
        const gy = Math.floor(mouseY / cellSize);

        for (let sy = 0; sy < shape.length; sy++) {
            for (let sx = 0; sx < shape[sy].length; sx++) {
                if (shape[sy][sx]) {
                    const px = (gx + sx) * cellSize;
                    const py = (gy + sy) * cellSize;
                    ctx.fillRect(px, py, cellSize - 2, cellSize - 2);
                }
            }
        }

        ctx.globalAlpha = 1;
    }
}

// Generate 3 new pieces
function generatePieces() {
    piecesContainer.innerHTML = "";

    for (let i = 0; i < 3; i++) {
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const pieceDiv = document.createElement("div");
        pieceDiv.className = "piece";
        pieceDiv.dataset.color = color;
        pieceDiv.dataset.shape = JSON.stringify(shape);

        shape.forEach(row => {
            const rowDiv = document.createElement("div");
            row.forEach(cell => {
                if (cell) {
                    const block = document.createElement("div");
                    block.className = "block";
                    block.style.background = color;
                    rowDiv.appendChild(block);
                } else {
                    const spacer = document.createElement("div");
                    spacer.style.width = "20px";
                    spacer.style.height = "20px";
                    spacer.style.margin = "2px";
                    rowDiv.appendChild(spacer);
                }
            });
            pieceDiv.appendChild(rowDiv);
        });

        // Optional label to show shape size
        const label = document.createElement("div");
        label.style.textAlign = "center";
        label.style.marginTop = "5px";
        label.style.fontSize = "12px";
        label.style.opacity = "0.8";
        label.textContent = `${shape.length}×${shape[0].length}`;
        pieceDiv.appendChild(label);

        pieceDiv.addEventListener("mousedown", () => selectPiece(pieceDiv));

        piecesContainer.appendChild(pieceDiv);
    }
}

function selectPiece(pieceDiv) {
    const shape = JSON.parse(pieceDiv.dataset.shape);
    const color = pieceDiv.dataset.color;

    dragPiece = {
        shape,
        color,
        element: pieceDiv
    };

    dragging = true;
    pieceDiv.style.opacity = "0.3";
}

// Mouse tracking on canvas
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// Drop piece on mouseup
canvas.addEventListener("mouseup", () => {
    if (!dragging || !dragPiece) return;

    const x = Math.floor(mouseX / cellSize);
    const y = Math.floor(mouseY / cellSize);

    if (canPlace(dragPiece.shape, x, y)) {
        placePiece(dragPiece.shape, x, y, dragPiece.color);
        dragPiece.element.remove();
    } else {
        dragPiece.element.style.opacity = "1";
    }

    dragging = false;
    dragPiece = null;

    if (piecesContainer.children.length === 0) {
        generatePieces();
    }

    if (isGameOver()) {
        alert("Game Over!");
        startGame();
    }
});

// Check if piece fits
function canPlace(shape, x, y) {
    for (let sy = 0; sy < shape.length; sy++) {
        for (let sx = 0; sx < shape[sy].length; sx++) {
            if (shape[sy][sx]) {
                const bx = x + sx;
                const by = y + sy;

                if (bx < 0 || by < 0 || bx >= gridSize || by >= gridSize) return false;
                if (board[by][bx] !== 0) return false;
            }
        }
    }
    return true;
}

// Place piece
function placePiece(shape, x, y, color) {
    let placedBlocks = 0;

    for (let sy = 0; sy < shape.length; sy++) {
        for (let sx = 0; sx < shape[sy].length; sx++) {
            if (shape[sy][sx]) {
                board[y + sy][x + sx] = color;
                placedBlocks++;
            }
        }
    }

    score += placedBlocks;
    scoreDisplay.textContent = score;
    drawBoard();
    clearLines();
}

// Clear full rows/columns
function clearLines() {
    let cleared = 0;

    // Rows
    for (let y = 0; y < gridSize; y++) {
        if (board[y].every(cell => cell !== 0)) {
            board[y].fill(0);
            cleared++;
        }
    }

    // Columns
    for (let x = 0; x < gridSize; x++) {
        let full = true;
        for (let y = 0; y < gridSize; y++) {
            if (board[y][x] === 0) {
                full = false;
                break;
            }
        }
        if (full) {
            for (let y = 0; y < gridSize; y++) {
                board[y][x] = 0;
            }
            cleared++;
        }
    }

    if (cleared > 0) {
        score += cleared * 10;
        scoreDisplay.textContent = score;
        drawBoard();
    }
}

// Check if no moves left
function isGameOver() {
    const pieces = [...piecesContainer.children];

    for (const piece of pieces) {
        const shape = JSON.parse(piece.dataset.shape);

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (canPlace(shape, x, y)) return false;
            }
        }
    }
    return true;
}

// Game loop (for drag preview)
function loop() {
    drawBoard();
    requestAnimationFrame(loop);
}

// Start game
function startGame() {
    score = 0;
    scoreDisplay.textContent = score;
    resetBoard();
    drawBoard();
    generatePieces();
}

document.getElementById("restart").onclick = startGame;

startGame();
loop();
