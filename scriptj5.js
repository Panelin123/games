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

let score = 0;
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

// Configurações de dificuldade
const difficultySettings = {
    facil: {
        speed: 2.2,
        spawnRate: 1800,
        obstacleChance: 0.2,
        poisonChance: 0,
        speedIncrease: 0.05
    },
    medio: {
        speed: 2,
        spawnRate: 1500,
        obstacleChance: 0.3,
        poisonChance: 0,
        speedIncrease: 0.08
    },
    dificil: {
        speed: 2.5,
        spawnRate: 1200,
        obstacleChance: 0.35,
        poisonChance: 0.15,
        speedIncrease: 0.1
    }
};

// Criar estrelas de fundo
for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 2 + 's';
    gameArea.appendChild(star);
}

// Seleção de dificuldade
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

// Contador regressivo
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

// Iniciar o jogo
function startGame() {
    gameRunning = true;
    rocket.style.display = 'block';
    scoreDisplay.style.display = 'block';
    livesDisplay.style.display = 'block';
    
    itemInterval = setInterval(createItem, spawnRate);
    updateInterval = setInterval(updateItems, 20);
}

// Controles do teclado
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    if (e.key === 'ArrowLeft' && rocketPos > 10) {
        rocketPos -= 5;
    } else if (e.key === 'ArrowRight' && rocketPos < 90) {
        rocketPos += 5;
    }
    rocket.style.left = rocketPos + '%';
});

// Controles touch
let touchStartX = 0;
gameArea.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

gameArea.addEventListener('touchmove', (e) => {
    if (!gameRunning) return;
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    
    if (diff < -10 && rocketPos > 10) {
        rocketPos -= 3;
    } else if (diff > 10 && rocketPos < 90) {
        rocketPos += 3;
    }
    rocket.style.left = rocketPos + '%';
    touchStartX = touchX;
});

// Criar itens
function createItem() {
    if (!gameRunning) return;

    const item = document.createElement('div');
    const rand = Math.random();
    const settings = difficultySettings[difficulty];
    
    // Determinar tipo de item
    if (rand < obstacleChance) {
        // Meteoro (obstáculo)
        item.className = 'obstacle';
        item.textContent = '☄️';
        item.dataset.type = 'obstacle';
    } else if (difficulty === 'dificil' && rand < obstacleChance + settings.poisonChance) {
        // Item venenoso (só no difícil)
        item.className = 'poison';
        item.textContent = '☠️';
        item.dataset.type = 'poison';
    } else {
        // Estrela coletável
        item.className = 'collectible-star';
        item.textContent = '⭐';
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

// Atualizar posição dos itens
function updateItems() {
    const rocketRect = rocket.getBoundingClientRect();
    
    items.forEach((item, index) => {
        item.y += gameSpeed;
        item.element.style.top = item.y + 'px';
        
        const itemRect = item.element.getBoundingClientRect();
       
        // Detectar colisão
        if (
            itemRect.bottom > rocketRect.top &&
            itemRect.top < rocketRect.bottom &&
            itemRect.right > rocketRect.left &&
            itemRect.left < rocketRect.right
        ) {
            if (item.type === 'obstacle' || item.type === 'poison') {
                lives--;
                livesDisplay.textContent = '❤️ ' + lives;
                createExplosion(itemRect.left, itemRect.top);
                
                if (lives <= 0) {
                    endGame();
                }
            } else if (item.type === 'star') {
                score++;
                scoreDisplay.textContent = '⭐ ' + score;
                
                // Aumentar dificuldade progressivamente
                if (score % 10 === 0) {
                    increaseDifficulty();
                }
            }
            
            item.element.remove();
            items.splice(index, 1);
        }

        // Remover itens que saíram da tela
        if (item.y > window.innerHeight) {
            item.element.remove();
            items.splice(index, 1);
        }
    });
}

// Aumentar dificuldade progressivamente
function increaseDifficulty() {
    const settings = difficultySettings[difficulty];
    gameSpeed += settings.speedIncrease;
    
    // Aumentar chance de obstáculos gradualmente
    if (obstacleChance < 0.5) {
        obstacleChance += 0.02;
    }
    
    // Diminuir tempo entre spawns
    if (spawnRate > 800) {
        spawnRate -= 50;
        clearInterval(itemInterval);
        itemInterval = setInterval(createItem, spawnRate);
    }
}

// Criar explosão
function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.textContent = '💥';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    gameArea.appendChild(explosion);
    
    setTimeout(() => explosion.remove(), 500);
}

// Fim de jogo
function endGame() {
    gameRunning = false;
    clearInterval(itemInterval);
    clearInterval(updateInterval);

    const rocketRect = rocket.getBoundingClientRect();

    // Explosão do foguete
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
        document.getElementById('finalScore').textContent = 'Você coletou ' + score + ' estrelas!';
        gameOverDiv.style.display = 'block';
    }, 600);
}

// Reiniciar jogo
restartBtn.addEventListener('click', () => {
    resetGame();
    startCountdown();
});

// Voltar ao menu
menuBtn.addEventListener('click', () => {
    resetGame();
    menuDificuldade.style.display = 'block';
});

// Resetar o jogo
function resetGame() {
    score = 0;
    lives = 3;
    rocketPos = 50;
    gameRunning = false;
    
    // Resetar configurações da dificuldade selecionada
    const settings = difficultySettings[difficulty];
    gameSpeed = settings.speed;
    spawnRate = settings.spawnRate;
    obstacleChance = settings.obstacleChance;
    
    scoreDisplay.textContent = '⭐ 0';
    livesDisplay.textContent = '❤️ 3';
    rocket.style.left = '50%';
    rocket.style.display = 'none';
    gameOverDiv.style.display = 'none';
    scoreDisplay.style.display = 'none';
    livesDisplay.style.display = 'none';
    
    // Limpar todos os itens
    items.forEach(item => item.element.remove());
    items = [];
    
    // Limpar intervalos
    clearInterval(itemInterval);
    clearInterval(updateInterval);
}