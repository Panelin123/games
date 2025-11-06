// ======================================================================
// ARQUIVO: script.js (Lógica do Jogo da Forca)
// ======================================================================

const palavras = [
  { palavra: "banana", dica: "É uma fruta amarela." },
  { palavra: "computador", dica: "É um dispositivo eletrônico usado para processar informações." },
  { palavra: "elefante", dica: "É o maior mamífero terrestre." },
  { palavra: "girassol", dica: "É uma planta que segue o sol." },
  { palavra: "cachorro", dica: "É um animal doméstico popular, conhecido como o melhor amigo do homem." },
  { palavra: "brasil", dica: "É um país da América do Sul, famoso pelo futebol." },
  { palavra: "internet", dica: "É uma rede mundial de computadores." },
  { palavra: "luz", dica: "É uma forma de energia visível." },
  { palavra: "azul", dica: "É uma cor do espectro visível." },
  { palavra: "porta", dica: "É um objeto que serve para fechar e abrir um espaço." },
  { palavra: "violao", dica: "É um instrumento musical de cordas." },
  { palavra: "camera", dica: "É um aparelho usado para tirar fotos." }
];

let palavraSecreta = "";
let dicaSecreta = "";
let letrasCertas = [];
let letrasErradas = [];
const maxErros = 6;
let erros = 0;
let jogoAtivo = true;

// --- CHAVES DE PONTUAÇÃO (CORRIGIDAS) ---
const SESSION_KEY = 'currentUserInitials';
const SCORE_KEY_FORCA = 'highScoreForca'; // Chave específica da Forca
const SCORE_KEY_QUEBRA_CABECA = 'highScoreQuebraCabeca'; // Chave do outro jogo (para somar)
const SCORE_KEY_TOTAL = 'arcadeTotalScores'; // Chave para o total acumulado

// Elementos DOM (assumindo que o HTML da Forca possui estes IDs)
const palavraDiv = document.getElementById("palavra-secreta");
const letraInput = document.getElementById("letra");
const tentarBtn = document.querySelector('button[onclick="verificarLetra()"]');
const reiniciarBtn = document.querySelector('button[onclick="reiniciarJogo()"]');
const letrasDigitadasDiv = document.getElementById("letras-digitadas");
const letrasCertasDiv = document.getElementById("letras-certas");
const contadorDiv = document.getElementById("contador");
const mensagemFinal = document.getElementById("mensagem-final");
const dicaDiv = document.getElementById("dica");
const placarLocalDiv = document.getElementById('placar-local');


// --- FUNÇÕES DE PONTUAÇÃO E SISTEMA (CORRIGIDAS) ---

function getScores(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

// 1. Salva a pontuação MÁXIMA para o jogo atual (Forca)
function saveGameScore(userInitials, newScore, gameKey) {
  const scores = getScores(gameKey);
  
  let existingEntry = scores.find(s => s.user === userInitials);

  if (existingEntry) {
      if (newScore > existingEntry.score) {
          existingEntry.score = newScore;
          alert(`NOVO RECORD na Forca! Sua pontuação: ${newScore}!`);
      }
  } else {
      scores.push({ user: userInitials, score: newScore });
  }
  
  localStorage.setItem(gameKey, JSON.stringify(scores));
}

// 2. Calcula e salva a pontuação TOTAL acumulada de todos os jogos
function updateTotalScore(userInitials) {
  // Busca o score máximo de cada jogo
  const scoresForca = getScores(SCORE_KEY_FORCA);
  const scoresQC = getScores(SCORE_KEY_QUEBRA_CABECA);
  
  const maxScoreForca = scoresForca.find(s => s.user === userInitials)?.score || 0;
  const maxScoreQC = scoresQC.find(s => s.user === userInitials)?.score || 0;
  
  const total = maxScoreForca + maxScoreQC;

  // Salva o total na chave geral
  const totalScores = getScores(SCORE_KEY_TOTAL);
  let totalEntry = totalScores.find(s => s.user === userInitials);

  if (totalEntry) {
      totalEntry.score = total;
  } else {
      totalScores.push({ user: userInitials, score: total });
  }
  
  localStorage.setItem(SCORE_KEY_TOTAL, JSON.stringify(totalScores));
  return total;
}

function calcularPontuacao(palavra, errosFinais) {
  const tentativasRestantes = maxErros - errosFinais;
  const multiplicadorTamanho = palavra.length * 50;
  const bonusErros = tentativasRestantes * 10;
  
  return multiplicadorTamanho + bonusErros;
}

function checarUsuario() {
  const currentUser = sessionStorage.getItem(SESSION_KEY);
  if (!currentUser) {
      if (letraInput) letraInput.disabled = true;
      if (tentarBtn) tentarBtn.disabled = true;
      if (reiniciarBtn) reiniciarBtn.style.display = 'none';
      if (mensagemFinal) {
          mensagemFinal.textContent = "ERRO: Faça o login no Menu para jogar e pontuar!";
          mensagemFinal.style.color = 'yellow';
      }
      return false;
  }
  return currentUser;
}

function renderPlacarLocal() {
  const currentUser = checarUsuario();
  if (currentUser && placarLocalDiv) {
      
      // Carrega o score máximo da Forca
      const scoresForca = getScores(SCORE_KEY_FORCA);
      const userScoreForca = scoresForca.find(s => s.user === currentUser)?.score || 0;

      // Calcula e obtém o total acumulado
      const totalScore = updateTotalScore(currentUser); 
      
      placarLocalDiv.innerHTML = `
          <strong>Usuário: ${currentUser.toUpperCase()}</strong> | 
          Recorde Forca: <span style="color: #00ff00;">${userScoreForca}</span> |
          Total Acumulado: <span style="color: #ffaa00;">${totalScore}</span>
      `;
  } else if (placarLocalDiv) {
      placarLocalDiv.innerHTML = "Faça login no Menu para registrar seu score!";
      placarLocalDiv.style.color = 'yellow';
  }
}


// --- LÓGICA DO JOGO DA FORCA --- (Sem Alterações)

function escolherPalavra() {
  const index = Math.floor(Math.random() * palavras.length);
  palavraSecreta = palavras[index].palavra;
  dicaSecreta = palavras[index].dica;
  if (dicaDiv) dicaDiv.textContent = "Dica: " + dicaSecreta;
}

function mostrarPalavra() {
  let exibicao = "";
  for (const letra of palavraSecreta) {
      exibicao += letrasCertas.includes(letra) ? letra.toUpperCase() + " " : "_ ";
  }
  if (palavraDiv) palavraDiv.textContent = exibicao.trim();
}

function verificarLetra() {
  if (!jogoAtivo) return;
  if (!checarUsuario()) return; // Garante que o usuário está logado

  const letra = letraInput.value.toLowerCase().trim();
  letraInput.value = "";

  if (!letra || letra.length !== 1 || letrasCertas.includes(letra) || letrasErradas.includes(letra)) return;

  if (palavraSecreta.includes(letra)) {
      letrasCertas.push(letra);
  } else {
      letrasErradas.push(letra);
      erros++;
      atualizarContador();
  }

  if (letrasDigitadasDiv) letrasDigitadasDiv.textContent = "Letras erradas: " + letrasErradas.map(l => l.toUpperCase()).join(", ");
  if (letrasCertasDiv) letrasCertasDiv.textContent = "Letras corretas: " + letrasCertas.map(l => l.toUpperCase()).join(", ");
  mostrarPalavra();
  verificarFim();
}

function atualizarContador() {
  const tentativasRestantes = maxErros - erros;
  if (contadorDiv) {
      contadorDiv.textContent = tentativasRestantes;

      if (tentativasRestantes <= 2) {
          contadorDiv.style.color = "#ff0000"; 
      } else if (tentativasRestantes <= 4) {
          contadorDiv.style.color = "#ff8800"; 
      } else {
          contadorDiv.style.color = "#44ff44"; 
      }
  }
}

function verificarFim() {
  if (!jogoAtivo) return;

  const currentUser = checarUsuario();
  const palavraResolvida = palavraDiv ? !palavraDiv.textContent.includes("_") : false;

  if (erros >= maxErros) {
      // Fim: Perdeu
      if (mensagemFinal) {
          mensagemFinal.textContent = `Você perdeu! A palavra era: ${palavraSecreta.toUpperCase()}`;
          mensagemFinal.classList.remove("ganhou");
      }
      jogoAtivo = false;
  } else if (palavraResolvida) {
      // Fim: Ganhou
      const pontuacao = calcularPontuacao(palavraSecreta, erros);
      
      if (mensagemFinal) {
          mensagemFinal.textContent = `Parabéns, você venceu! Pontuação: ${pontuacao}`;
          mensagemFinal.classList.add("ganhou");
      }
      jogoAtivo = false;

      if (currentUser) {
          // SALVA O SCORE INDIVIDUAL E ATUALIZA O TOTAL
          saveGameScore(currentUser, pontuacao, SCORE_KEY_FORCA);
          updateTotalScore(currentUser); 
          renderPlacarLocal();
      }
  }

  if (!jogoAtivo) {
      if (letraInput) letraInput.disabled = true;
      if (tentarBtn) tentarBtn.disabled = true;
      if (reiniciarBtn) reiniciarBtn.style.display = 'inline-block';
  }
}

function reiniciarJogo() {
  if (!checarUsuario()) return;

  erros = 0;
  letrasCertas = [];
  letrasErradas = [];
  jogoAtivo = true;

  if (mensagemFinal) {
      mensagemFinal.textContent = "";
      mensagemFinal.classList.remove("ganhou");
  }
  if (letraInput) letraInput.disabled = false;
  if (tentarBtn) tentarBtn.disabled = false;

  if (contadorDiv) {
      contadorDiv.textContent = maxErros;
      contadorDiv.style.color = "#44ff44";
  }
  if (letrasDigitadasDiv) letrasDigitadasDiv.textContent = "";
  if (letrasCertasDiv) letrasCertasDiv.textContent = "";
  if (reiniciarBtn) reiniciarBtn.style.display = 'inline-block';

  escolherPalavra();
  mostrarPalavra();
}

if (letraInput) {
  letraInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
          verificarLetra();
      }
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  if (checarUsuario()) {
      reiniciarJogo();
      renderPlacarLocal();
  }
});