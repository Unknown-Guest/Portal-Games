const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 600;

let gravity = 0.6;
let keys = {};
let lives = 3;
let level = 1;
let maxLevel = 3;
let gameState = "playing";

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 100;
    this.y = canvas.height - 60;
    this.width = 30;
    this.height = 40;
    this.dy = 0;
    this.onGround = false;
    this.climbing = false;
  }

  update() {
    if (gameState !== "playing") return;

    if (keys["ArrowLeft"]) this.x -= 4;
    if (keys["ArrowRight"]) this.x += 4;

    this.climbing = false;
    ladders.forEach(l => {
      if (this.collides(l)) {
        if (keys["ArrowUp"]) { this.y -= 3; this.climbing = true; }
        if (keys["ArrowDown"]) { this.y += 3; this.climbing = true; }
      }
    });

    if (!this.climbing) {
      this.dy += gravity;
      this.y += this.dy;
    }

    if (keys[" "] && this.onGround) {
      this.dy = -12;
      this.onGround = false;
    }

    this.onGround = false;
    platforms.forEach(p => {
      if (this.y + this.height <= p.y + 10 &&
          this.y + this.height + this.dy >= p.y &&
          this.x + this.width > p.x &&
          this.x < p.x + p.width) {
        this.y = p.y - this.height;
        this.dy = 0;
        this.onGround = true;
      }
    });

    if (this.y < 120) nextLevel();
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  collides(obj) {
    return (
      this.x < obj.x + obj.width &&
      this.x + this.width > obj.x &&
      this.y < obj.y + obj.height &&
      this.y + this.height > obj.y
    );
  }
}

class Barrel {
  constructor() {
    this.x = donkey.x + 60;
    this.y = donkey.y + 40;
    this.radius = 12;
    this.speed = 2 + level;
    this.dy = 0;
  }

  update() {
    this.x += this.speed;

    this.dy += gravity;
    this.y += this.dy;

    platforms.forEach(p => {
      if (this.y + this.radius <= p.y + 10 &&
          this.y + this.radius + this.dy >= p.y &&
          this.x > p.x &&
          this.x < p.x + p.width) {
        this.y = p.y - this.radius;
        this.dy = 0;
      }
    });

    if (this.x > canvas.width) {
      this.dead = true;
    }

    if (distance(this.x,this.y,player.x+15,player.y+20) < 25) {
      loseLife();
    }
  }

  draw() {
    ctx.fillStyle = "brown";
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
    ctx.fill();
  }
}

class Donkey {
  constructor() {
    this.x = 100;
    this.y = 60;
    this.width = 80;
    this.height = 70;
    this.throwCooldown = 0;
    this.armUp = false;
  }

  update() {
    if (gameState !== "playing") return;

    this.throwCooldown--;

    if (this.throwCooldown <= 0) {
      this.armUp = true;
      setTimeout(() => {
        barrels.push(new Barrel());
        this.armUp = false;
      }, 300);

      this.throwCooldown = 150 - level * 20;
    }
  }

  draw() {
    ctx.fillStyle = "brown";
    ctx.fillRect(this.x,this.y,this.width,this.height);

    // Arm animation
    ctx.fillStyle = "#5c2e00";
    if (this.armUp) {
      ctx.fillRect(this.x + 60, this.y - 10, 15, 30);
    } else {
      ctx.fillRect(this.x + 60, this.y + 20, 15, 30);
    }
  }
}

class Princess {
  constructor() {
    this.x = 700;
    this.y = 60;
  }

  draw() {
    ctx.fillStyle = "pink";
    ctx.fillRect(this.x, this.y, 30, 40);

    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x + 8, this.y - 10, 15, 10);
  }
}

function distance(x1,y1,x2,y2){
  return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}

function loseLife() {
  lives--;
  document.getElementById("lives").innerText = lives;
  player.reset();
  if (lives <= 0) gameState = "gameover";
}

function nextLevel() {
  if (level < maxLevel) {
    level++;
    document.getElementById("level").innerText = level;
    barrels = [];
    player.reset();
  } else {
    gameState = "win";
  }
}

let platforms = [];
let ladders = [];
let barrels = [];
let player = new Player();
let donkey = new Donkey();
let princess = new Princess();

function createLevel() {
  platforms = [
    {x: 0, y: 550, width: 900, height: 20},
    {x: 0, y: 450, width: 700, height: 20},
    {x: 200, y: 350, width: 700, height: 20},
    {x: 0, y: 250, width: 700, height: 20},
    {x: 200, y: 150, width: 700, height: 20}
  ];

  ladders = [
    {x: 300, y: 470, width: 20, height: 80},
    {x: 500, y: 370, width: 20, height: 80},
    {x: 250, y: 270, width: 20, height: 80},
    {x: 600, y: 170, width: 20, height: 80}
  ];
}

function drawLevel() {
  ctx.fillStyle = "pink";
  platforms.forEach(p => ctx.fillRect(p.x,p.y,p.width,p.height));

  ctx.fillStyle = "cyan";
  ladders.forEach(l => ctx.fillRect(l.x,l.y,l.width,l.height));
}

function gameLoop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawLevel();

  donkey.update();
  donkey.draw();

  princess.draw();

  player.update();
  player.draw();

  barrels = barrels.filter(b => !b.dead);
  barrels.forEach(b => {
    b.update();
    b.draw();
  });

  if (gameState === "gameover") {
    ctx.fillStyle = "red";
    ctx.font = "50px Arial";
    ctx.fillText("GAME OVER", 300, 300);
  }

  if (gameState === "win") {
    ctx.fillStyle = "yellow";
    ctx.font = "40px Arial";
    ctx.fillText("YOU SAVED THE PRINCESS!", 200, 300);
  }

  requestAnimationFrame(gameLoop);
}

createLevel();
gameLoop();
