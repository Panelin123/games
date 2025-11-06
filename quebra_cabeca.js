// ======================================================================
// ARQUIVO: quebra_cabeca.js (Lógica do Quebra-Cabeça)
// ======================================================================

let pecas = [];
let jogoCompleto = false;
let usandoImagem = false;
let pecaOriginalParent = null;
let PECAS_ESTATICAS = [];

// --- VARIÁVEIS DE PONTUAÇÃO E TEMPO ---
let startTime = 0;
let timerInterval = null;
const SESSION_KEY = 'currentUserInitials';
const SCORE_KEY_FORCA = 'highScoreForca'; // Chave do outro jogo (para somar)
const SCORE_KEY_QUEBRA_CABECA = 'highScoreQuebraCabeca'; // Chave específica do Quebra-Cabeça
const SCORE_KEY_TOTAL = 'arcadeTotalScores'; // Chave para o total acumulado

// --- FUNÇÕES DE PONTUAÇÃO E SISTEMA (CORRIGIDAS) ---

function getScores(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}

// 1. Salva a pontuação MÁXIMA para o jogo atual (Quebra-Cabeça)
function saveGameScore(userInitials, newScore, gameKey) {
    const scores = getScores(gameKey);
    
    let existingEntry = scores.find(s => s.user === userInitials);

    if (existingEntry) {
        if (newScore > existingEntry.score) {
            existingEntry.score = newScore;
            alert(`NOVO RECORD no Quebra-Cabeça! Sua pontuação: ${newScore}!`);
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

function calcularPontuacao(tempoGastoSegundos) {
    // 5000 pontos base, penalizando 50 pontos por segundo
    let pontuacao = 500 - (tempoGastoSegundos * 5);
    return Math.max(0, pontuacao); 
}

function checarUsuario() {
    return sessionStorage.getItem(SESSION_KEY);
}

function renderPlacarLocal(currentUser) {
    const placarLocalDiv = document.getElementById('placar-local');
    if (currentUser && placarLocalDiv) {
        
        // Carrega o score máximo do Quebra-Cabeça
        const scoresQC = getScores(SCORE_KEY_QUEBRA_CABECA);
        const userScoreQC = scoresQC.find(s => s.user === currentUser)?.score || 0;

        // Calcula e obtém o total acumulado
        const totalScore = updateTotalScore(currentUser); 
        
        placarLocalDiv.innerHTML = `
            <strong>Usuário: ${currentUser.toUpperCase()}</strong> | 
            Recorde QC: <span style="color: #00ff00;">${userScoreQC}</span> |
            Total Acumulado: <span style="color: #ffaa00;">${totalScore}</span>
        `;
    } else if (placarLocalDiv) {
        placarLocalDiv.innerHTML = "Faça login no Menu para registrar seu score!";
        placarLocalDiv.style.color = 'yellow';
    }
}

// --- FUNÇÕES DE TEMPO ---
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    startTime = Date.now();
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
            const seconds = String(elapsedTime % 60).padStart(2, '0');
            timerDisplay.textContent = `Tempo: ${minutes}:${seconds}`;
        }, 1000);
    }
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    const elapsedTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    return elapsedTimeSeconds;
}


function escolherPecasEstaticas() {
    const todasPecas = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const embaralhado = todasPecas.sort(() => Math.random() - 0.5);
    PECAS_ESTATICAS = embaralhado.slice(0, 3);
}

function inicializarJogo() {
    const currentUser = checarUsuario();
    renderPlacarLocal(currentUser);

    if (!currentUser) {
        atualizarStatus("Por favor, acesse o Menu para se registrar e começar a pontuar.");
        // Garante que os botões do Quebra-Cabeça estejam desabilitados se não houver login
        document.querySelectorAll('.btn').forEach(btn => btn.disabled = true);
        return;
    }
    
    document.querySelectorAll('.btn').forEach(btn => btn.disabled = false);

    escolherPecasEstaticas(); 
    criarPecas();
    embaralharPecas();
    configurarEventos();
    startTimer();
}

function criarPecas() {
    pecas = [];
    const container = document.getElementById('piecesContainer');
    container.innerHTML = '';
    
    const puzzleGrid = document.getElementById('puzzleGrid');
    const dropZones = puzzleGrid.querySelectorAll('.drop-zone');
    
    for (let i = 0; i < 9; i++) {
        const peca = document.createElement('div');
        peca.className = `puzzle-piece piece-${i + 1}`;
        peca.dataset.originalPosition = i;
        peca.dataset.currentPosition = -1;
        peca.textContent = i + 1;
        
        if (PECAS_ESTATICAS.includes(i)) {
            peca.draggable = false;
            peca.classList.add('static-piece');
            peca.style.opacity = '0.7';
            peca.style.cursor = 'not-allowed';
            
            dropZones[i].appendChild(peca);
            peca.dataset.currentPosition = i;
        } else {
            peca.draggable = true;
            
            const slot = document.createElement('div');
            slot.className = 'piece-slot';
            slot.appendChild(peca);
            container.appendChild(slot);
        }
        
        pecas.push(peca);
    }
}

function embaralharPecas() {
    const container = document.getElementById('piecesContainer');
    const slots = container.querySelectorAll('.piece-slot');
    
    const puzzleGrid = document.getElementById('puzzleGrid');
    puzzleGrid.querySelectorAll('.puzzle-piece:not(.static-piece)').forEach(piece => {
        piece.remove();
    });
    
    slots.forEach(slot => {
        slot.innerHTML = '';
    });
    
    const pecasMoveis = pecas.filter((peca, index) => !PECAS_ESTATICAS.includes(index));
    const pecasEmbaralhadas = [...pecasMoveis].sort(() => Math.random() - 0.5);
    
    pecasEmbaralhadas.forEach((peca, index) => {
        slots[index].appendChild(peca);
        peca.dataset.currentPosition = -1;
    });
    
    jogoCompleto = false;
    document.getElementById('status').classList.remove('victory');

    const numerosEstaticos = PECAS_ESTATICAS.map(i => i + 1).sort((a, b) => a - b).join(', ');
    atualizarStatus(`Peças embaralhadas! Monte o quebra-cabeça! (${numerosEstaticos} já estão no lugar)`);
    
    if (checarUsuario()) {
        startTimer();
    }
}

function alternarImagem() {
    usandoImagem = !usandoImagem;
    
    pecas.forEach(peca => {
        if (usandoImagem) {
            peca.classList.add('with-image');
            peca.textContent = ''; 
        } else {
            peca.classList.remove('with-image');
            peca.textContent = parseInt(peca.dataset.originalPosition) + 1; 
        }
    });
    
    const status = usandoImagem ? "Modo imagem do Deku ativo!" : "Modo números ativo!";
    atualizarStatus(status);
}

function reiniciarJogo() {
    const currentUser = checarUsuario();
    if (!currentUser) return;

    stopTimer();

    const puzzleGrid = document.getElementById('puzzleGrid');
    
    const imagemCompleta = puzzleGrid.querySelector('.imagem-completa');
    if (imagemCompleta) {
        puzzleGrid.innerHTML = '';
        puzzleGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        puzzleGrid.style.gridTemplateRows = 'repeat(3, 1fr)';
        puzzleGrid.style.padding = '5px';
        
        for (let i = 0; i < 9; i++) {
            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            dropZone.dataset.position = i;
            puzzleGrid.appendChild(dropZone);
        }
    } else {
        const dropZones = puzzleGrid.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.innerHTML = ''; 
        });
    }
    
    const piecesContainer = document.getElementById('piecesContainer');
    piecesContainer.innerHTML = '';

    pecas = [];

    escolherPecasEstaticas(); 
    criarPecas();
    embaralharPecas();
    jogoCompleto = false;
    document.getElementById('status').classList.remove('victory');
    
    startTimer();
}

function shakeAndReturn(piece, originalParent) {
    piece.classList.add('shake-animation');
    
    setTimeout(() => {
        piece.classList.remove('shake-animation');
        
        if (originalParent) {
            originalParent.appendChild(piece);
            piece.classList.add('returning-animation');
            
            setTimeout(() => {
                piece.classList.remove('returning-animation');
            }, 500);
        }
    }, 600);
}

function configurarEventos() {
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('puzzle-piece') && !e.target.classList.contains('static-piece') && checarUsuario()) {
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', e.target.dataset.originalPosition);
            
            pecaOriginalParent = e.target.parentNode;
        }
    });

    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('puzzle-piece')) {
            e.target.classList.remove('dragging');
        }
    });

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.target.classList.contains('drop-zone') || e.target.classList.contains('piece-slot')) {
            e.target.classList.add('drag-over');
        }
    });

    document.addEventListener('dragleave', (e) => {
        if (e.target.classList.contains('drop-zone') || e.target.classList.contains('piece-slot')) {
            e.target.classList.remove('drag-over');
        }
    });


    document.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!checarUsuario()) return;

        const target = e.target;
        target.classList.remove('drag-over');

        const originalPosition = e.dataTransfer.getData('text/plain');
        const piece = document.querySelector(`[data-original-position="${originalPosition}"]`);

        if (!piece) return;

        if (target.classList.contains('drop-zone')) {
            const targetPosition = parseInt(target.dataset.position);
            const pieceCorrectPosition = parseInt(piece.dataset.originalPosition);
            
            if (target.querySelector('.puzzle-piece')) {
                atualizarStatus("❌ Esse espaço já está ocupado!");
                shakeAndReturn(piece, pecaOriginalParent);
                return;
            }
        
            if (pieceCorrectPosition === targetPosition) {
                target.appendChild(piece);
                piece.dataset.currentPosition = target.dataset.position;
                atualizarStatus("✅ Muito bem! Peça na posição correta!");
                verificarVitoria();
            } else {
                atualizarStatus("❌ Ops! Essa peça não vai aí!");
                shakeAndReturn(piece, pecaOriginalParent);
            }
            
        } else if (target.classList.contains('piece-slot') && !target.querySelector('.puzzle-piece')) {
            target.appendChild(piece);
            piece.dataset.currentPosition = -1;
            atualizarStatus("Peça movida de volta para as disponíveis.");
            verificarVitoria();
        }
    });
}

function verificarVitoria() {
    const dropZones = document.querySelectorAll('.drop-zone');
    let pecasCorretas = 0;
    
    dropZones.forEach((zone, index) => {
        const piece = zone.querySelector('.puzzle-piece');
        if (piece && parseInt(piece.dataset.originalPosition) === index) {
            pecasCorretas++;
        }
    });
    
    if (pecasCorretas === 9 && !jogoCompleto) {
        jogoCompleto = true;
        const tempoGasto = stopTimer();
        const pontuacao = calcularPontuacao(tempoGasto);
        
        atualizarStatus(`🎉 Parabéns! Vitória em ${tempoGasto}s! Pontuação: ${pontuacao}! 🎉`);
        document.getElementById('status').classList.add('victory');
        
        const currentUser = checarUsuario();
        if (currentUser) {
            // SALVA O SCORE INDIVIDUAL E ATUALIZA O TOTAL
            saveGameScore(currentUser, pontuacao, SCORE_KEY_QUEBRA_CABECA);
            updateTotalScore(currentUser); 
            renderPlacarLocal(currentUser);
        }
        
        const pieces = document.querySelectorAll('.puzzle-piece');
        pieces.forEach((piece, index) => {
            setTimeout(() => {
                piece.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    piece.style.transform = 'scale(1)';
                }, 200);
            }, index * 100);
        });
        
        setTimeout(() => {
            mostrarImagemCompleta();
        }, 1500);
    } else {
        document.getElementById('status').classList.remove('victory');
    }
}

function mostrarImagemCompleta() {
    const puzzleGrid = document.getElementById('puzzleGrid');
    const pieces = puzzleGrid.querySelectorAll('.puzzle-piece');
    
    pieces.forEach((piece, index) => {
        setTimeout(() => {
            piece.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            piece.style.opacity = '0';
            piece.style.transform = 'scale(0.8)';
        }, index * 50); 
    });
    
    setTimeout(() => {
        puzzleGrid.innerHTML = '';
        puzzleGrid.style.gridTemplateColumns = '1fr';
        puzzleGrid.style.gridTemplateRows = '1fr';
        puzzleGrid.style.padding = '0';
        
        const imagemCompleta = document.createElement('div');
        imagemCompleta.className = 'imagem-completa';
        imagemCompleta.style.cssText = `
            width: 100%;
            height: 100%;
            background-image: url('img/images.png');
            background-size: cover;
            background-position: center;
            border-radius: 10px;
            animation: fadeInImage 1s ease-in;
            box-shadow: 0 0 30px rgba(0, 255, 204, 0.6);
        `;
        
        puzzleGrid.appendChild(imagemCompleta);
        
        if (!document.getElementById('fadeInAnimation')) {
            const style = document.createElement('style');
            style.id = 'fadeInAnimation';
            style.textContent = `
                @keyframes fadeInImage {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }, 1500); 
}

function atualizarStatus(mensagem) {
    const statusDiv = document.getElementById('status');
    if(statusDiv) statusDiv.textContent = mensagem;
}

window.addEventListener('load', inicializarJogo);