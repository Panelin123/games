// === CONFIGURAÇÕES INICIAIS DO JOGO ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let lastTime = 0;
let gameTime = 0;
let keys = {};

// Adicionando evento para capturar as teclas pressionadas
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

// === PERSONAGEM ===
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    speed: 5,
    vx: 0,
    vy: 0,
    jumpSpeed: -10,
    gravity: 0.5,
    onGround: false,
    canFly: true,
    flyDuration: 3000, // 3 segundos de voo
    flyingTime: 0,
    isFlying: false,
    health: 100
};

// Função de atualização do jogador
function updatePlayer(deltaTime) {
    if (keys["ArrowLeft"]) player.vx = -player.speed;
    else if (keys["ArrowRight"]) player.vx = player.speed;
    else player.vx = 0;

    if (keys["b"] && player.onGround) {
        player.vy = player.jumpSpeed;
        player.onGround = false;
    }

    if (keys["c"] && player.canFly && !player.isFlying) {
        player.isFlying = true;
        player.flyingTime = gameTime;
    }

    if (!player.onGround) player.vy += player.gravity;

    if (player.y >= canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.onGround = true;
        player.vy = 0;
    }

    player.x += player.vx;
    player.y += player.vy;
}

// Função de renderização do jogador
function drawPlayer() {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// === ESPADA (ATAQUE) ===
let sword = {
    width: 30,
    height: 10,
    damage: 3,
    isAttacking: false,
    attackDuration: 200, // 200ms de ataque
    attackTime: 0
};

// Função de ataque
function updateSword(deltaTime) {
    if (keys["a"] && !sword.isAttacking) {
        sword.isAttacking = true;
        sword.attackTime = gameTime;
    }

    if (sword.isAttacking && gameTime - sword.attackTime <= sword.attackDuration) {
        // Verificar colisão com inimigos aqui
    } else {
        sword.isAttacking = false;
    }
}

function drawSword() {
    if (sword.isAttacking) {
        ctx.fillStyle = "#ff0"; // Cor da espada
        ctx.fillRect(player.x + player.width, player.y + player.height / 2 - sword.height / 2, sword.width, sword.height);
    }
}

// === INIMIGOS ===
let enemies = [
    {
        x: 300,
        y: 300,
        width: 40,
        height: 40,
        health: 10,
        speed: 2
    },
    // Adicione mais inimigos conforme necessário
];

// Função de atualização dos inimigos
function updateEnemies(deltaTime) {
    enemies.forEach(enemy => {
        enemy.x += enemy.speed;
        // Adicione lógica de IA de movimento
    });
}

// Função de renderização dos inimigos
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// === GAME LOOP ===
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    gameTime += deltaTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateGame(deltaTime);
    drawGame();

    requestAnimationFrame(gameLoop);
}

// Função de atualização do jogo
function updateGame(deltaTime) {
    updatePlayer(deltaTime);
    updateSword(deltaTime);
    updateEnemies(deltaTime);
}

// Função de renderização do jogo
function drawGame() {
    drawPlayer();
    drawSword();
    drawEnemies();
}

// Iniciar o loop do jogo
requestAnimationFrame(gameLoop);
