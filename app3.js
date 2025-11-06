const SESSION_KEY = 'currentUserInitials';
const SCORE_KEY_TOTAL = 'arcadeTotalScores';

// --- Funções de Placar Global ---

/**
 * Pega as iniciais do usuário logado na página principal.
 * @returns {string | null} Iniciais do usuário logado ou null.
 */
function getCurrentUser() {
    return sessionStorage.getItem(SESSION_KEY);
}

/**
 * Atualiza o placar total acumulado do usuário no localStorage.
 * @param {string} userInitials - Iniciais do usuário (3 caracteres).
 * @param {number} scoreToAdd - Pontuação a ser adicionada.
 */
function updateTotalScore(userInitials, scoreToAdd) {
    if (scoreToAdd <= 0) return; // Só adiciona score positivo
    
    try {
        const scores = JSON.parse(localStorage.getItem(SCORE_KEY_TOTAL) || '[]');
        let userEntry = scores.find(s => s.user === userInitials);

        if (userEntry) {
            userEntry.score += scoreToAdd;
        } else {
            scores.push({ user: userInitials, score: scoreToAdd });
        }

        localStorage.setItem(SCORE_KEY_TOTAL, JSON.stringify(scores));
        console.log(`Pontuação de ${scoreToAdd} adicionada ao total de ${userInitials}. Novo total: ${userEntry ? userEntry.score : scoreToAdd}`);

    } catch (e) {
        console.error("Erro ao salvar o placar total:", e);
    }
}

// --- Jogo da Cobrinha Original (Modificado) ---

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const GRID_WIDTH = CANVAS_WIDTH / GRID_SIZE;
const GRID_HEIGHT = CANVAS_HEIGHT / GRID_SIZE;

let gameState = {
    snake: [{ x: 10, y: 10 }],
    direction: { x: 1, y: 0 },
    food: { x: 15, y: 15 },
    food2: null, 
    score: 0,
    highScore: localStorage.getItem('snakeHighScore') || 0,
    isRunning: false,
    isPaused: false,
    gameLoop: null,
    speed: 150,
    difficulty: null,
    difficultyName: '-'
};

const difficultySettings = {
    easy: {
        speed: 150,
        name: 'Fácil',
        hasTwoFruits: false
    },
    medium: {
        speed: 100,
        name: 'Médio',
        hasTwoFruits: false
    },
    hard: {
        speed: 70,
        name: 'Difícil',
        hasTwoFruits: true
    }
};

const colors = {
    snake: '#4caf50',
    snakeHead: '#2e7d32',
    food: '#ff5722',
    food2: '#ff9800', 
    background: '#1a1a2e',
    grid: 'rgba(255,255,255,0.1)'
};

function selectDifficulty(level) {
    gameState.difficulty = level;
    gameState.speed = difficultySettings[level].speed;
    gameState.difficultyName = difficultySettings[level].name;
    
    
    document.getElementById('difficultyOverlay').style.display = 'none';
    
   
    if (difficultySettings[level].hasTwoFruits) {
        generateSecondFood();
    } else {
        gameState.food2 = null;
    }
    
    updateDisplay();
    startCountdown();
}

function initGame() {
    updateDisplay();
    drawGame();
    
    document.getElementById('difficultyOverlay').style.display = 'flex';
}

function drawGame() {
// ... (seu código drawGame sem alterações)
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawGrid();
    drawSnake();
    drawFood();
    if (gameState.food2) {
        drawSecondFood();
    }
}

function drawGrid() {
// ... (seu código drawGrid sem alterações)
    ctx.strokeStyle = colors.grid;
    for (let i = 0; i <= GRID_WIDTH; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let i = 0; i <= GRID_HEIGHT; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_WIDTH, i * GRID_SIZE);
        ctx.stroke();
    }
}

function drawSnake() {
// ... (seu código drawSnake sem alterações)
    gameState.snake.forEach((segment, i) => {
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        if (i === 0) {
            ctx.fillStyle = colors.snakeHead;
            ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
            ctx.fillStyle = '#fff';
            ctx.fillRect(x + 6, y + 6, 3, 3);
            ctx.fillRect(x + 11, y + 6, 3, 3);
        } else {
            const opacity = 1 - i * 0.05;
            ctx.globalAlpha = Math.max(opacity, 0.3);
            ctx.fillStyle = colors.snake;
            ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
            ctx.globalAlpha = 1;
        }
    });
}

function drawFood() {
// ... (seu código drawFood sem alterações)
    const x = gameState.food.x * GRID_SIZE;
    const y = gameState.food.y * GRID_SIZE;
    const pulse = 2 + Math.sin(Date.now() * 0.01);
    ctx.fillStyle = colors.food;
    ctx.fillRect(x + pulse, y + pulse, GRID_SIZE - pulse * 2, GRID_SIZE - pulse * 2);
    ctx.fillStyle = '#ffab00';
    ctx.fillRect(x + 6, y + 6, 8, 8);
}

function drawSecondFood() {
// ... (seu código drawSecondFood sem alterações)
    if (!gameState.food2) return;
    const x = gameState.food2.x * GRID_SIZE;
    const y = gameState.food2.y * GRID_SIZE;
    const pulse = 2 + Math.sin(Date.now() * 0.015);
    ctx.fillStyle = colors.food2;
    ctx.fillRect(x + pulse, y + pulse, GRID_SIZE - pulse * 2, GRID_SIZE - pulse * 2);
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(x + 6, y + 6, 8, 8);
}

function moveSnake() {
// ... (seu código moveSnake sem alterações)
    const head = { ...gameState.snake[0] };
    head.x += gameState.direction.x;
    head.y += gameState.direction.y;

    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT ||
        gameState.snake.some(s => s.x === head.x && s.y === head.y)) {
        return gameOver();
    }

    gameState.snake.unshift(head);
    
    
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10;
        generateFood();
        createParticles(head.x * GRID_SIZE, head.y * GRID_SIZE, colors.food);
    }
    
    else if (gameState.food2 && head.x === gameState.food2.x && head.y === gameState.food2.y) {
        gameState.score += 15; 
        generateSecondFood();
        createParticles(head.x * GRID_SIZE, head.y * GRID_SIZE, colors.food2);
    } else {
        gameState.snake.pop();
    }
    updateDisplay();
}

function generateFood() {
// ... (seu código generateFood sem alterações)
    do {
        gameState.food = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
    } while (gameState.snake.some(s => s.x === gameState.food.x && s.y === gameState.food.y) ||
             (gameState.food2 && gameState.food.x === gameState.food2.x && gameState.food.y === gameState.food2.y));
}

function generateSecondFood() {
// ... (seu código generateSecondFood sem alterações)
    if (!difficultySettings[gameState.difficulty].hasTwoFruits) return;
    
    do {
        gameState.food2 = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
    } while (gameState.snake.some(s => s.x === gameState.food2.x && s.y === gameState.food2.y) ||
             (gameState.food.x === gameState.food2.x && gameState.food.y === gameState.food2.y));
}

function createParticles(x, y, color) {
// ... (seu código createParticles sem alterações)
    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.style.position = 'fixed';
        p.style.left = (canvas.offsetLeft + x + 10) + 'px';
        p.style.top = (canvas.offsetTop + y + 10) + 'px';
        p.style.width = '4px';
        p.style.height = '4px';
        p.style.background = color || '#ffeb3b';
        p.style.borderRadius = '50%';
        p.style.pointerEvents = 'none';
        p.style.zIndex = '1000';

        const angle = (i / 8) * Math.PI * 2;
        const vx = Math.cos(angle) * 50;
        const vy = Math.sin(angle) * 50;
        p.style.animation = `particle-${i} 0.8s ease-out forwards`;
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particle-${i} {
                0% { transform: translate(0,0) scale(1); opacity:1; }
                100% { transform: translate(${vx}px,${vy}px) scale(0); opacity:0; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(p);
        setTimeout(() => { p.remove(); style.remove(); }, 800);
    }
}

function gameLoop() {
    if (!gameState.isRunning || gameState.isPaused) return;
    moveSnake();
    drawGame();
}

function startCountdown() {
// ... (seu código startCountdown sem alterações)
    const overlay = document.createElement('div');
    overlay.id = 'countdownOverlay';
    overlay.innerHTML = `<div class="countdown-content"><h2 id="countdownText">O jogo começará em 3...</h2></div>`;
    document.body.appendChild(overlay);
    let c = 3;
    const txt = document.getElementById('countdownText');
    const timer = setInterval(() => {
        c--;
        if (c > 0) txt.textContent = `O jogo começará em ${c}...`;
        else {
            clearInterval(timer);
            overlay.remove();
            startGame();
        }
    }, 1000);
}

function startGame() {
// ... (seu código startGame sem alterações)
    gameState.isRunning = true;
    gameState.isPaused = false;
    document.getElementById('pauseBtn').disabled = false;
    gameState.gameLoop = setInterval(gameLoop, gameState.speed);
}

function pauseGame() {
// ... (seu código pauseGame sem alterações)
    if (!gameState.isRunning) return;
    gameState.isPaused = !gameState.isPaused;
    const pauseOverlay = document.getElementById('pauseOverlay');
    pauseOverlay.style.display = gameState.isPaused ? 'flex' : 'none';
}

function resumeGame() {
// ... (seu código resumeGame sem alterações)
    gameState.isPaused = false;
    document.getElementById('pauseOverlay').style.display = 'none';
}

function gameOver() {
    gameState.isRunning = false;
    clearInterval(gameState.gameLoop);
    document.getElementById('pauseBtn').disabled = true;

    // Verifica e salva o High Score Local
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('snakeHighScore', gameState.highScore);
    }

    // --- NOVA LÓGICA DE PLACAR GLOBAL ---
    const finalScore = gameState.score;
    let finalMessage = `Pontuação Final: ${finalScore}`;

    const currentUser = getCurrentUser(); // Pega o usuário logado

    if (currentUser) {
        updateTotalScore(currentUser, finalScore);
        finalMessage += ` (Adicionou ${finalScore} pontos ao High Score Global!)`;
    } else {
        finalMessage += ` (Faça login no Menu para pontuar no High Score!)`;
    }
    // --- FIM LÓGICA PLACAR GLOBAL ---
    
    document.getElementById('finalScore').textContent = finalMessage;
    document.getElementById('gameOverModal').style.display = 'flex';
}

function restartGame() {
// ... (seu código restartGame sem alterações)
    clearInterval(gameState.gameLoop);
    gameState = {
        snake: [{ x: 10, y: 10 }],
        direction: { x: 1, y: 0 },
        food: { x: 15, y: 15 },
        food2: null,
        score: 0,
        highScore: gameState.highScore,
        isRunning: false,
        isPaused: false,
        gameLoop: null,
        speed: 150,
        difficulty: null,
        difficultyName: '-'
    };
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('pauseBtn').disabled = true;
    generateFood();
    updateDisplay();
    drawGame();
   
    document.getElementById('difficultyOverlay').style.display = 'flex';
}

function updateDisplay() {
// ... (seu código updateDisplay sem alterações)
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('highScore').textContent = gameState.highScore;
    document.getElementById('length').textContent = gameState.snake.length;
    document.getElementById('difficulty').textContent = gameState.difficultyName;
}

function returnToMenu() {
// ... (seu código returnToMenu sem alterações)
    window.location.href = 'menu.html';
}

document.addEventListener('keydown', e => {
// ... (seu código keydown sem alterações)
    if (!gameState.isRunning || gameState.isPaused) return;
    const d = gameState.direction;
    switch (e.code) {
        case 'ArrowUp':
        case 'KeyW': if (d.y === 0) gameState.direction = { x: 0, y: -1 }; break;
        case 'ArrowDown':
        case 'KeyS': if (d.y === 0) gameState.direction = { x: 0, y: 1 }; break;
        case 'ArrowLeft':
        case 'KeyA': if (d.x === 0) gameState.direction = { x: -1, y: 0 }; break;
        case 'ArrowRight':
        case 'KeyD': if (d.x === 0) gameState.direction = { x: 1, y: 0 }; break;
        case 'Space': pauseGame(); break;
    }
});

initGame();