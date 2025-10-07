let pecas = [];
let jogoCompleto = false;
let usandoImagem = false;
let pecaOriginalParent = null;

function inicializarJogo() {
    criarPecas();
    embaralharPecas();
    configurarEventos();
}

function criarPecas() {
    pecas = [];
    const container = document.getElementById('piecesContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const peca = document.createElement('div');
        peca.className = `puzzle-piece piece-${i + 1}`;
        peca.draggable = true;
        peca.dataset.originalPosition = i;
        peca.dataset.currentPosition = -1;
        peca.textContent = i + 1;
        
        const slot = document.createElement('div');
        slot.className = 'piece-slot';
        slot.appendChild(peca);
        container.appendChild(slot);
        
        pecas.push(peca);
    }
}

function embaralharPecas() {
    const container = document.getElementById('piecesContainer');
    const slots = container.querySelectorAll('.piece-slot');
    
    const puzzleGrid = document.getElementById('puzzleGrid');
    puzzleGrid.querySelectorAll('.puzzle-piece').forEach(piece => {
        piece.remove();
    });
    
    slots.forEach(slot => {
        slot.innerHTML = '';
    });
    
    const pecasEmbaralhadas = [...pecas].sort(() => Math.random() - 0.5);
    
    pecasEmbaralhadas.forEach((peca, index) => {
        slots[index].appendChild(peca);
        peca.dataset.currentPosition = -1;
    });
    
    jogoCompleto = false;
    atualizarStatus("Peças embaralhadas! Monte o quebra-cabeça!");
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
    const puzzleGrid = document.getElementById('puzzleGrid');
    const dropZones = puzzleGrid.querySelectorAll('.drop-zone');
    
    dropZones.forEach(zone => {
        const piece = zone.querySelector('.puzzle-piece');
        if (piece) {
            piece.remove();
        }
    });
    
    const piecesContainer = document.getElementById('piecesContainer');
    piecesContainer.querySelectorAll('.puzzle-piece').forEach(piece => {
        piece.remove();
    });

    criarPecas();
    embaralharPecas();
    jogoCompleto = false;
}

// FUNÇÃO PARA FAZER A PEÇA BALANÇAR E VOLTAR
function shakeAndReturn(piece, originalParent) {
    // Adiciona animação de balanço
    piece.classList.add('shake-animation');
    
    // Após o balanço, retorna a peça para o local original
    setTimeout(() => {
        piece.classList.remove('shake-animation');
        
        // Move a peça de volta para o parent original
        if (originalParent) {
            originalParent.appendChild(piece);
            piece.classList.add('returning-animation');
            
            // Remove a animação de retorno
            setTimeout(() => {
                piece.classList.remove('returning-animation');
            }, 500);
        }
    }, 600);
}

function configurarEventos() {
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('puzzle-piece')) {
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', e.target.dataset.originalPosition);
            
            // Guarda o parent original da peça
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
        const target = e.target;
        target.classList.remove('drag-over');

        const originalPosition = e.dataTransfer.getData('text/plain');
        const piece = document.querySelector(`[data-original-position="${originalPosition}"]`);

        if (target.classList.contains('drop-zone')) {
            const targetPosition = parseInt(target.dataset.position);
            const pieceCorrectPosition = parseInt(piece.dataset.originalPosition);
            
            // Verifica se o slot já está preenchido
            if (target.querySelector('.puzzle-piece')) {
                atualizarStatus("❌ Esse espaço já está ocupado!");
                shakeAndReturn(piece, pecaOriginalParent);
                return;
            }
            
            // VERIFICA SE A POSIÇÃO ESTÁ CORRETA
            if (pieceCorrectPosition === targetPosition) {
                // CORRETO! Coloca a peça
                target.appendChild(piece);
                piece.dataset.currentPosition = target.dataset.position;
                atualizarStatus("✅ Muito bem! Peça na posição correta!");
                verificarVitoria();
            } else {
                // ERRADO! Faz balançar e volta
                atualizarStatus("❌ Ops! Essa peça não vai aí!");
                shakeAndReturn(piece, pecaOriginalParent);
            }
            
        } else if (target.classList.contains('piece-slot') && !target.querySelector('.puzzle-piece')) {
            // Permite mover de volta para a área de peças
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
    
    if (pecasCorretas === 9) {
        jogoCompleto = true;
        atualizarStatus("🎉 Parabéns! Você completou o quebra-cabeça do Deku! 🎉");
        document.getElementById('status').classList.add('victory');
        
        const pieces = document.querySelectorAll('.puzzle-piece');
        pieces.forEach((piece, index) => {
            setTimeout(() => {
                piece.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    piece.style.transform = 'scale(1)';
                }, 200);
            }, index * 100);
        });
    } else {
        document.getElementById('status').classList.remove('victory');
    }
}

function atualizarStatus(mensagem) {
    document.getElementById('status').textContent = mensagem;
}


window.addEventListener('load', inicializarJogo);