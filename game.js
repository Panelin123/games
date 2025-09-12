const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const PLAYER_SPEED = 5;
const PLATFORM_COLOR = '#2d3748';

let gameState = {
    isRunning: false,
    camera: { x: 0, y: 0 },
    keys: {},
    particles: [],
    gameStarted: false,
    backgroundOffset: 0
};

let player = {
    x: 100,
    y: 400,
    width: 30,
    height: 40,
    vx: 0,
    vy: 0,
    health: 20,
    maxHealth: 20,
    onGround: false,
    crouching: false,
    invulnerable: false,
    invulnerableTime: 0,
    facing: 1
};

let stinger = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    active: false,
    onGround: false,
    canPickup: false
};

let boss = {
    x: 700,
    y: 350,
    width: 80,
    height: 80,
    health: 30,
    maxHealth: 30,
    vx: 0,
    vy: 0,
    onGround: false,
    direction: -1,
    lastSpawn: 0,
    invulnerable: false,
    invulnerableTime: 0,
    attackCooldown: 0,
    jumpCooldown: 0
};

let enemies = [];
let platforms = [];




function initPlatforms() {
    platforms = [
       
        { x: 0, y: 550, width: 1000, height: 50 },
       
        { x: 200, y: 450, width: 150, height: 20 },
        { x: 450, y: 380, width: 120, height: 20 },
        { x: 650, y: 320, width: 180, height: 20 },
        { x: 100, y: 280, width: 100, height: 20 },
        { x: 750, y: 480, width: 150, height: 20 },
      
        { x: -50, y: 0, width: 50, height: 600 },
        { x: 1000, y: 0, width: 50, height: 600 }
    ];
}


function initGame() {
    initPlatforms();
    enemies = [];
    gameState.particles = [];
    resetPlayer();
    resetBoss();
    resetStinger();
    updateUI();
}

function resetPlayer() {
    player.x = 100;
    player.y = 400;
    player.vx = 0;
    player.vy = 0;
    player.health = player.maxHealth;
    player.onGround = false;
    player.crouching = false;
    player.invulnerable = false;
    player.facing = 1;
}

function resetBoss() {
    boss.x = 700;
    boss.y = 350;
    boss.health = boss.maxHealth;
    boss.vx = 0;
    boss.vy = 0;
    boss.onGround = false;
    boss.direction = -1;
    boss.lastSpawn = 0;
    boss.invulnerable = false;
    boss.attackCooldown = 0;
    boss.jumpCooldown = 0;
    document.getElementById('bossHealth').style.display = 'block';
}

function resetStinger() {
    stinger.active = false;
    stinger.onGround = false;
    stinger.canPickup = false;
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    gameState.gameStarted = true;
    gameState.isRunning = true;
    initGame();
    gameLoop();
}

function gameLoop() {
    if (!gameState.isRunning) return;
    
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    updatePlayer();
    updateBoss();
    updateEnemies();
    updateStinger();
    updateParticles();
    checkCollisions();
    updateUI();
    
    gameState.backgroundOffset += 0.5;
    if (gameState.backgroundOffset > 1000) gameState.backgroundOffset = 0;
    
    
    if (boss.health <= 0) {
        victory();
    }
    
    if (player.health <= 0) {
        gameOver();
    }
}

function updatePlayer() {

    if (gameState.keys['ArrowLeft']) {
        player.vx = -PLAYER_SPEED;
        player.facing = -1;
    } else if (gameState.keys['ArrowRight']) {
        player.vx = PLAYER_SPEED;
        player.facing = 1;
    } else {
        player.vx *= 0.8; 
    }
    
    
    if (gameState.keys['ArrowUp'] && player.onGround) {
        player.vy = JUMP_FORCE;
        player.onGround = false;
    }
    
   
    player.crouching = gameState.keys['ArrowDown'] && player.onGround;

    player.vy += GRAVITY;
    

    player.x += player.vx;
    player.y += player.vy;
    

    checkPlatformCollisions(player);
    
  
    if (player.invulnerable) {
        player.invulnerableTime--;
        if (player.invulnerableTime <= 0) {
            player.invulnerable = false;
        }
    }
}

function updateBoss() {
    
    const distanceToPlayer = Math.abs(boss.x - player.x);
    
    
    if (boss.attackCooldown > 0) boss.attackCooldown--;
    if (boss.jumpCooldown > 0) boss.jumpCooldown--;
    
    if (distanceToPlayer > 150) {
       
        if (boss.x < player.x) {
            boss.vx = Math.min(boss.vx + 0.3, 3);
            boss.direction = 1;
        } else {
            boss.vx = Math.max(boss.vx - 0.3, -3);
            boss.direction = -1;
        }
        
       
        if (boss.onGround && boss.jumpCooldown <= 0 && Math.random() < 0.02) {
            boss.vy = JUMP_FORCE * 0.8;
            boss.jumpCooldown = 180;
        }
    } else {
        boss.vx *= 0.7;
        
      
        if (boss.attackCooldown <= 0 && Math.random() < 0.01) {
            boss.vx = boss.direction * 8;
            boss.attackCooldown = 120;
            createParticles(boss.x + boss.width/2, boss.y + boss.height, '#ff4444');
        }
    }
    
    
    if (Date.now() - boss.lastSpawn > 2500) { 
        spawnEnemy();
        boss.lastSpawn = Date.now();
    }
    
  
    boss.vy += GRAVITY;
    
    
    boss.x += boss.vx;
    boss.y += boss.vy;
    
    checkPlatformCollisions(boss);
    
   
    if (boss.invulnerable) {
        boss.invulnerableTime--;
        if (boss.invulnerableTime <= 0) {
            boss.invulnerable = false;
        }
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        const distanceToPlayer = Math.abs(enemy.x - player.x);
        
        if (enemy.type === 'crawler') {
            
            if (enemy.x < player.x) {
                enemy.vx = 2;
            } else {
                enemy.vx = -2;
            }
        } else if (enemy.type === 'jumper') {
            
            if (enemy.onGround && distanceToPlayer < 200 && Math.random() < 0.03) {
                enemy.vy = JUMP_FORCE * 0.6;
                enemy.vx = (player.x > enemy.x) ? 3 : -3;
            }
            enemy.vx *= 0.95;
        } else if (enemy.type === 'spitter') {
           
            if (distanceToPlayer < 250 && enemy.attackCooldown <= 0) {
                spawnProjectile(enemy.x + enemy.width/2, enemy.y + enemy.height/2, player.x, player.y);
                enemy.attackCooldown = 120;
            }
            if (enemy.attackCooldown > 0) enemy.attackCooldown--;
            enemy.vx *= 0.8;
        }
        
        
        enemy.vy += GRAVITY;
        
  
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        

        checkPlatformCollisions(enemy);
        
   
        if (enemy.x < -100 || enemy.x > 1100 || enemy.y > 700) {
            enemies.splice(i, 1);
        }
    }
}

function updateStinger() {
    if (stinger.active) {
        stinger.vy += GRAVITY * 0.5; 
        stinger.x += stinger.vx;
        stinger.y += stinger.vy;
        
        
        platforms.forEach(platform => {
            if (checkCollision(stinger, platform)) {
                stinger.vy = 0;
                stinger.vx *= 0.5;
                stinger.onGround = true;
                stinger.canPickup = true;
            }
        });
        
        
        if (stinger.x < -50 || stinger.x > 1050 || stinger.y > 650) {
            resetStinger();
        }
    }
}

function updateParticles() {
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const particle = gameState.particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; 
        particle.life--;
        particle.alpha = particle.life / particle.maxLife;
        
        if (particle.life <= 0) {
            gameState.particles.splice(i, 1);
        }
    }
}

function checkPlatformCollisions(entity) {
    entity.onGround = false;
    
    platforms.forEach(platform => {
        if (checkCollision(entity, platform)) {
            
            if (entity.vy > 0 && entity.y < platform.y) {
                entity.y = platform.y - entity.height;
                entity.vy = 0;
                entity.onGround = true;
            }
            
            else if (entity.vy < 0 && entity.y > platform.y) {
                entity.y = platform.y + platform.height;
                entity.vy = 0;
            }
            
            else if (entity.vx > 0 && entity.x < platform.x) {
                entity.x = platform.x - entity.width;
                entity.vx = 0;
            }
            else if (entity.vx < 0 && entity.x > platform.x) {
                entity.x = platform.x + platform.width;
                entity.vx = 0;
            }
        }
    });
}

function checkCollisions() {
    
    if (stinger.active && stinger.canPickup) {
        if (checkCollision(player, stinger)) {
            resetStinger();
        }
    }
    
    
    if (stinger.active) {
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (checkCollision(stinger, enemies[i])) {
                createParticles(enemies[i].x + enemies[i].width/2, enemies[i].y + enemies[i].height/2, '#ff6b6b');
                enemies.splice(i, 1);
                resetStinger();
                break;
            }
        }
        
      
        if (checkCollision(stinger, boss) && !boss.invulnerable) {
            boss.health = Math.max(0, boss.health - 2);
            boss.invulnerable = true;
            boss.invulnerableTime = 60;
            createParticles(boss.x + boss.width/2, boss.y + boss.height/2, '#ff6b6b');
            resetStinger();
        }
    }
    
  
    if (!player.invulnerable) {
        enemies.forEach(enemy => {
            if (checkCollision(player, enemy)) {
                player.health = Math.max(0, player.health - 1);
                player.invulnerable = true;
                player.invulnerableTime = 120;
                createParticles(player.x + player.width/2, player.y + player.height/2, '#ff4444');
            }
        });
        
        
        if (checkCollision(player, boss)) {
            player.health = Math.max(0, player.health - 1);
            player.invulnerable = true;
            player.invulnerableTime = 120;
            createParticles(player.x + player.width/2, player.y + player.height/2, '#ff4444');
        }
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function spawnEnemy() {
    const types = ['crawler', 'jumper', 'spitter'];
    const type = types[Math.floor(Math.random() * types.length)];
    const side = Math.random() < 0.5 ? -50 : 1050;
    
    const enemy = {
        x: side,
        y: 300,
        width: 25,
        height: 25,
        vx: 0,
        vy: 0,
        onGround: false,
        type: type,
        attackCooldown: 0,
        animationFrame: 0
    };
    
    enemies.push(enemy);
}

function spawnProjectile(fromX, fromY, toX, toY) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const speed = 4;
    
    enemies.push({
        x: fromX,
        y: fromY,
        width: 8,
        height: 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        onGround: false,
        type: 'projectile',
        life: 180
    });
}

function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        gameState.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30,
            maxLife: 30,
            alpha: 1,
            color: color
        });
    }
}

function render() {
    
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    drawBackground();
    
    
    drawPlatforms();
    
    
    drawPlayer();
    drawBoss();
    drawEnemies();
    drawStinger();
    drawParticles();
}

function drawBackground() {
   
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    ctx.fillStyle = 'rgba(30, 30, 60, 0.6)';
    for (let i = 0; i < 5; i++) {
        const x = (i * 200) - (gameState.backgroundOffset * 0.2) % 200;
        const height = 150 + Math.sin(gameState.backgroundOffset * 0.01 + i) * 20;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x + 50, canvas.height - height);
        ctx.lineTo(x + 150, canvas.height - height + 30);
        ctx.lineTo(x + 200, canvas.height);
        ctx.closePath();
        ctx.fill();
    }
    
    
    ctx.fillStyle = 'rgba(100, 100, 150, 0.1)';
    for (let i = 0; i < 3; i++) {
        const x = (i * 300) - (gameState.backgroundOffset * 0.5) % 300;
        const y = 200 + Math.sin(gameState.backgroundOffset * 0.005 + i) * 50;
        ctx.beginPath();
        ctx.ellipse(x, y, 150, 30, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 100; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 73) % (canvas.height * 0.6);
        const flicker = Math.sin(gameState.backgroundOffset * 0.05 + i) * 0.5 + 0.5;
        ctx.globalAlpha = flicker;
        ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
}

function drawPlatforms() {
    platforms.forEach(platform => {
        if (platform.x >= -50 && platform.x <= 1050) {
            
            ctx.fillStyle = PLATFORM_COLOR;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            ctx.fillStyle = '#4a5568';
            ctx.fillRect(platform.x, platform.y, platform.width, 3);
            
            
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            for (let i = 0; i < platform.width; i += 20) {
                ctx.fillRect(platform.x + i, platform.y + 5, 1, platform.height - 5);
            }
        }
    });
}

function drawPlayer() {
    const alpha = player.invulnerable && Math.floor(Date.now() / 100) % 2 ? 0.5 : 1;
    ctx.globalAlpha = alpha;
    
    
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.ellipse(player.x + player.width/2, player.y + player.height + 5, player.width/2, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
   
    ctx.fillStyle = '#4a5568';
    const bodyHeight = player.crouching ? 25 : 30;
    const bodyY = player.crouching ? player.y + 15 : player.y + 10;
    const cape = Math.sin(Date.now() * 0.01) * 2;
    ctx.fillRect(player.x + 5, bodyY, 20, bodyHeight);
    ctx.fillRect(player.x + 3 + cape, bodyY + 5, 24, bodyHeight - 10);
    
    
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(player.x + 15, player.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    
   
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(player.x + 12, player.y + 7, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 18, player.y + 7, 2, 0, Math.PI * 2);
    ctx.fill();
    
   
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 3;
    const swordX = player.facing === 1 ? player.x + 25 : player.x + 5;
    ctx.beginPath();
    ctx.moveTo(swordX, player.y + 15);
    ctx.lineTo(swordX + (player.facing * 12), player.y + 25);
    ctx.stroke();
    
    
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.globalAlpha = 1;
}

function drawBoss() {
    if (boss.health <= 0) return;
    
    const alpha = boss.invulnerable && Math.floor(Date.now() / 100) % 2 ? 0.5 : 1;
    ctx.globalAlpha = alpha;
    
    
    ctx.fillStyle = 'rgba(139,0,0,0.4)';
    ctx.ellipse(boss.x + boss.width/2, boss.y + boss.height + 8, boss.width/2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
 
    const pulse = Math.sin(Date.now() * 0.02) * 3;
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(boss.x - pulse/2, boss.y - pulse/2, boss.width + pulse, boss.height + pulse);
    
    
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(boss.x + 10, boss.y + 10, boss.width - 20, 20);
    ctx.fillRect(boss.x + 20, boss.y + 40, boss.width - 40, 20);
    
    
    ctx.fillStyle = '#660000';
    for (let i = 0; i < 4; i++) {
        const spikeX = boss.x + 15 + (i * 15);
        ctx.beginPath();
        ctx.moveTo(spikeX, boss.y);
        ctx.lineTo(spikeX + 5, boss.y - 10);
        ctx.lineTo(spikeX + 10, boss.y);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.fillRect(boss.x + 20, boss.y + 15, 8, 8);
    ctx.fillRect(boss.x + boss.width - 28, boss.y + 15, 8, 8);
    ctx.shadowBlur = 0;
    
    
    if (boss.attackCooldown > 0) {
        ctx.strokeStyle = 'rgba(255,68,68,0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(boss.x - 5, boss.y - 5, boss.width + 10, boss.height + 10);
        ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
}

function drawEnemies() {
    enemies.forEach(enemy => {
        enemy.animationFrame = (enemy.animationFrame || 0) + 1;
        
        if (enemy.type === 'projectile') {
            
            ctx.fillStyle = '#ff6600';
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            return;
        }
        
        
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.ellipse(enemy.x + enemy.width/2, enemy.y + enemy.height + 3, enemy.width/2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        if (enemy.type === 'crawler') {
            
            ctx.fillStyle = '#663366';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            
            ctx.strokeStyle = '#441144';
            ctx.lineWidth = 2;
            const legOffset = Math.sin(enemy.animationFrame * 0.3) * 3;
            for (let i = 0; i < 4; i++) {
                const legY = enemy.y + 5 + (i * 4);
                ctx.beginPath();
                ctx.moveTo(enemy.x, legY);
                ctx.lineTo(enemy.x - 8 + legOffset, legY + 5);
                ctx.moveTo(enemy.x + enemy.width, legY);
                ctx.lineTo(enemy.x + enemy.width + 8 - legOffset, legY + 5);
                ctx.stroke();
            }
            
        } else if (enemy.type === 'jumper') {
            
            ctx.fillStyle = '#336633';
            const jumpStretch = enemy.onGround ? 0 : 5;
            ctx.fillRect(enemy.x, enemy.y - jumpStretch, enemy.width, enemy.height + jumpStretch);
            
            
            ctx.fillStyle = '#225522';
            ctx.fillRect(enemy.x - 3, enemy.y + enemy.height - 8, 6, 8);
            ctx.fillRect(enemy.x + enemy.width - 3, enemy.y + enemy.height - 8, 6, 8);
            
        } else if (enemy.type === 'spitter') {

            ctx.fillStyle = '#664466';
            const slimeStretch = Math.sin(enemy.animationFrame * 0.1) * 2;
            ctx.fillRect(enemy.x, enemy.y, enemy.width + slimeStretch, enemy.height);
            
            
            ctx.strokeStyle = '#443344';
            ctx.lineWidth = 2;
            const tentacleWave = Math.sin(enemy.animationFrame * 0.2) * 4;
            ctx.beginPath();
            ctx.moveTo(enemy.x + enemy.width/2, enemy.y);
            ctx.lineTo(enemy.x + enemy.width/2 + tentacleWave, enemy.y - 8);
            ctx.moveTo(enemy.x + enemy.width/2 + 5, enemy.y);
            ctx.lineTo(enemy.x + enemy.width/2 + 5 - tentacleWave, enemy.y - 6);
            ctx.stroke();
        }
        
       
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(enemy.x + 5, enemy.y + 3, 3, 3);
        ctx.fillRect(enemy.x + enemy.width - 8, enemy.y + 3, 3, 3);
    });
}

function drawStinger() {
    if (!stinger.active) return;
    
    
    ctx.strokeStyle = 'rgba(192,192,192,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(stinger.x - stinger.vx, stinger.y - stinger.vy);
    ctx.lineTo(stinger.x, stinger.y);
    ctx.stroke();
    
    
    ctx.fillStyle = '#c0c0c0';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = stinger.canPickup ? 8 : 3;
    ctx.beginPath();
    ctx.arc(stinger.x, stinger.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
  
    if (stinger.canPickup) {
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 2;
        const pulseSize = 6 + Math.sin(Date.now() * 0.02) * 2;
        ctx.beginPath();
        ctx.arc(stinger.x, stinger.y, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawParticles() {
    gameState.particles.forEach(particle => {
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 3, 3);
    });
    ctx.globalAlpha = 1;
}

function updateUI() {
    
    const healthPercentage = player.health / player.maxHealth;
    document.getElementById('healthFill').style.width = (healthPercentage * 100) + '%';
    document.getElementById('healthText').textContent = `${player.health}/${player.maxHealth}`;
    
    
    if (boss.health > 0) {
        const bossHealthPercentage = boss.health / boss.maxHealth;
        document.getElementById('bossHealthFill').style.width = (bossHealthPercentage * 100) + '%';
        document.getElementById('bossHealthText').textContent = `${boss.health}/${boss.maxHealth}`;
    }
}

function victory() {
    gameState.isRunning = false;
    document.getElementById('bossHealth').style.display = 'none';
    
  
    playVictorySound();
    
    setTimeout(() => {
        document.getElementById('victoryModal').style.display = 'flex';
    }, 500);
}

function gameOver() {
    gameState.isRunning = false;
    document.getElementById('bossHealth').style.display = 'none';
    
    setTimeout(() => {
        document.getElementById('gameOverModal').style.display = 'flex';
    }, 500);
}

function restartGame() {
    
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('victoryModal').style.display = 'none';
    

    gameState.isRunning = true;
    gameState.backgroundOffset = 0;
    
    
    initGame();
    
    
    if (gameState.isRunning) {
        gameLoop();
    }
}

function playVictorySound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
        
        notes.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + index * 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.2 + 0.3);
            
            oscillator.start(audioContext.currentTime + index * 0.2);
            oscillator.stop(audioContext.currentTime + index * 0.2 + 0.3);
        });
    } catch (error) {
        console.log('Áudio não disponível');
    }
}


document.addEventListener('keydown', (e) => {
    gameState.keys[e.code] = true;
    
    if (!gameState.isRunning) return;
    

    if (e.code === 'KeyA' && !stinger.active) {
        stinger.x = player.x + (player.facing === 1 ? 25 : 5);
        stinger.y = player.y + 15;
        stinger.vx = player.facing * 8;
        stinger.vy = -2;
        stinger.active = true;
        stinger.onGround = false;
        stinger.canPickup = false;
    }
    
   
    if (e.code === 'KeyB') {
        const stab = {
            x: player.x + (player.facing === 1 ? 25 : -15),
            y: player.y + 10,
            width: 20,
            height: 15
        };
        
      
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (checkCollision(stab, enemies[i])) {
                createParticles(enemies[i].x + enemies[i].width/2, enemies[i].y + enemies[i].height/2, '#ff6b6b');
                enemies.splice(i, 1);
            }
        }
        
        
        if (checkCollision(stab, boss) && !boss.invulnerable) {
            boss.health = Math.max(0, boss.health - 3);
            boss.invulnerable = true;
            boss.invulnerableTime = 60;
            createParticles(boss.x + boss.width/2, boss.y + boss.height/2, '#ff6b6b');
        }
        
        
        createParticles(stab.x, stab.y, '#4727b8ff');
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.code] = false;
});

initGame();
