// ============================
// SISTEMA DE PONTUAÇÃO GLOBAL (CORRIGIDO)
// ============================

function getCurrentUser() {
    return sessionStorage.getItem('currentUserInitials');
}

function updateTotalScore(gameScore) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const scoreKeyTotal = 'arcadeTotalScores';
    const scores = JSON.parse(localStorage.getItem(scoreKeyTotal) || '[]');

    const index = scores.findIndex(entry => entry.user === currentUser);

    if (index !== -1) {
        scores[index].score += gameScore;
    } else {
        scores.push({ user: currentUser, score: gameScore });
    }

    localStorage.setItem(scoreKeyTotal, JSON.stringify(scores));

    console.log(`Pontuação (+${gameScore}) salva para ${currentUser}`);
}

// ============================
// VARIÁVEIS DO JOGO
// ============================

let dificuldadeAtual = '';
let errosEncontrados = 0;
let pontuacaoTotal = 0;
let tempoInicio;
let timerInterval;
let jogoAtivo = false;

const penalidadePorErro = 100;

// ELEMENTOS DO DOM
const telaInicio = document.getElementById('tela-inicio');
const jogo = document.getElementById('jogo');
const telaResultado = document.getElementById('tela-resultado');
const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

// ============================
// CONFIGURAÇÃO DAS FASES
// ============================

const fases = {
    facil: {
        erros: [
            { x: 50,  y: 280, raio: 30 },
            { x: 160, y: 110, raio: 25 },
            { x: 160, y: 280, raio: 25 },
            { x: 550, y: 270, raio: 30 },
            { x: 230, y: 370, raio: 25 },
            { x: 410, y: 390, raio: 30 },
            { x: 340, y: 250, raio: 25 }
        ],
        encontrados: []
    },

    medio: {
        erros: [
            { x: 320, y: 70, raio: 28 },
            { x: 515, y: 70, raio: 25 },
            { x: 340, y: 260, raio: 25 },
            { x: 570, y: 315, raio: 25 },
            { x: 220, y: 420, raio: 25 },
            { x: 60,  y: 350, raio: 25 },
            { x: 425, y: 415, raio: 25 }
        ],
        encontrados: []
    },

    dificil: {
        erros: [
            { x: 330, y: 430, raio: 22 },
            { x: 440, y: 390, raio: 20 },
            { x: 15,  y: 220, raio: 24 },
            { x: 155, y: 385, raio: 21 },
            { x: 270, y: 370, raio: 23 },
            { x: 175, y: 190, raio: 20 },
            { x: 550, y: 160, raio: 22 }
        ],
        encontrados: []
    }
};

// ============================
// EVENTOS
// ============================

document.querySelectorAll('.btn-dificuldade').forEach(btn => {
    btn.addEventListener('click', e => {
        iniciarJogo(e.target.getAttribute('data-dificuldade'));
    });
});

document.getElementById('btn-proxima').addEventListener('click', proximaDificuldade);
document.getElementById('btn-menu').addEventListener('click', voltarMenu);
canvas2.addEventListener('click', verificarClique);

// Verifica login ao carregar
document.addEventListener("DOMContentLoaded", () => {
    if (!getCurrentUser()) {
        alert("⚠️ Você precisa estar logado para jogar!\nVolte ao menu e registre suas iniciais.");
    }
});

// ============================
// FUNÇÕES PRINCIPAIS DO JOGO
// ============================

function iniciarJogo(dificuldade) {
    if (!getCurrentUser()) {
        alert("❌ Você precisa estar logado para jogar!");
        voltarMenu();
        return;
    }

    dificuldadeAtual = dificuldade;
    telaInicio.style.display = "none";
    jogo.style.display = "block";

    errosEncontrados = 0;
    fases[dificuldade].encontrados = [];

    document.getElementById('dificuldade-display').textContent =
        dificuldade.charAt(0).toUpperCase() + dificuldade.slice(1);

    carregarFase();
}

function carregarFase() {
    jogoAtivo = true;
    atualizarInfo();
    carregarImagens();
    iniciarTimer();
}

function carregarImagens() {
    canvas1.width = 600;
    canvas1.height = 450;
    canvas2.width = 600;
    canvas2.height = 450;

    ctx1.clearRect(0, 0, 600, 450);
    ctx2.clearRect(0, 0, 600, 450);

    const img1 = document.getElementById(`img-${dificuldadeAtual}-1`);
    const img2 = document.getElementById(`img-${dificuldadeAtual}-2`);

    if (!img1 || !img2) {
        ctx1.fillText("Erro: imagens não encontradas", 300, 225);
        return;
    }

    img1.onload = img2.onload = () => desenharImagens(img1, img2);

    if (img1.complete && img2.complete) {
        desenharImagens(img1, img2);
    }
}

function desenharImagens(img1, img2) {
    ctx1.drawImage(img1, 0, 0, 600, 450);
    ctx2.drawImage(img2, 0, 0, 600, 450);
    desenharErrosEncontrados();
}

function desenharErrosEncontrados() {
    fases[dificuldadeAtual].encontrados.forEach(erro => {
        [ctx1, ctx2].forEach(ctx => {
            ctx.strokeStyle = "#00FF00";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(erro.x, erro.y, erro.raio + 5, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(erro.x - 12, erro.y - 12);
            ctx.lineTo(erro.x + 12, erro.y + 12);
            ctx.moveTo(erro.x + 12, erro.y - 12);
            ctx.lineTo(erro.x - 12, erro.y + 12);
            ctx.stroke();
        });
    });
}

function verificarClique(e) {
    if (!jogoAtivo) return;

    const rect = canvas2.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas2.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas2.height / rect.height);

    const fase = fases[dificuldadeAtual];

    for (let erro of fase.erros) {
        const dist = Math.hypot(clickX - erro.x, clickY - erro.y);

        if (dist <= erro.raio && !fase.encontrados.includes(erro)) {
            fase.encontrados.push(erro);
            errosEncontrados++;
            desenharErrosEncontrados();
            atualizarInfo();

            if (errosEncontrados === fase.erros.length) {
                finalizarFase();
            }
            return;
        }
    }
}

function iniciarTimer() {
    tempoInicio = Date.now();
    timerInterval = setInterval(atualizarTimer, 1000);
}

function atualizarTimer() {
    const s = Math.floor((Date.now() - tempoInicio) / 1000);
    document.getElementById("timer").textContent =
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function atualizarInfo() {
    document.getElementById("erros").textContent = `${errosEncontrados}/7`;
    document.getElementById("pontuacao").textContent = pontuacaoTotal;
}

// ============================
// FINALIZAÇÃO DA FASE
// ============================

function finalizarFase() {
    jogoAtivo = false;
    clearInterval(timerInterval);

    const tempo = Math.floor((Date.now() - tempoInicio) / 1000);

    const pontosBase = Math.max(1000 - tempo * 10, 100);
    const errosRestantes = fases[dificuldadeAtual].erros.length - errosEncontrados;
    const pontosComPenalidade = Math.max(pontosBase - errosRestantes * penalidadePorErro, 0);

    pontuacaoTotal += pontosComPenalidade;

    jogo.style.display = "none";
    telaResultado.style.display = "block";

    document.getElementById("tempo-final").textContent =
        `${String(Math.floor(tempo / 60)).padStart(2, "0")}:${String(tempo % 60).padStart(2, "0")}`;

    document.getElementById("pontos-fase").textContent = pontuacaoTotal;

    const btn = document.getElementById("btn-proxima");

    if (dificuldadeAtual === "facil") {
        btn.style.display = "inline-block";
        btn.textContent = "Jogar Médio";

    } else if (dificuldadeAtual === "medio") {
        btn.style.display = "inline-block";
        btn.textContent = "Jogar Difícil";

    } else {
        btn.style.display = "none";

        // SALVA SOMENTE A PONTUAÇÃO FINAL
        updateTotalScore(pontosComPenalidade);

        alert(`🏆 Pontuação final de ${pontuacaoTotal} salva!`);
    }
}

function proximaDificuldade() {
    iniciarJogo(
        dificuldadeAtual === "facil" ? "medio" :
        dificuldadeAtual === "medio" ? "dificil" : ""
    );

    telaResultado.style.display = "none";
}

// ============================
// VOLTAR AO MENU
// ============================

function voltarMenu() {
    jogo.style.display = "none";
    telaInicio.style.display = "flex";

    errosEncontrados = 0;
    pontuacaoTotal = 0;
    dificuldadeAtual = "";
    document.getElementById("dificuldade-display").textContent = "-";
    document.getElementById("timer").textContent = "00:00";

    Object.values(fases).forEach(f => f.encontrados = []);

    window.location.href = "menu.html";
}
