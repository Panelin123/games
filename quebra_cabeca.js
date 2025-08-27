let pecas = [];
let jogoCompleto = false;


function inicializarJogo() {
    criarPecas();
    embaralharPecas();
    configurarEventos();
}


function criarPecas() {
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
    atualizarStatus("Pecas embaralhadas! Monte o quebra-cabeca.");
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
    
    criarPecas();
    embaralharPecas();
    jogoCompleto = false;
}


function configurarEventos() {
   
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('puzzle-piece')) {
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', e.target.dataset.originalPosition);
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
            
            if (!target.querySelector('.puzzle-piece')) {
                
                const currentParent = piece.parentNode;
                
                target.appendChild(piece);
                piece.dataset.currentPosition = target.dataset.position;
                
                if (currentParent.classList.contains('drop-zone')) {
              
                }
                
                verificarVitoria();
            }
        } else if (target.classList.contains('piece-slot') && !target.querySelector('.puzzle-piece')) {
          
            const currentParent = piece.parentNode;
            target.appendChild(piece);
            piece.dataset.currentPosition = -1;
            
            if (currentParent.classList.contains('drop-zone')) {
               
                verificarVitoria();
            }
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
        atualizarStatus("Parabens! Voce completou o quebra-cabeca!");
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
        if (pecasCorretas > 0) {
            atualizarStatus(`Muito bem! ${pecasCorretas}/9 pecas no lugar certo.`);
        } else {
            atualizarStatus("Continue tentando! Arraste as pecas para o lugar certo.");
        }
    }
}


function atualizarStatus(mensagem) {
    document.getElementById('status').textContent = mensagem;
}


window.addEventListener('load', inicializarJogo);
