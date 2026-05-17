const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Bird
let bird = {
    x: 80,
    y: 250,
    width: 30,
    height: 30,
    velocity: 0
};

const gravity = 0.4;
const jumpStrength = -7;

// Pipes
let pipes = [];
let pipeGap = 150;
let pipeWidth = 60;
let pipeSpeed = 2;

// Score
let score = 0;

// Spawn pipes every 90 frames
let frame = 0;

// Controls
document.addEventListener("keydown", () => {
    bird.velocity = jumpStrength;
});
document.addEventListener("mousedown", () => {
    bird.velocity = jumpStrength;
});

// Create a new pipe
function spawnPipe() {
    const topHeight = Math.random() * 300 + 50;
    const bottomY = topHeight + pipeGap;

    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: bottomY
    });
}

// Collision detection
function isColliding(bird, pipe) {
    const inPipeX = bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth;

    const hitTop = bird.y < pipe.topHeight;
    const hitBottom = bird.y + bird.height > pipe.bottomY;

    return inPipeX && (hitTop || hitBottom);
}

// Game loop
function update() {
    frame++;

    // Bird physics
    bird.velocity += gravity;
    bird.y += bird.velocity;

    // Spawn pipes
    if (frame % 90 === 0) {
        spawnPipe();
    }

    // Move pipes
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
    });

    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

    // Collision check
    for (let pipe of pipes) {
        if (isColliding(bird, pipe)) {
            resetGame();
        }

        // Score when passing pipe
        if (pipe.x + pipeWidth === bird.x) {
            score++;
            document.getElementById("score").textContent = score;
        }
    }

    // Ground or ceiling collision
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        resetGame();
    }

    draw();
    requestAnimationFrame(update);
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bird
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Pipes
    ctx.fillStyle = "green";
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
    });
}

// Reset game
function resetGame() {
    bird.y = 250;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    document.getElementById("score").textContent = score;
    frame = 0;
}

// Fullscreen
document.getElementById("fullscreen-btn").onclick = () => {
    const wrapper = document.getElementById("game-wrapper");
    if (!document.fullscreenElement) wrapper.requestFullscreen();
    else document.exitFullscreen();
};

update();
