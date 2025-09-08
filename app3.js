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
    score: 0,
    highScore: localStorage.getItem('snakeHighScore') || 0,
    isRunning: false,
    isPaused: false,
    gameLoop: null
};


const colors = {
    snake: '#4caf50',
    snakeHead: '#2e7d32',
    food: '#ff5722',
    background: '#1a1a2e',
    grid: 'rgba(255,255,255,0.1)'
};

function initGame() {
    updateDisplay();
    drawGame();
}

function drawGame() {
    
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    
    drawGrid();

  
    drawSnake();

    
    drawFood();
}

function drawGrid() {
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    
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
    gameState.snake.forEach((segment, index) => {
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        
        
        if (index === 0) {
            ctx.fillStyle = colors.snakeHead;
            ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
            
            
            ctx.fillStyle = '#fff';
            ctx.fillRect(x + 6, y + 6, 3, 3);
            ctx.fillRect(x + 11, y + 6, 3, 3);
        } else {
            
            const opacity = 1 - (index * 0.05);
            ctx.fillStyle = colors.snake;
            ctx.globalAlpha = Math.max(opacity, 0.3);
            ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
            ctx.globalAlpha = 1;
        }
    });
}

function drawFood() {
    const x = gameState.food.x * GRID_SIZE;
    const y = gameState.food.y * GRID_SIZE;
    
  
    const pulseSize = 2 + Math.sin(Date.now() * 0.01) * 1;
    ctx.fillStyle = colors.food;
    ctx.fillRect(x + pulseSize, y + pulseSize, GRID_SIZE - pulseSize * 2, GRID_SIZE - pulseSize * 2);
    

    ctx.fillStyle = '#ffab00';
    ctx.fillRect(x + 6, y + 6, 8, 8);
}

function moveSnake() {
    const head = { ...gameState.snake[0] };
    head.x += gameState.direction.x;
    head.y += gameState.direction.y;

    
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        gameOver();
        return;
    }

    
    if (gameState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    gameState.snake.unshift(head);

    
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10;
        generateFood();
        createParticles(head.x * GRID_SIZE, head.y * GRID_SIZE);
    } else {
        gameState.snake.pop();
    }

    updateDisplay();
}

function generateFood() {
    do {
        gameState.food = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
    } while (gameState.snake.some(segment => 
        segment.x === gameState.food.x && segment.y === gameState.food.y
    ));
}

function createParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = (canvas.offsetLeft + x + 10) + 'px';
        particle.style.top = (canvas.offsetTop + y + 10) + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#ffeb3b';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        const angle = (i / 8) * Math.PI * 2;
        const velocity = 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particle.style.animation = `particle-${i} 0.8s ease-out forwards`;
        
        const keyframes = `
            @keyframes particle-${i} {
                0% { transform: translate(0, 0) scale(1); opacity: 1; }
                100% { transform: translate(${vx}px, ${vy}px) scale(0); opacity: 0; }
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
            style.remove();
        }, 800);
    }
}

function gameLoop() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    moveSnake();
    drawGame();
}

function startGame() {
    if (gameState.isRunning) return;
    
    gameState.isRunning = true;
    gameState.isPaused = false;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    
    gameState.gameLoop = setInterval(gameLoop, 150);
}

function pauseGame() {
    if (!gameState.isRunning) return;
    
    gameState.isPaused = !gameState.isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    const pauseOverlay = document.getElementById('pauseOverlay');
    
    if (gameState.isPaused) {
        pauseBtn.textContent = '▶️ Continuar';
        pauseOverlay.style.display = 'flex';
    } else {
        pauseBtn.textContent = '⏸️ Pausar';
        pauseOverlay.style.display = 'none';
    }
}

function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pauseBtn').textContent = '⏸️ Pausar';
    document.getElementById('pauseOverlay').style.display = 'none';
}

function gameOver() {
    gameState.isRunning = false;
    clearInterval(gameState.gameLoop);
    
 
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('snakeHighScore', gameState.highScore);
        updateDisplay();
    }
    
   
    document.getElementById('finalScore').textContent = `Pontuação Final: ${gameState.score}`;
    document.getElementById('gameOverModal').style.display = 'flex';
}

function restartGame() {
    clearInterval(gameState.gameLoop);
    
    gameState = {
        snake: [{ x: 10, y: 10 }],
        direction: { x: 1, y: 0 },
        food: { x: 15, y: 15 },
        score: 0,
        highScore: gameState.highScore,
        isRunning: false,
        isPaused: false,
        gameLoop: null
    };
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = '⏸️ Pausar';
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('pauseOverlay').style.display = 'none';
    
    generateFood();
    updateDisplay();
    drawGame();
}

function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('highScore').textContent = gameState.highScore;
    document.getElementById('length').textContent = gameState.snake.length;
}

// Controles do teclado
document.addEventListener('keydown', (e) => {
    if (!gameState.isRunning || gameState.isPaused) {
        if (e.code === 'Space') {
            e.preventDefault();
            if (gameState.isPaused) {
                resumeGame();
            } else if (!gameState.isRunning) {
                startGame();
            }
        }
        return;
    }

    const key = e.code;
    const currentDir = gameState.direction;

    switch (key) {
        case 'ArrowUp':
        case 'KeyW':
            if (currentDir.y === 0) {
                gameState.direction = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (currentDir.y === 0) {
                gameState.direction = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (currentDir.x === 0) {
                gameState.direction = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (currentDir.x === 0) {
                gameState.direction = { x: 1, y: 0 };
            }
            break;
        case 'Space':
            e.preventDefault();
            pauseGame();
            break;
    }
});


initGame();