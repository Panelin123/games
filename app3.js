// Dados do Quiz
const questions = [
    {
        question: "O que significa a sigla 'CPU' em computação?",
        options: [
            "Central Processing Unit",
            "Computer Personal Unit", 
            "Central Program Unit",
            "Computer Processing Unit"
        ],
        correct: 0,
        explanation: "CPU significa Central Processing Unit, o cérebro do computador!"
    },
    {
        question: "Qual é o resultado da expressão lógica: (True AND False) OR True?",
        options: ["True", "False", "Null", "Undefined"],
        correct: 0,
        explanation: "False OR True = True. A operação OR retorna verdadeiro se pelo menos um operando for verdadeiro."
    },
    {
        question: "Em que base numérica trabalha o sistema binário?",
        options: ["Base 8", "Base 10", "Base 2", "Base 16"],
        correct: 2,
        explanation: "O sistema binário trabalha na base 2, usando apenas os dígitos 0 e 1."
    },
    {
        question: "Qual linguagem é conhecida como a 'linguagem da web'?",
        options: ["Python", "JavaScript", "C++", "Java"],
        correct: 1,
        explanation: "JavaScript é amplamente considerada a linguagem da web, rodando em praticamente todos os navegadores."
    },
    {
        question: "O que é um algoritmo?",
        options: [
            "Um tipo de computador",
            "Uma linguagem de programação",
            "Uma sequência de instruções para resolver um problema",
            "Um sistema operacional"
        ],
        correct: 2,
        explanation: "Um algoritmo é uma sequência lógica e finita de instruções para resolver um problema específico."
    },
    {
        question: "Quantos bits tem 1 byte?",
        options: ["4 bits", "8 bits", "16 bits", "32 bits"],
        correct: 1,
        explanation: "1 byte equivale a 8 bits. É a unidade básica de armazenamento de dados."
    },
    {
        question: "Qual é a função do protocolo HTTP?",
        options: [
            "Enviar emails",
            "Transferir arquivos",
            "Comunicação entre navegador e servidor web",
            "Conectar dispositivos Bluetooth"
        ],
        correct: 2,
        explanation: "HTTP (HyperText Transfer Protocol) é usado para comunicação entre navegadores e servidores web."
    },
    {
        question: "Em lógica, qual é o resultado de NOT(True)?",
        options: ["True", "False", "1", "0"],
        correct: 1,
        explanation: "O operador NOT inverte o valor lógico. NOT(True) = False."
    }
];

// Variáveis globais
let currentQuestion = 0;
let score = 0;
let timeLeft = 15;
let timer;
let isAnswered = false;

// Função para iniciar o quiz
function startQuiz() {
    document.getElementById('homeScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');
    currentQuestion = 0;
    score = 0;
    loadQuestion();
    startTimer();
}

// Função para carregar uma pergunta
function loadQuestion() {
    const question = questions[currentQuestion];
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('currentQuestionNum').textContent = currentQuestion + 1;
    document.getElementById('currentScore').textContent = score;
    document.getElementById('explanationContainer').classList.add('hidden');
    
    // Atualizar barra de progresso
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    // Criar opções
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'w-full p-4 rounded-2xl text-left font-semibold transition-all duration-300 transform hover:scale-102 border-2 bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40';
        button.onclick = () => handleAnswer(index);
        
        button.innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                    ${String.fromCharCode(65 + index)}
                </div>
                <span class="text-lg">${option}</span>
            </div>
        `;
        
        container.appendChild(button);
    });

    isAnswered = false;
    timeLeft = 15;
    updateTimerDisplay();
}

// Função para tratar resposta selecionada
function handleAnswer(selectedIndex) {
    if (isAnswered) return;
    
    isAnswered = true;
    clearInterval(timer);
    
    const question = questions[currentQuestion];
    const buttons = document.querySelectorAll('#optionsContainer button');
    
    // Colorir botões baseado na resposta
    buttons.forEach((button, index) => {
        button.disabled = true;
        if (index === question.correct) {
            button.className = button.className.replace(/bg-white\/\d+.*?border-white\/\d+/g, 'bg-green-500/20 text-green-300 border-green-500/50 scale-102');
        } else if (index === selectedIndex) {
            button.className = button.className.replace(/bg-white\/\d+.*?border-white\/\d+/g, 'bg-red-500/20 text-red-300 border-red-500/50');
        } else {
            button.className = button.className.replace(/bg-white\/\d+.*?border-white\/\d+/g, 'bg-gray-500/20 text-gray-400 border-gray-500/30');
        }
    });

    // Mostrar explicação
    document.getElementById('explanationText').textContent = question.explanation;
    document.getElementById('explanationContainer').classList.remove('hidden');

    // Atualizar pontuação se resposta correta
    if (selectedIndex === question.correct) {
        score++;
        document.getElementById('currentScore').textContent = score;
    }

    // Aguardar 2 segundos e ir para próxima pergunta ou mostrar resultados
    setTimeout(() => {
        if (currentQuestion + 1 < questions.length) {
            currentQuestion++;
            loadQuestion();
            startTimer();
        } else {
            showResults();
        }
    }, 2000);
}

// Função para iniciar o timer
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            handleAnswer(-1); // Timeout - resposta incorreta
        }
    }, 1000);
}

// Função para atualizar display do timer
function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    const circle = document.getElementById('timerCircle');
    
    display.textContent = timeLeft;
    
    // Mudar cor quando tempo está acabando
    if (timeLeft <= 5) {
        display.className = 'text-xl font-bold text-red-400 animate-pulse';
        circle.className = 'text-red-500 transition-all duration-1000';}
    }