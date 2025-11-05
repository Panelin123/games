// Variáveis globais
let dificuldadeAtual = '';
let errosEncontrados = 0;
let pontuacaoTotal = 0;
let tempoInicio;
let timerInterval;
let jogoAtivo = false;

// Constante de penalidade
const penalidadePorErro = 100; // cada erro não encontrado diminui a pontuação

// Elementos do DOM
const telaInicio = document.getElementById('tela-inicio');
const jogo = document.getElementById('jogo');
const telaResultado = document.getElementById('tela-resultado');
const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

// Configuração dos erros por dificuldade
const fases = {
    facil: {
        erros: [
            { x: 50,  y: 280, raio: 30 },   // Listra da toalha
            { x: 160, y: 110, raio: 25 },   // Falta de cabelo
            { x: 160, y: 280, raio: 25 },   // Sabonete ausente
            { x: 550, y: 270, raio: 30 },   // Falta do quadrinho/livro no banco roxo
            { x: 230, y: 370, raio: 25 },   // Falta do cano da pia
            { x: 410, y: 390, raio: 30 },   // Falta da perna do banco
            { x: 340, y: 250, raio: 25 }
        ],
        encontrados: []
    },
    medio: {
        erros: [
            { x: 320, y: 70, raio: 28 }, //olho do passaaro
            { x: 515, y: 70, raio: 25 }, //iglu 
            { x: 340, y: 260, raio: 25 }, //leao marinho
            { x: 570, y: 315, raio: 25 },  //peixe
            { x: 220, y: 420, raio: 25 }, //foca
            { x: 60, y: 350, raio: 25 }, //viado
            { x: 425, y: 415, raio: 25 } //buraco
        ],
        encontrados: []
    },
    dificil: {
        erros: [
            { x: 330, y: 430, raio: 22 }, //letra A
            { x: 440, y: 390, raio: 20 }, // Cabos
            { x: 15, y: 220, raio: 24 }, // no cantinho
            { x: 155, y: 385, raio: 21 }, //dado
            { x: 270, y: 370, raio: 23 }, // entrada tv
            { x: 175, y: 190, raio: 20 }, //gola do menino de oculos
            { x: 550, y: 160, raio: 22 } //orelha cavalo
        ],
        encontrados: []
    }
};

// Event Listeners
document.querySelectorAll('.btn-dificuldade').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const dificuldade = e.currentTarget.getAttribute('data-dificuldade');
        iniciarJogo(dificuldade);
    });
});

document.getElementById('btn-proxima').addEventListener('click', proximaDificuldade);
document.getElementById('btn-menu').addEventListener('click', voltarMenu);
canvas2.addEventListener('click', verificarClique);

function iniciarJogo(dificuldade) {
    dificuldadeAtual = dificuldade;
    telaInicio.style.display = 'none';
    jogo.style.display = 'block';
    errosEncontrados = 0;
    fases[dificuldade].encontrados = [];
    
    const dificuldadeNome = {
        'facil': 'Fácil',
        'medio': 'Médio',
        'dificil': 'Difícil'
    };
    document.getElementById('dificuldade-display').textContent = dificuldadeNome[dificuldade];
    
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
    
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    
    const img1 = document.getElementById(`img-${dificuldadeAtual}-1`);
    const img2 = document.getElementById(`img-${dificuldadeAtual}-2`);
    
    if (!img1 || !img2) {
        ctx1.fillStyle = '#ff0000';
        ctx1.font = '16px Arial';
        ctx1.textAlign = 'center';
        ctx1.fillText('Imagens não encontradas no HTML!', canvas1.width / 2, canvas1.height / 2);
        console.error('Imagens não encontradas para:', dificuldadeAtual);
        return;
    }
    
    if (img1.complete && img2.complete) {
        desenharImagens(img1, img2);
    } else {
        let img1Loaded = false;
        let img2Loaded = false;
        
        img1.onload = () => {
            img1Loaded = true;
            if (img2Loaded) desenharImagens(img1, img2);
        };
        
        img2.onload = () => {
            img2Loaded = true;
            if (img1Loaded) desenharImagens(img1, img2);
        };
    }
}

function desenharImagens(img1, img2) {
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    
    ctx1.drawImage(img1, 0, 0, canvas1.width, canvas1.height);
    ctx2.drawImage(img2, 0, 0, canvas2.width, canvas2.height);
    
    desenharErrosEncontrados();
}

function desenharErrosEncontrados() {
    fases[dificuldadeAtual].encontrados.forEach(erro => {
        [ctx1, ctx2].forEach(ctx => {
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(erro.x, erro.y, erro.raio + 5, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.lineWidth = 3;
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const scaleX = canvas2.width / rect.width;
    const scaleY = canvas2.height / rect.height;
    const clickX = x * scaleX;
    const clickY = y * scaleY;
    
    const fase = fases[dificuldadeAtual];
    
    for (let i = 0; i < fase.erros.length; i++) {
        const erro = fase.erros[i];
        const distancia = Math.sqrt(Math.pow(clickX - erro.x, 2) + Math.pow(clickY - erro.y, 2));
        
        if (distancia <= erro.raio && !fase.encontrados.includes(erro)) {
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
    const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000);
    const minutos = Math.floor(tempoDecorrido / 60);
    const segundos = tempoDecorrido % 60;
    document.getElementById('timer').textContent = 
        `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function atualizarInfo() {
    document.getElementById('erros').textContent = errosEncontrados;
    document.getElementById('pontuacao').textContent = pontuacaoTotal;
}

function finalizarFase() {
    jogoAtivo = false;
    clearInterval(timerInterval);
    
    const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000);
    
    const pontosBase = Math.max(1000 - (tempoDecorrido * 10), 100);
    const errosNaoEncontrados = fases[dificuldadeAtual].erros.length - errosEncontrados;
    const pontosComPenalidade = Math.max(pontosBase - (errosNaoEncontrados * penalidadePorErro), 0);
    pontuacaoTotal += pontosComPenalidade;
    
    jogo.style.display = 'none';
    telaResultado.style.display = 'block';
    
    const minutos = Math.floor(tempoDecorrido / 60);
    const segundos = tempoDecorrido % 60;
    
    document.getElementById('titulo-resultado').textContent = '🎉 Parabéns!';
    document.getElementById('tempo-final').textContent = 
        `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    document.getElementById('pontos-fase').textContent = pontuacaoTotal;
    
    const btnProxima = document.getElementById('btn-proxima');
    
    if (dificuldadeAtual === 'facil') {
        btnProxima.style.display = 'inline-block';
        btnProxima.textContent = 'Jogar Médio';
    } else if (dificuldadeAtual === 'medio') {
        btnProxima.style.display = 'inline-block';
        btnProxima.textContent = 'Jogar Difícil';
    } else {
        btnProxima.style.display = 'none';
    }
}

function proximaDificuldade() {
    if (dificuldadeAtual === 'facil') {
        iniciarJogo('medio');
    } else if (dificuldadeAtual === 'medio') {
        iniciarJogo('dificil');
    }
    telaResultado.style.display = 'none';
}

function voltarMenu() {
    telaResultado.style.display = 'none';
    telaInicio.style.display = 'flex';
    errosEncontrados = 0;
    pontuacaoTotal = 0;
    dificuldadeAtual = '';
    document.getElementById('dificuldade-display').textContent = '-';
    document.getElementById('timer').textContent = '00:00';
    atualizarInfo();
    
    Object.keys(fases).forEach(key => {
        fases[key].encontrados = [];
    });
}

