javascript
const gameArea = document.getElementById('gameArea');
const rocket = document.getElementById('rocket');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const gameOverDiv = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let lives = 3;
let rocketPos = 50;
let gameRunning = true;
let items = [];

for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 2 + 's';
    gameArea.appendChild(star);
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    if (e.key === 'ArrowLeft' && rocketPos > 10) {
        rocketPos -= 8;
    } else if (e.key === 'ArrowRight' && rocketPos < 90) {
        rocketPos += 8;
    }
    rocket.style.left = rocketPos + '%';
});

let touchStartX = 0;
gameArea.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

gameArea.addEventListener('touchmove', (e) => {
    if (!gameRunning) return;
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    
    if (diff < -10 && rocketPos > 10) {
        rocketPos -= 5;
    } else if (diff > 10 && rocketPos < 90) {
        rocketPos += 5;
    }
    rocket.style.left = rocketPos + '%';
    touchStartX = touchX;
});

function createItem() {
    if (!gameRunning) return;

    const item = document.createElement('div');
    const isObstacle = Math.random() < 0.3;
    
    if (isObstacle) {
        item.className = 'obstacle';
        item.textContent = '☄️';
    } else {
        item.className = 'collectible-star';
        item.textContent = '⭐';
    }
    
    item.style.left = Math.random() * 90 + 5 + '%';
    item.style.top = '-50px';
    gameArea.appendChild(item);
    
    items.push({
        element: item,
        isObstacle: isObstacle,
        y: -50
    });
}

function updateItems() {
    const rocketRect = rocket.getBoundingClientRect();
    
    items.forEach((item, index) => {
        item.y += 2;
        item.element.style.top = item.y + 'px';
        
        const itemRect = item.element.getBoundingClientRect();
       
        if (
            itemRect.bottom > rocketRect.top &&
            itemRect.top < rocketRect.bottom &&
            itemRect.right > rocketRect.left &&
            itemRect.left < rocketRect.right
        ) {
            if (item.isObstacle) {
                lives--;
                livesDisplay.textContent = '❤️ ' + lives;
                createExplosion(itemRect.left, itemRect.top);
                
                if (lives <= 0) {
                    endGame();
                }
            } else {
                score++;
                scoreDisplay.textContent = '⭐ ' + score;
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

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.textContent = '💥';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    gameArea.appendChild(explosion);
    
    setTimeout(() => explosion.remove(), 500);
}

function endGame() {
    gameRunning = false;

    const rocketRect = rocket.getBoundingClientRect();
    rocket.style.display = 'none';

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createExplosion(
                rocketRect.left + Math.random() * 40 - 20, 
                rocketRect.top + Math.random() * 40 - 20
            );
        }, i * 100);
    }
    
    setTimeout(() => {
        document.getElementById('finalScore').textContent = 'Você coletou ' + score + ' estrelas!';
        gameOverDiv.style.display = 'block';
    }, 600);
}

restartBtn.addEventListener('click', () => {
    score = 0;
    lives = 3;
    rocketPos = 50;
    gameRunning = true;
    
    scoreDisplay.textContent = '⭐ 0';
    livesDisplay.textContent = '❤️ 3';
    rocket.style.left = '50%';
    rocket.style.display = 'block';
    gameOverDiv.style.display = 'none';
    
    items.forEach(item => item.element.remove());
    items = [];
});

setInterval(createItem, 1500);
setInterval(updateItems, 20);
