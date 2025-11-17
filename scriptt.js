// 7erros.js - Jogo dos 7 Erros (arquivo único, completo)

// ============================
// CONFIGURAÇÕES E PONTUAÇÃO
// ============================
const SCORE_KEY_TOTAL = 'arcadeTotalScores';
const SESSION_KEY = 'currentUserInitials';

function getCurrentUser() {
  return sessionStorage.getItem(SESSION_KEY);
}

function updateTotalScore(gameScore) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const scores = JSON.parse(localStorage.getItem(SCORE_KEY_TOTAL) || '[]');
  const idx = scores.findIndex(s => s.user === currentUser);

  if (idx !== -1) {
    scores[idx].score += gameScore;
  } else {
    scores.push({ user: currentUser, score: gameScore });
  }

  localStorage.setItem(SCORE_KEY_TOTAL, JSON.stringify(scores));
  console.log(`Pontuação (+${gameScore}) salva para ${currentUser}`);
}

// ============================
// VARIÁVEIS DO JOGO
// ============================
let dificuldadeAtual = '';
let errosEncontrados = 0;
let pontuacaoTotal = 0;      // soma entre fases
let pontuacaoFase = 0;       // pontos na fase atual
let tempoInicio = 0;
let timerInterval = null;
let jogoAtivo = false;

const penalidadePorErro = 100; // redução por erro não encontrado (exemplo)

// DOM
const telaInicio = document.getElementById('tela-inicio');
const jogo = document.getElementById('jogo');
const telaResultado = document.getElementById('tela-resultado');
const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

const dificuldadeDisplay = document.getElementById('dificuldade-display');
const errosDisplay = document.getElementById('erros');
const timerDisplay = document.getElementById('timer');
const pontuacaoDisplay = document.getElementById('pontuacao');
const tempoFinalDisplay = document.getElementById('tempo-final');
const pontosFaseDisplay = document.getElementById('pontos-fase');

const btnProxima = document.getElementById('btn-proxima');
const btnMenu = document.getElementById('btn-menu');

// ============================
// FASES: pontos e posições (mantive suas posições originais)
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
// EVENTOS / LISTENERS
// ============================
document.querySelectorAll('.btn-dificuldade').forEach(btn => {
  btn.addEventListener('click', e => iniciarJogo(e.target.getAttribute('data-dificuldade')));
});
btnProxima.addEventListener('click', proximaDificuldade);
btnMenu.addEventListener('click', voltarMenu);
canvas2.addEventListener('click', verificarClique);

// alerta se não estiver logado
document.addEventListener('DOMContentLoaded', () => {
  if (!getCurrentUser()) {
    // não bloqueia o uso do jogo, só alerta (você pode exigir login antes)
    alert('⚠️ Você precisa estar logado para pontuar! Vá ao Menu e registre suas iniciais.');
  }
  // atualiza UI inicial
  atualizarInfo();
});

// ============================
// INÍCIO / CARREGAMENTO FASE
// ============================
function iniciarJogo(dificuldade) {
  if (!getCurrentUser()) {
    alert('❌ Você precisa estar logado para jogar!');
    voltarMenu();
    return;
  }

  dificuldadeAtual = dificuldade;
  telaInicio.style.display = 'none';
  jogo.style.display = 'block';
  telaResultado.style.display = 'none';

  // reset fase
  errosEncontrados = 0;
  pontuacaoFase = 0;
  fases[dificuldadeAtual].encontrados = [];

  dificuldadeDisplay.textContent = dificuldade.charAt(0).toUpperCase() + dificuldade.slice(1);
  atualizarInfo();
  carregarFase();
}

function carregarFase() {
  jogoAtivo = true;
  // prepara canvas e imagens
  configurarCanvas();
  carregarImagens();
  iniciarTimer();
}

function configurarCanvas() {
  // ajusta tamanho padrão (os seus estilos controlam responsividade)
  canvas1.width = 600;
  canvas1.height = 450;
  canvas2.width = 600;
  canvas2.height = 450;
  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
}

// imagens são definidas no HTML com ids img-<dificuldade>-1 e img-<dificuldade>-2
function carregarImagens() {
  const img1 = document.getElementById(`img-${dificuldadeAtual}-1`);
  const img2 = document.getElementById(`img-${dificuldadeAtual}-2`);

  if (!img1 || !img2) {
    // desenhar texto de erro no canvas
    ctx1.fillStyle = '#000';
    ctx1.fillText('Erro: imagens não encontradas', 10, 20);
    return;
  }

  // quando carregarem, desenha
  const tryDraw = () => desenharImagens(img1, img2);
  if (img1.complete && img2.complete) {
    tryDraw();
  } else {
    img1.onload = img2.onload = tryDraw;
  }
}

function desenharImagens(img1, img2) {
  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  ctx1.drawImage(img1, 0, 0, canvas1.width, canvas1.height);
  ctx2.drawImage(img2, 0, 0, canvas2.width, canvas2.height);
  desenharErrosEncontrados();
}

// desenha os círculos marcados nas duas imagens
function desenharErrosEncontrados() {
  const encontrados = fases[dificuldadeAtual].encontrados || [];
  [ctx1, ctx2].forEach(ctx => {
    // desenhar por cima das imagens
  });
  // desenhar em cada canvas os highlights
  fases[dificuldadeAtual].encontrados.forEach(erro => {
    [ctx1, ctx2].forEach(ctx => {
      ctx.strokeStyle = '#00FF00';
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

// ============================
// CLIQUE NO CANVAS (VERIFICAÇÃO)
// ============================
function verificarClique(e) {
  if (!jogoAtivo) return;

  const rect = canvas2.getBoundingClientRect();
  const clickX = (e.clientX - rect.left) * (canvas2.width / rect.width);
  const clickY = (e.clientY - rect.top) * (canvas2.height / rect.height);

  const fase = fases[dificuldadeAtual];

  for (let erro of fase.erros) {
    const dist = Math.hypot(clickX - erro.x, clickY - erro.y);

    // checa se já foi encontrado comparando referência por posição
    const jaEncontrado = fase.encontrados.some(eF => eF.x === erro.x && eF.y === erro.y);

    if (dist <= erro.raio && !jaEncontrado) {
      fase.encontrados.push(erro);
      errosEncontrados++;
      // define pontos por erro (pode ajustar fórmula)
      const pontosPorErro = Math.max(150 - Math.floor(erro.raio / 2), 50);
      pontuacaoFase += pontosPorErro;
      desenharImagens(); // redesenha imagens + marcações
      atualizarInfo();

      // se todos encontrados, finalizar fase
      if (errosEncontrados === fase.erros.length) {
        finalizarFase();
      }
      return;
    }
  }

  // clique em lugar errado: opcional penalidade
  // pontuacaoFase = Math.max(0, pontuacaoFase - 5);
}

// ============================
// TIMER
// ============================
function iniciarTimer() {
  tempoInicio = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(atualizarTimer, 1000);
}

function atualizarTimer() {
  const s = Math.floor((Date.now() - tempoInicio) / 1000);
  timerDisplay.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ============================
// ATUALIZA UI
// ============================
function atualizarInfo() {
  errosDisplay.textContent = `${errosEncontrados}/7`;
  pontuacaoDisplay.textContent = pontuacaoTotal + pontuacaoFase;
}

// ============================
// FINALIZA FASE (salva sempre que terminar uma fase)
// ============================
function finalizarFase() {
  jogoAtivo = false;
  clearInterval(timerInterval);

  const tempoSeg = Math.floor((Date.now() - tempoInicio) / 1000);
  const pontosBase = Math.max(1000 - tempoSeg * 10, 100);
  const errosRestantes = fases[dificuldadeAtual].erros.length - errosEncontrados;
  const pontosComPenalidade = Math.max(pontosBase - errosRestantes * penalidadePorErro, 0);

  // mistura pontos calculados com os pontos por acertos da fase
  const pontosDaFase = Math.round(pontuacaoFase + pontosComPenalidade);

  // soma ao total do jogo (persistente enquanto o jogador joga as fases)
  pontuacaoTotal += pontosDaFase;

  // SALVA os pontos desta fase no placar global (soma no localStorage)
  updateTotalScore(pontosDaFase);

  // atualiza tela resultado
  telaResultado.style.display = 'block';
  jogo.style.display = 'none';

  tempoFinalDisplay.textContent = `${String(Math.floor(tempoSeg/60)).padStart(2,'0')}:${String(tempoSeg%60).padStart(2,'0')}`;
  pontosFaseDisplay.textContent = pontuacaoTotal;

  // prepara botão Próxima
  if (dificuldadeAtual === 'facil') {
    btnProxima.style.display = 'inline-block';
    btnProxima.textContent = 'Jogar Médio';
  } else if (dificuldadeAtual === 'medio') {
    btnProxima.style.display = 'inline-block';
    btnProxima.textContent = 'Jogar Difícil';
  } else {
    // última fase concluída
    btnProxima.style.display = 'none';
    alert(`🏆 Pontuação final de ${pontuacaoTotal} salva!`);
  }

  atualizarInfo();
}

// ============================
// PRÓXIMA DIFICULDADE
// ============================
function proximaDificuldade() {
  // muda dificuldade atual de forma sequencial
  if (dificuldadeAtual === 'facil') dificuldadeAtual = 'medio';
  else if (dificuldadeAtual === 'medio') dificuldadeAtual = 'dificil';
  else dificuldadeAtual = 'facil';

  // reset UI para nova fase
  errosEncontrados = 0;
  pontuacaoFase = 0;
  fases[dificuldadeAtual].encontrados = [];
  telaResultado.style.display = 'none';
  jogo.style.display = 'block';

  dificuldadeDisplay.textContent = dificuldadeAtual.charAt(0).toUpperCase() + dificuldadeAtual.slice(1);
  configurarCanvas();
  carregarImagens();
  iniciarTimer();
  atualizarInfo();
}

// ============================
// VOLTAR AO MENU
// ============================
function voltarMenu() {
  // limpa estados locais
  jogo.style.display = 'none';
  telaInicio.style.display = 'flex';
  errosEncontrados = 0;
  pontuacaoFase = 0;
  pontuacaoTotal = 0;
  dificuldadeAtual = '';
  if (timerInterval) clearInterval(timerInterval);

  // volta para menu (se quiser manter no mesmo HTML, remova essa linha)
  window.location.href = 'menu.html';
}

// ============================
// AUX: redesenhar imagens quando necessário (compatibilidade)
// ============================
function desenharImagens() {
  // função suportada com duas assinaturas: sem args redesenha a partir das imgs carregadas
  const img1 = document.getElementById(`img-${dificuldadeAtual}-1`);
  const img2 = document.getElementById(`img-${dificuldadeAtual}-2`);
  if (!img1 || !img2) return;
  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  ctx1.drawImage(img1, 0, 0, canvas1.width, canvas1.height);
  ctx2.drawImage(img2, 0, 0, canvas2.width, canvas2.height);
  // redesenha marcas
  fases[dificuldadeAtual].encontrados.forEach(erro => {
    [ctx1, ctx2].forEach(ctx => {
      ctx.strokeStyle = '#00FF00';
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

// ============================
// INICIALIZAÇÃO PADRÃO
// ============================
(function init() {
  // garante que elementos existam antes de usar (evita erros no console)
  if (!canvas1 || !canvas2 || !btnProxima || !btnMenu) {
    console.warn('Elementos do jogo não encontrados — verifique IDs no HTML.');
    return;
  }

  // define comportamento padrão do botão Próxima (se estiver na tela resultado)
  btnProxima.addEventListener('click', () => {
    // se estiver no resultado, avançar fase; se no jogo, ignora
    proximaDificuldade();
  });

  // reinicia variáveis caso o jogador abra a página diretamente
  dificuldadeAtual = 'facil';
  atualizarInfo();
})();
