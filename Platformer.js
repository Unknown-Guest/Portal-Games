// Canvas setup
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Player object
const player = {
    x: 100,
    y: 0,
    width: 40,
    height: 50,
    xVel: 0,
    yVel: 0,
    speed: 4,
    jumping: false
};

// Enemy object (only one at a time)
let enemy = null;

// Score
let score = 0;

// Count how many enemies have spawned
let enemyCount = 0;

// Gravity
const gravity = 0.5;

// Platforms
const platforms = [
    { x: 0, y: 400, width: 800, height: 50 },
    { x: 200, y: 300, width: 150, height: 20 },
    { x: 450, y: 250, width: 200, height: 20 },
    { x: 100, y: 180, width: 120, height: 20 }
];

// Input tracking
const keys = { left: false, right: false, up: false };

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
    if (e.key === "ArrowUp" || e.key === "w") keys.up = true;
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
    if (e.key === "ArrowUp" || e.key === "w") keys.up = false;
});

// Collision detection
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Spawn a new enemy
function spawnEnemy() {
    enemyCount++;

    // 1% chance for purple enemy (you can adjust)
    const purpleChance = Math.random() < 0.01;

    // Every 10th enemy is blue unless purple overrides it
    const isBlue = !purpleChance && enemyCount % 10 === 0;

    enemy = {
        x: Math.random() * 700 + 50,
        y: 0,
        width: 40,
        height: 40,
        xVel: Math.random() < 0.5 ? -2 : 2,
        yVel: 0,

        // Enemy type logic
        color: purpleChance ? "#b300ff" : isBlue ? "#0095ff" : "#ff0000",
        hp: purpleChance ? 1 : isBlue ? 2 : 1,
        type: purpleChance ? "purple" : isBlue ? "blue" : "red"
    };
}

// Game loop
function update() {
    // Horizontal movement
    if (keys.left) player.xVel = -player.speed;
    else if (keys.right) player.xVel = player.speed;
    else player.xVel = 0;

    // Jumping
    if (keys.up && !player.jumping) {
        player.yVel = -10;
        player.jumping = true;
    }

    // Apply gravity
    player.yVel += gravity;

    // Move player
    player.x += player.xVel;
    player.y += player.yVel;

    // Platform collision
    platforms.forEach(p => {
        if (isColliding(player, p)) {
            if (player.yVel > 0) {
                player.y = p.y - player.height;
                player.yVel = 0;
                player.jumping = false;
            }
        }
    });

    // Enemy logic
    if (!enemy) spawnEnemy();

    enemy.yVel += gravity;
    enemy.x += enemy.xVel;
    enemy.y += enemy.yVel;

    // Enemy platform collision
    platforms.forEach(p => {
        if (isColliding(enemy, p)) {
            if (enemy.yVel > 0) {
                enemy.y = p.y - enemy.height;
                enemy.yVel = 0;
            }
        }
    });

    // Enemy wall bounce
    if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
        enemy.xVel *= -1;
    }

    // Player stomps enemy
    if (isColliding(player, enemy)) {
        const playerBottom = player.y + player.height;
        const enemyTop = enemy.y;

        if (playerBottom <= enemyTop + 15 && player.yVel > 0) {
            // Stomp enemy
            enemy.hp--;
            player.yVel = -8; // bounce

            if (enemy.hp <= 0) {
                // Purple enemy doubles your score
                if (enemy.type === "purple") {
                    score *= 2;
                } else {
                    score++;
                }

                document.getElementById("score").textContent = score;
                enemy = null;
            }

        } else {
            // Player hit from side → reset
            player.x = 100;
            player.y = 0;
            player.xVel = 0;
            player.yVel = 0;
        }
    }

    draw();
    requestAnimationFrame(update);
}

// Draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Player
    ctx.fillStyle = "#00ff88";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Enemy
    if (enemy) {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }

    // Platforms
    ctx.fillStyle = "#ffaa00";
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
}

// Fullscreen toggle
document.getElementById("fullscreen-btn").onclick = () => {
    const wrapper = document.getElementById("game-wrapper");
    if (!document.fullscreenElement) {
        wrapper.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
};

update();

