const palavras = [
    "banana", "computador", "elefante", "girassol",
    "cachorro", "brasil", "internet", "luz", 
    "azul", "porta", "violao", "camera"
  ];
  
  let palavraSecreta = "";
  let letrasCertas = [];
  let letrasErradas = [];
  let maxErros = 6;
  let erros = 0;
  
  const palavraDiv = document.getElementById("palavra-secreta");
  const letraInput = document.getElementById("letra");
  const letrasDigitadasDiv = document.getElementById("letras-digitadas");
  const imagemDiv = document.getElementById("imagem-forca");
  const mensagemFinal = document.getElementById("mensagem-final");
  
  function escolherPalavra() {
    const index = Math.floor(Math.random() * palavras.length);
    palavraSecreta = palavras[index];
  }
  
  function mostrarPalavra() {
    let exibicao = "";
    for (let letra of palavraSecreta) {
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
      atualizarImagem();
    }
  
    letrasDigitadasDiv.textContent = "Letras erradas: " + letrasErradas.join(", ");
    mostrarPalavra();
    verificarFim();
  }
  
  function atualizarImagem() {
    imagemDiv.innerHTML = "";
    for (let i = 1; i <= erros; i++) {
      const img = document.createElement("img");
      img.src = `imagens/${i}.png`;
      imagemDiv.appendChild(img);
    }
  }
  
  function verificarFim() {
    if (erros >= maxErros) {
      mensagemFinal.textContent = "Você perdeu! A palavra era: " + palavraSecreta;
      letraInput.disabled = true;
    } else if (!palavraDiv.textContent.includes("_")) {
      mensagemFinal.textContent = "Parabéns, você venceu!";
      letraInput.disabled = true;
    }
  }
  
  function reiniciarJogo() {
    erros = 0;
    letrasCertas = [];
    letrasErradas = [];
    mensagemFinal.textContent = "";
    letraInput.disabled = false;
    imagemDiv.innerHTML = "";
    letrasDigitadasDiv.textContent = "";
    escolherPalavra();
    mostrarPalavra();
  }
  
  escolherPalavra();
  mostrarPalavra();
  
