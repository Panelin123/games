const palavras = [
  "banana",
  "computador",
  "elefante",
  "girassol",
  "cachorro",
  "brasil",
  "internet",
  "luz",
  "azul",
  "porta",
  "violao",
  "camera",
]

let palavraSecreta = ""
let letrasCertas = []
let letrasErradas = []
const maxErros = 6
let erros = 0

const palavraDiv = document.getElementById("palavra-secreta")
const letraInput = document.getElementById("letra")
const letrasDigitadasDiv = document.getElementById("letras-digitadas")
const contadorDiv = document.getElementById("contador")
const mensagemFinal = document.getElementById("mensagem-final")

function escolherPalavra() {
  const index = Math.floor(Math.random() * palavras.length)
  palavraSecreta = palavras[index]
}

function mostrarPalavra() {
  let exibicao = ""
  for (const letra of palavraSecreta) {
    exibicao += letrasCertas.includes(letra) ? letra + " " : "_ "
  }
  palavraDiv.textContent = exibicao.trim()
}

function verificarLetra() {
  const letra = letraInput.value.toLowerCase()
  letraInput.value = ""

  if (!letra || letrasCertas.includes(letra) || letrasErradas.includes(letra)) return

  if (palavraSecreta.includes(letra)) {
    letrasCertas.push(letra)
  } else {
    letrasErradas.push(letra)
    erros++
    atualizarContador()
  }

  letrasDigitadasDiv.textContent = "Letras erradas: " + letrasErradas.join(", ")
  mostrarPalavra()
  verificarFim()
}

function atualizarContador() {
  const tentativasRestantes = maxErros - erros
  contadorDiv.textContent = tentativasRestantes

  // Mudando cor conforme as tentativas diminuem
  if (tentativasRestantes <= 2) {
    contadorDiv.style.color = "#ff0000" // Vermelho quando crítico
  } else if (tentativasRestantes <= 4) {
    contadorDiv.style.color = "#ff8800" // Laranja quando baixo
  } else {
    contadorDiv.style.color = "#44ff44" // Verde quando seguro
  }
}

function verificarFim() {
  if (erros >= maxErros) {
    mensagemFinal.textContent = "Você perdeu! A palavra era: " + palavraSecreta
    mensagemFinal.classList.remove("ganhou")
    letraInput.disabled = true
  } else if (!palavraDiv.textContent.includes("_")) {
    mensagemFinal.textContent = "Parabéns, você venceu!"
    mensagemFinal.classList.add("ganhou")
    letraInput.disabled = true
  }
}

function reiniciarJogo() {
  erros = 0
  letrasCertas = []
  letrasErradas = []
  mensagemFinal.textContent = ""
  mensagemFinal.classList.remove("ganhou")
  letraInput.disabled = false
  contadorDiv.textContent = maxErros
  contadorDiv.style.color = "#44ff44"
  letrasDigitadasDiv.textContent = ""
  escolherPalavra()
  mostrarPalavra()
}


letraInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    verificarLetra()
  }
})


escolherPalavra()
mostrarPalavra()
