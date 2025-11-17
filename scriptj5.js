const gameArea = document.getElementById('gameArea');
const rocket = document.getElementById('rocket');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const gameOverDiv = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const menuDificuldade = document.getElementById('menuDificuldade');
const contador = document.getElementById('contador');
const contadorNumero = document.getElementById('contadorNumero');

let score = 0;              // SCORE FINAL (multiplicado)
let starsCollected = 0;     // ⭐ CONTADOR VISUAL (aparece no HUD)
let lives = 3;
let rocketPos = 50;
let gameRunning = false;
let items = [];
let difficulty = 'medio';
let gameSpeed = 2;
let spawnRate = 1500;
let obstacleChance = 0.3;
let itemInterval;
let updateInterval;

// ==========================
// SISTEMA DE PLACAR
// ==========================
function getCurrentUser() {
    return sessionStorage.getItem('currentUserInitials');
}

function updateTotalScore(gameScore) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const scoreKeyTotal = 'arcadeTotalScores';
    const scores = JSON.parse(localStorage.getItem(scoreKeyTotal) || '[]');
    
    const userIndex = scores.findIndex(entry => entry.user === currentUser);
    
    if (userIndex !== -1) {
        scores[userIndex].score += gameScore;
    } else {
        scores.push({ user: currentUser, score: gameScore });
    }
    
    localStorage.setItem(scoreKeyTotal, JSON.stringify(scores));
}

// ==========================
// CONFIGURAÇÕES DE DIFICULDADE
// ==========================
const difficultySettings = {
    facil: {
        speed: 2.2,
        spawnRate: 1800,
        obstacleChance: 0.2,
        poisonChance: 0,
        speedIncrease: 0.05,
        initialLives: 3
    },
    medio: {
        speed: 2,
        spawnRate: 1500,
        obstacleChance: 0.3,
        poisonChance: 0,
        speedIncrease: 0.08,
        initialLives: 3
    },
    dificil: {
        speed: 2.5,
        spawnRate: 1200,
        obstacleChance: 0.35,
        poisonChance: 0.15,
        speedIncrease: 0.1,
        initialLives: 5
    }
};

// ==========================
// ESTRELAS DE FUNDO
// ==========================
for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 2 + 's';
    gameArea.appendChild(star);
}

// ==========================
// SELEÇÃO DE DIFICULDADE
// ==========================
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        difficulty = btn.dataset.difficulty;
        const settings = difficultySettings[difficulty];
        gameSpeed = settings.speed;
        spawnRate = settings.spawnRate;
        obstacleChance = settings.obstacleChance;
        
        menuDificuldade.style.display = 'none';
        startCountdown();
    });
});

// ==========================
// CONTAGEM REGRESSIVA
// ==========================
function startCountdown() {
    contador.style.display = 'block';
    let count = 3;
    contadorNumero.textContent = count;
    
    const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
            contadorNumero.textContent = count;
            contadorNumero.style.animation = 'none';
            setTimeout(() => {
                contadorNumero.style.animation = 'pulseCounter 1s ease-in-out';
            }, 10);
        } else {
            clearInterval(countInterval);
            contador.style.display = 'none';
            startGame();
        }
    }, 1000);
}

// ==========================
// INICIAR JOGO
// ==========================
function startGame() {
    gameRunning = true;
    rocket.style.display = 'block';
    scoreDisplay.style.display = 'block';
    livesDisplay.style.display = 'block';
    
    const settings = difficultySettings[difficulty];
    lives = settings.initialLives;

    // HUD mostra APENAS estrelas coletadas ⭐
    scoreDisplay.innerHTML =
        '<img src="img/estrela.png" style="width:28px; height:28px;"> ' + starsCollected;

    livesDisplay.innerHTML =
        '<img src="img/vida.png" style="width:28px; height:28px;"> ' + lives;
    
    itemInterval = setInterval(createItem, spawnRate);
    updateInterval = setInterval(updateItems, 20);
}

// ==========================
// CONTROLES
// ==========================
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    if (e.key === 'ArrowLeft' && rocketPos > 10) rocketPos -= 5;
    else if (e.key === 'ArrowRight' && rocketPos < 90) rocketPos += 5;

    rocket.style.left = rocketPos + '%';
});

// TOUCH
let touchStartX = 0;
gameArea.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

gameArea.addEventListener('touchmove', (e) => {
    if (!gameRunning) return;

    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    
    if (diff < -10 && rocketPos > 10) rocketPos -= 3;
    else if (diff > 10 && rocketPos < 90) rocketPos += 3;

    rocket.style.left = rocketPos + '%';
    touchStartX = touchX;
});

// ==========================
// CRIAR ITENS
// ==========================
function createItem() {
    if (!gameRunning) return;

    const item = document.createElement('div');
    const rand = Math.random();
    const settings = difficultySettings[difficulty];
    
    if (rand < obstacleChance) {
        item.className = 'obstacle';
        item.style.backgroundImage = "url('img/meteoro.png')";
        item.dataset.type = 'obstacle';
    } else if (difficulty === 'dificil' && rand < obstacleChance + settings.poisonChance) {
        item.className = 'poison';
        item.style.backgroundImage = "url('img/alienigena.png')";
        item.dataset.type = 'poison';
    } else {
        item.className = 'collectible-star';
        item.style.backgroundImage = "url('img/estrela.png')";
        item.dataset.type = 'star';
    }
    
    item.style.left = Math.random() * 90 + 5 + '%';
    item.style.top = '-50px';
    gameArea.appendChild(item);
    
    items.push({
        element: item,
        type: item.dataset.type,
        y: -50
    });
}

// ==========================
// ATUALIZAR ITENS (COLISÕES)
// ==========================
function updateItems() {
    const rocketRect = rocket.getBoundingClientRect();
    
    items.forEach((item, index) => {
        item.y += gameSpeed;
        item.element.style.top = item.y + 'px';
        
        const itemRect = item.element.getBoundingClientRect();

        // COLISÃO
        if (
            itemRect.bottom > rocketRect.top + 20 &&
            itemRect.top < rocketRect.bottom - 20 &&
            itemRect.right > rocketRect.left + 30 &&
            itemRect.left < rocketRect.right - 30
        ) {

            // Obstáculo ou venenoso
            if (item.type === 'obstacle' || item.type === 'poison') {
                lives--;
                livesDisplay.innerHTML =
                    '<img src="img/vida.png" style="width:28px; height:28px;"> ' + lives;

                createExplosion(itemRect.left, itemRect.top);

                if (lives <= 0) endGame();
            }

            // ⭐ ESTRELA
            else if (item.type === 'star') {

                // contador simples ⭐
                starsCollected++;

                // score multiplicado
                const starValue = Math.floor(gameSpeed * 15);
                score += starValue;

                // HUD mostra apenas ⭐ coletadas
                scoreDisplay.innerHTML =
                    '<img src="img/estrela.png" style="width:28px; height:28px;"> ' + starsCollected;

                // aumenta velocidade
                gameSpeed += 0.05;

                // aumenta meteoros
                if (obstacleChance < 0.7) obstacleChance += 0.01;

                // spawns mais rápidos
                if (spawnRate > 500) {
                    spawnRate -= 15;
                    clearInterval(itemInterval);
                    itemInterval = setInterval(createItem, spawnRate);
                }
            }
            
            item.element.remove();
            items.splice(index, 1);
        }

        if (item.y > window.innerHeight) {
            item.element.remove();
            items.splice(index, 1);
        }
    });
}

// ==========================
// EXPLOSÃO
// ==========================
function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.textContent = '💥';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    gameArea.appendChild(explosion);
    
    setTimeout(() => explosion.remove(), 500);
}

// ==========================
// FIM DO JOGO
// ==========================
function endGame() {
    gameRunning = false;
    clearInterval(itemInterval);
    clearInterval(updateInterval);

    const rocketRect = rocket.getBoundingClientRect();

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createExplosion(
                rocketRect.left + Math.random() * 40 - 20, 
                rocketRect.top + Math.random() * 40 - 20
            );
        }, i * 100);
    }
    
    setTimeout(() => {
        rocket.style.display = 'none';

        document.getElementById('finalScore').innerHTML =
            "⭐ Estrelas Coletadas: <b>" + starsCollected + "</b><br>" +
            "💥 Score Final: <b>" + score + " pontos</b>";

        gameOverDiv.style.display = 'block';
        
        if (score > 0) updateTotalScore(score);
    }, 600);
}

// ==========================
// REINICIAR
// ==========================
restartBtn.addEventListener('click', () => {
    resetGame();
    startCountdown();
});

menuBtn.addEventListener('click', () => {
    resetGame();
    window.location.href = 'menu.html';
});

// ==========================
// RESET
// ==========================
function resetGame() {
    score = 0;
    starsCollected = 0;
    rocketPos = 50;
    gameRunning = false;
    
    const settings = difficultySettings[difficulty];
    gameSpeed = settings.speed;
    spawnRate = settings.spawnRate;
    obstacleChance = settings.obstacleChance;
    lives = settings.initialLives;
    
    scoreDisplay.innerHTML =
        '<img src="img/estrela.png" style="width:28px; height:28px;"> 0';

    livesDisplay.innerHTML =
        '<img src="img/vida.png" style="width:28px; height:28px;"> ' + lives;

    rocket.style.left = '50%';
    rocket.style.display = 'none';
    gameOverDiv.style.display = 'none';
    scoreDisplay.style.display = 'none';
    livesDisplay.style.display = 'none';
    
    items.forEach(item => item.element.remove());
    items = [];
    
    clearInterval(itemInterval);
    clearInterval(updateInterval);
}
