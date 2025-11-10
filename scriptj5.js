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

// Funções para o sistema de placar
function getCurrentUser() {
    return sessionStorage.getItem('currentUserInitials');
}

function updateTotalScore(gameScore) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const scoreKeyTotal = 'arcadeTotalScores';
    const scores = JSON.parse(localStorage.getItem(scoreKeyTotal) || '[]');
    
    // Encontra o usuário atual
    const userIndex = scores.findIndex(entry => entry.user === currentUser);
    
    if (userIndex !== -1) {
        // Atualiza a pontuação total (soma a nova pontuação)
        scores[userIndex].score += gameScore;
    } else {
        // Se não encontrou, adiciona novo usuário
        scores.push({ user: currentUser, score: gameScore });
    }
    
    localStorage.setItem(scoreKeyTotal, JSON.stringify(scores));
    console.log(`Pontuação atualizada: ${currentUser} +${gameScore} pontos`);
}

// Configurações de dificuldade
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
    
    // Usar vidas iniciais baseadas na dificuldade
    const settings = difficultySettings[difficulty];
    lives = settings.initialLives;
    livesDisplay.innerHTML = '<img src="img/vida.png" style="width:28px; height:28px; vertical-align: middle;"> ' + lives;
    
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
        item.style.backgroundImage = "url('img/meteoro.png')";
        item.style.backgroundSize = 'contain';
        item.style.backgroundRepeat = 'no-repeat';
        item.style.backgroundPosition = 'center';
        item.dataset.type = 'obstacle';
    } else if (difficulty === 'dificil' && rand < obstacleChance + settings.poisonChance) {
        // Item venenoso (alienígena) - só no difícil
        item.className = 'poison';
        item.style.backgroundImage = "url('img/alienigena.png')";
        item.style.backgroundSize = 'contain';
        item.style.backgroundRepeat = 'no-repeat';
        item.style.backgroundPosition = 'center';
        item.dataset.type = 'poison';
    } else {
        // Estrela coletável
        item.className = 'collectible-star';
        item.style.backgroundImage = "url('img/estrela.png')";
        item.style.backgroundSize = 'contain';
        item.style.backgroundRepeat = 'no-repeat';
        item.style.backgroundPosition = 'center';
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
       
        // COLISÃO MAIS PRECISA - só dano se encostar no foguete
        if (
            itemRect.bottom > rocketRect.top + 20 && // Margem superior
            itemRect.top < rocketRect.bottom - 20 && // Margem inferior  
            itemRect.right > rocketRect.left + 30 && // Margem esquerda
            itemRect.left < rocketRect.right - 30     // Margem direita
        ) {
            if (item.type === 'obstacle' || item.type === 'poison') {
                lives--;
                // Vidas com imagem de coração
                livesDisplay.innerHTML = '<img src="img/vida.png" style="width:28px; height:28px; vertical-align: middle;"> ' + lives;
                createExplosion(itemRect.left, itemRect.top);
                
                if (lives <= 0) {
                    endGame();
                }
            } else if (item.type === 'star') {
                score++;
                // Score com imagem de estrela
                scoreDisplay.innerHTML = '<img src="img/estrela.png" style="width:28px; height:28px; vertical-align: middle;"> ' + score;
                
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
    gameSpeed += settings.speedIncrease * 2; // Acelera o DOBRO!
    
    // Aumentar chance de obstáculos gradualmente
    if (obstacleChance < 0.6) {
        obstacleChance += 0.03;
    }
    
    // Diminuir tempo entre spawns mais rapidamente
    if (spawnRate > 600) {
        spawnRate -= 80;
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
        
        // SALVAR A PONTUAÇÃO NO SISTEMA DE RECORDES
        if (score > 0) {
            updateTotalScore(score);
        }
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
    window.location.href = 'menu.html'; // 👈 Volta para o menu principal
});

// Resetar o jogo
function resetGame() {
    score = 0;
    rocketPos = 50;
    gameRunning = false;
    
    // Resetar configurações da dificuldade selecionada
    const settings = difficultySettings[difficulty];
    gameSpeed = settings.speed;
    spawnRate = settings.spawnRate;
    obstacleChance = settings.obstacleChance;
    lives = settings.initialLives;
    
    // Score inicial com imagem de estrela
    scoreDisplay.innerHTML = '<img src="img/estrela.png" style="width:28px; height:28px; vertical-align: middle;"> 0';
    // Vidas iniciais baseadas na dificuldade
    livesDisplay.innerHTML = '<img src="img/vida.png" style="width:28px; height:28px; vertical-align: middle;"> ' + lives;
    rocket.style.left = '50%';
    rocket.style.display = 'none';
    gameOverDiv.style.display = 'none';
    scoreDisplay.style.display = 'none';
    livesDisplay.style.display = 'none';
    
    // VERIFICAR SE USUÁRIO ESTÁ LOGADO
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('⚠️ Você precisa estar logado para salvar sua pontuação!\nVolte ao menu principal para registrar suas iniciais.');
    }
    
    // Limpar todos os itens
    items.forEach(item => item.element.remove());
    items = [];
    
    // Limpar intervalos
    clearInterval(itemInterval);
    clearInterval(updateInterval);
}