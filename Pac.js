const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tileSize = 24;

/* ================= MAP ================= */

let map = [
"#####################",
"#.........#.........#",
"#.###.###.#.###.###.#",
"#o###.###.#.###.###o#",
"#...................#",
"#.###.#.#######.#.###",
"#.....#....#....#.....#",
"#####.#####.#.#####.#####",
"#####.#...........#.#####",
"#.........GGGG.........#",
"#####.#...........#.#####",
"#####.#.#########.#.#####",
"#.........#.....#.........#",
"#.###.###.#.###.#.###.###.#",
"#o..#........#........#..o#",
"###.#.#.###########.#.#.###",
"#.....#.....#.....#.....#",
"#.#########.#.#########.#",
"#.......................#",
"#P......................#",
"#####################"
];

const rows = map.length;
const cols = map[0].length;

canvas.width = cols * tileSize;
canvas.height = rows * tileSize;

let score = 0;
let lives = 3;
let gameWon = false;
let winTimer = 0;

/* ================= UTILITIES ================= */

function distance(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
}

function isWall(x, y) {
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    if (!map[row] || !map[row][col]) return true;
    return map[row][col] === "#";
}

function handleWrap(entity) {
    if (entity.x < 0) entity.x = canvas.width - tileSize / 2;
    if (entity.x > canvas.width) entity.x = tileSize / 2;
    if (entity.y < 0) entity.y = canvas.height - tileSize / 2;
    if (entity.y > canvas.height) entity.y = tileSize / 2;
}

/* ================= PLAYER ================= */

class Player {
    constructor(x, y) {
        this.spawnX = x;
        this.spawnY = y;
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.speed = 2;
        this.mouth = 0;
        this.angle = 0;
    }

    draw() {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(
            this.x,
            this.y,
            tileSize / 2,
            this.angle + this.mouth,
            this.angle + (Math.PI * 2 - this.mouth)
        );
        ctx.fill();
    }

    update() {
        if (gameWon) {
            this.angle += 0.2;
            return;
        }

        this.mouth = Math.abs(Math.sin(Date.now() / 120)) * 0.4;

        let nextX = this.x + this.dx;
        let nextY = this.y + this.dy;

        if (!isWall(nextX, nextY)) {
            this.x = nextX;
            this.y = nextY;
        }

        handleWrap(this);

        if (this.dx > 0) this.angle = 0;
        if (this.dx < 0) this.angle = Math.PI;
        if (this.dy > 0) this.angle = Math.PI / 2;
        if (this.dy < 0) this.angle = -Math.PI / 2;

        eatDot();
    }

    reset() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.dx = 0;
        this.dy = 0;
    }
}

/* ================= GHOST ================= */

class Ghost {
    constructor(x, y, color, type) {
        this.spawnX = x;
        this.spawnY = y;
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.speed = 1.6;
        this.dx = this.speed;
        this.dy = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, tileSize / 2, Math.PI, 0);
        ctx.lineTo(this.x + tileSize / 2, this.y + tileSize / 2);
        ctx.lineTo(this.x - tileSize / 2, this.y + tileSize / 2);
        ctx.fill();
    }

    update() {
        if (gameWon) return;

        let target = this.getTarget();

        const directions = [
            [this.speed, 0],
            [-this.speed, 0],
            [0, this.speed],
            [0, -this.speed]
        ];

        directions.sort((a, b) => {
            const distA = distance(this.x + a[0], this.y + a[1], target.x, target.y);
            const distB = distance(this.x + b[0], this.y + b[1], target.x, target.y);
            return distA - distB;
        });

        for (let dir of directions) {
            if (!isWall(this.x + dir[0], this.y + dir[1])) {
                this.dx = dir[0];
                this.dy = dir[1];
                break;
            }
        }

        this.x += this.dx;
        this.y += this.dy;

        handleWrap(this);
    }

    getTarget() {
        if (this.type === "red") return { x: player.x, y: player.y };

        if (this.type === "pink")
            return { x: player.x + player.dx * 20, y: player.y + player.dy * 20 };

        if (this.type === "cyan")
            return { x: player.x - player.dx * 40, y: player.y - player.dy * 40 };

        if (this.type === "orange") {
            let d = distance(this.x, this.y, player.x, player.y);
            if (d < 100) return { x: 0, y: canvas.height };
            return { x: player.x, y: player.y };
        }

        return { x: player.x, y: player.y };
    }

    reset() {
        this.x = this.spawnX;
        this.y = this.spawnY;
    }
}

/* ================= DOTS & WIN ================= */

function eatDot() {
    const col = Math.floor(player.x / tileSize);
    const row = Math.floor(player.y / tileSize);

    if (map[row][col] === ".") {
        map[row] =
            map[row].substring(0, col) +
            " " +
            map[row].substring(col + 1);

        score += 10;
        document.getElementById("score").innerText = "Score: " + score;

        checkWin();
    }
}

function checkWin() {
    for (let r of map) {
        if (r.includes(".")) return;
    }
    gameWon = true;
    winTimer = Date.now();
}

function drawWinScreen() {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2);
}

/* ================= DRAW MAP ================= */

function drawMap() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {

            if (map[r][c] === "#") {
                ctx.fillStyle = "blue";
                ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
            }

            if (map[r][c] === ".") {
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(
                    c * tileSize + tileSize / 2,
                    r * tileSize + tileSize / 2,
                    3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
}

/* ================= SPAWN DETECTION ================= */

let playerRow, playerCol;
let ghostSpawns = [];

for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        if (map[r][c] === "P") { playerRow = r; playerCol = c; }
        if (map[r][c] === "G") ghostSpawns.push({ r, c });
    }
}

const player = new Player(
    playerCol * tileSize + tileSize / 2,
    playerRow * tileSize + tileSize / 2
);

map[playerRow] =
    map[playerRow].substring(0, playerCol) +
    "." +
    map[playerRow].substring(playerCol + 1);

const ghostTypes = ["red", "pink", "cyan", "orange"];
const ghostColors = ["red", "pink", "cyan", "orange"];

const ghosts = ghostSpawns.map((pos, i) =>
    new Ghost(
        pos.c * tileSize + tileSize / 2,
        pos.r * tileSize + tileSize / 2,
        ghostColors[i],
        ghostTypes[i]
    )
);

/* ================= CONTROLS ================= */

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") { player.dx = 0; player.dy = -player.speed; }
    if (e.key === "ArrowDown") { player.dx = 0; player.dy = player.speed; }
    if (e.key === "ArrowLeft") { player.dx = -player.speed; player.dy = 0; }
    if (e.key === "ArrowRight") { player.dx = player.speed; player.dy = 0; }
});

/* ================= COLLISION ================= */

function checkCollision() {
    if (gameWon) return;

    for (let ghost of ghosts) {
        if (distance(player.x, player.y, ghost.x, ghost.y) < tileSize / 2) {
            lives--;
            document.getElementById("lives").innerText = "Lives: " + lives;

            player.reset();
            ghosts.forEach(g => g.reset());

            if (lives <= 0) {
                alert("Game Over!");
                location.reload();
            }
        }
    }
}

/* ================= GAME LOOP ================= */

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();

    player.update();
    player.draw();

    ghosts.forEach(g => {
        g.update();
        g.draw();
    });

    checkCollision();

    if (gameWon) {
        drawWinScreen();
        if (Date.now() - winTimer > 4000) {
            location.reload();
        }
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();