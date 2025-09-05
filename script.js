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

const palavraDiv = document.getElementById("palavra-secreta");
const letraInput = document.getElementById("letra");
const letrasDigitadasDiv = document.getElementById("letras-digitadas");
const letrasCertasDiv = document.getElementById("letras-certas");
const contadorDiv = document.getElementById("contador");
const mensagemFinal = document.getElementById("mensagem-final");
const dicaDiv = document.getElementById("dica");

function escolherPalavra() {
  const index = Math.floor(Math.random() * palavras.length);
  palavraSecreta = palavras[index].palavra;
  dicaSecreta = palavras[index].dica;
  dicaDiv.textContent = "Dica: " + dicaSecreta;
}

function mostrarPalavra() {
  let exibicao = "";
  for (const letra of palavraSecreta) {
    exibicao += letrasCertas.includes(letra) ? letra + " " : "_ ";
  }
  palavraDiv.textContent = exibicao.trim();
}

function verificarLetra() {
  const letra = letraInput.value.toLowerCase();
  letraInput.value = "";

  if (!letra || letrasCertas.includes(letra) || letrasErradas.includes(letra)) return;

  if (palavraSecreta.includes(letra)) {
    letrasCertas.push(letra);
  } else {
    letrasErradas.push(letra);
    erros++;
    atualizarContador();
  }

  letrasDigitadasDiv.textContent = "Letras erradas: " + letrasErradas.join(", ");
  letrasCertasDiv.textContent = "Letras corretas: " + letrasCertas.join(", ");
  mostrarPalavra();
  verificarFim();
}

function atualizarContador() {
  const tentativasRestantes = maxErros - erros;
  contadorDiv.textContent = tentativasRestantes;

  if (tentativasRestantes <= 2) {
    contadorDiv.style.color = "#ff0000"; 
  } else if (tentativasRestantes <= 4) {
    contadorDiv.style.color = "#ff8800"; 
  } else {
    contadorDiv.style.color = "#44ff44"; 
  }
}

function verificarFim() {
  if (erros >= maxErros) {
    mensagemFinal.textContent = "Você perdeu! A palavra era: " + palavraSecreta;
    mensagemFinal.classList.remove("ganhou");
    letraInput.disabled = true;
  } else if (!palavraDiv.textContent.includes("_")) {
    mensagemFinal.textContent = "Parabéns, você venceu!";
    mensagemFinal.classList.add("ganhou");
    letraInput.disabled = true;
  }
}

function reiniciarJogo() {
  erros = 0;
  letrasCertas = [];
  letrasErradas = [];
  mensagemFinal.textContent = "";
  mensagemFinal.classList.remove("ganhou");
  letraInput.disabled = false;
  contadorDiv.textContent = maxErros;
  contadorDiv.style.color = "#44ff44";
  letrasDigitadasDiv.textContent = "";
  letrasCertasDiv.textContent = "";

  escolherPalavra();
  mostrarPalavra();
}

letraInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    verificarLetra();
  }
});

escolherPalavra();  
mostrarPalavra();
