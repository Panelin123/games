let pecas = [];
let jogoCompleto = false;
let usandoImagem = false;
let pecaOriginalParent = null;

let PECAS_ESTATICAS = [];

function escolherPecasEstaticas() {
   
    const todasPecas = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    
    
    const embaralhado = todasPecas.sort(() => Math.random() - 0.5);
    
   
    PECAS_ESTATICAS = embaralhado.slice(0, 3);
    
    console.log('Peças estáticas:', PECAS_ESTATICAS.map(i => i + 1));
}

function inicializarJogo() {
    escolherPecasEstaticas(); 
    criarPecas();
    embaralharPecas();
    configurarEventos();
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
    const numerosEstaticos = PECAS_ESTATICAS.map(i => i + 1).sort((a, b) => a - b).join(', ');
    atualizarStatus(`Peças embaralhadas! Monte o quebra-cabeça! (${numerosEstaticos} já estão no lugar)`);
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
        if (e.target.classList.contains('puzzle-piece') && !e.target.classList.contains('static-piece')) {
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
        const target = e.target;
        target.classList.remove('drag-over');

        const originalPosition = e.dataTransfer.getData('text/plain');
        const piece = document.querySelector(`[data-original-position="${originalPosition}"]`);

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
    
    // Animação para peças desaparecerem
    pieces.forEach((piece, index) => {
        setTimeout(() => {
            piece.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            piece.style.opacity = '0';
            piece.style.transform = 'scale(0.8)';
        }, index * 50);  // Definindo o tempo de transição de cada peça
    });
    
    // Aguarda a animação de peças desaparecerem antes de adicionar a imagem
    setTimeout(() => {
        // Limpa o grid e define a estrutura para a imagem completa
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
        
        // Adiciona a imagem ao grid
        puzzleGrid.appendChild(imagemCompleta);
        
        // Adiciona animação para o fadeIn se ela não existir ainda
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
    }, 1500);  // Aguarda 1.5 segundos para garantir que a animação de peças termine antes de mostrar a imagem
}

function atualizarStatus(mensagem) {
    document.getElementById('status').textContent = mensagem;
}

window.addEventListener('load', inicializarJogo);