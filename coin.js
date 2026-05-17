let score = 0;

// Load saved customizations
let coinSkin = localStorage.getItem("coinSkin") || "default-coin";
let bgSkin = localStorage.getItem("bgSkin") || "";
let textSkin = localStorage.getItem("textSkin") || "";

// Apply saved skins
document.getElementById("coin").className = coinSkin;
document.body.className = bgSkin;
document.getElementById("title").className = textSkin;

// Score display
const scoreDisplay = document.getElementById("score");

// Shop toggle
const shop = document.getElementById("shop");
document.getElementById("shop-btn").onclick = () => shop.classList.remove("hidden");
document.getElementById("close-shop").onclick = () => shop.classList.add("hidden");

// Difficulty selector
const difficultySelect = document.getElementById("difficulty");

// Flip a single coin
function flipCoin() {
    return Math.random() < 0.5 ? "heads" : "tails";
}

// Apply coin shape
function applyShape(result) {
    const coin = document.getElementById("coin");

    if (result === "heads") {
        coin.classList.remove("coin-square");
        coin.classList.add("coin-round");
    } else {
        coin.classList.remove("coin-round");
        coin.classList.add("coin-square");
    }
}

// Handle coin toss
document.querySelectorAll(".choice").forEach(btn => {
    btn.onclick = () => {
        const guess = btn.dataset.choice;
        const difficulty = difficultySelect.value;

        let results = [];

        if (difficulty === "easy" || difficulty === "medium") {
            results = [flipCoin()];
        } 
        else if (difficulty === "hard") {
            results = [flipCoin(), flipCoin()];
        } 
        else if (difficulty === "impossible") {
            results = [flipCoin(), flipCoin(), flipCoin(), flipCoin(), flipCoin()];
        }

        // Display only the FIRST coin visually
        const first = results[0];
        const coin = document.getElementById("coin");
        coin.textContent = first === "heads" ? "H" : "T";
        applyShape(first);

        // Determine win/loss
        const allMatch = results.every(r => r === guess);

        if (difficulty === "easy") {
            if (allMatch) score++;
        } 
        else {
            if (allMatch) score++;
            else score--;
        }

        scoreDisplay.textContent = score;
    };
});

// Shop purchases
document.querySelectorAll(".shop-item").forEach(item => {
    item.onclick = () => {
        const type = item.dataset.type;
        const value = item.dataset.value;

        let cost = 5;
        if (value === "neon" || value === "sunset" || value === "bubble") cost = 10;

        if (score < cost) {
            alert("Not enough points!");
            return;
        }

        score -= cost;
        scoreDisplay.textContent = score;

        if (type === "coin") {
            coinSkin = value;
            document.getElementById("coin").className = value;
            localStorage.setItem("coinSkin", value);
        }

        if (type === "bg") {
            bgSkin = "bg-" + value;
            document.body.className = bgSkin;
            localStorage.setItem("bgSkin", bgSkin);
        }

        if (type === "text") {
            textSkin = "text-" + value;
            document.getElementById("title").className = textSkin;
            localStorage.setItem("textSkin", textSkin);
        }
    };
});
