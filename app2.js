let gameImages = [];
let gameState = {
    cards: [],
    flippedCards: [],
    currentPlayer: 1,
    scores: [0, 0],
    gameStarted: false,
    matches: 0
};


function loadSampleImages() {
    gameImages = [];
    const colors = ['🎨', '🌈', '🎭', '🎪', '🎨', '🌟', '💎', '🎯'];
    
    colors.forEach(emoji => {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        
        const gradient = ctx.createLinearGradient(0, 0, 120, 120);
        gradient.addColorStop(0, `hsl(${Math.random() * 360}, 70%, 60%)`);
        gradient.addColorStop(1, `hsl(${Math.random() * 360}, 70%, 40%)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 120, 120);
        
       
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText(emoji, 60, 80);
        
        gameImages.push(canvas.toDataURL());
    });
}

function startGame() {
   
    if (gameImages.length === 0) {
        loadSampleImages();
    }

    gameState = {
        cards: [],
        flippedCards: [],
        currentPlayer: 1,
        scores: [0, 0],
        gameStarted: true,
        matches: 0
    };


    const selectedImages = gameImages.slice(0, 8);
    const cardPairs = [...selectedImages, ...selectedImages];
    
   
    for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    
    cardPairs.forEach((image, index) => {
        gameState.cards.push({
            id: index,
            image: image,
            flipped: false,
            matched: false
        });
    });

    updateDisplay();
    document.getElementById('game-status').innerHTML = 'Jogo iniciado! Boa sorte!';
}

function flipCard(cardId) {
    if (!gameState.gameStarted) return;
    
    const card = gameState.cards[cardId];
    
    if (card.flipped || card.matched || gameState.flippedCards.length >= 2) {
        return;
    }

    card.flipped = true;
    gameState.flippedCards.push(cardId);
    updateDisplay();

    if (gameState.flippedCards.length === 2) {
        setTimeout(checkMatch, 1000);
    }
}

function checkMatch() {
    const [card1Id, card2Id] = gameState.flippedCards;
    const card1 = gameState.cards[card1Id];
    const card2 = gameState.cards[card2Id];

    if (card1.image === card2.image) {
      
        card1.matched = true;
        card2.matched = true;
        gameState.scores[gameState.currentPlayer - 1]++;
        gameState.matches++;
        
        document.getElementById('game-status').innerHTML = 
            `Jogador ${gameState.currentPlayer} fez um par!`;

        if (gameState.matches === 8) {
            setTimeout(() => {
                const winner = gameState.scores[0] > gameState.scores[1] ? 1 : 
                             gameState.scores[1] > gameState.scores[0] ? 2 : 'empate';
                
                if (winner === 'empate') {
                    document.getElementById('game-status').innerHTML = 'Empate! Que jogo incrível!';
                } else {
                    document.getElementById('game-status').innerHTML = 
                        `Parabéns Jogador ${winner}! Você ganhou!`;
                }
            }, 500);
        }
    } else {
    
        card1.flipped = false;
        card2.flipped = false;
        
        
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        document.getElementById('game-status').innerHTML = 
            `Vez do Jogador ${gameState.currentPlayer}`;
    }

    gameState.flippedCards = [];
    updateDisplay();
}

function updateDisplay() {
    
    document.getElementById('score1').textContent = gameState.scores[0];
    document.getElementById('score2').textContent = gameState.scores[1];
    document.getElementById('current-player').textContent = gameState.currentPlayer;

    const playerDisplay = document.getElementById('current-player-display');
    if (gameState.currentPlayer === 1) {
        playerDisplay.classList.add('current-player');
    } else {
        playerDisplay.classList.remove('current-player');
    }

  
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    gameState.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        if (card.flipped) {
            cardElement.classList.add('flipped');
        }
        
        if (card.matched) {
            cardElement.classList.add('matched');
        }

      
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.innerHTML = '?';
        cardElement.appendChild(cardBack);

        const cardImage = document.createElement('img');
        cardImage.src = card.image;
        cardElement.appendChild(cardImage);

        cardElement.onclick = () => flipCard(index);
        gameBoard.appendChild(cardElement);
    });
}


window.onload = function() {
    loadSampleImages();
};
