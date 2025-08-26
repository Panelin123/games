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
const imagemDiv = document.getElementById("imagem-forca")
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
    atualizarImagem()
  }

  letrasDigitadasDiv.textContent = "Letras erradas: " + letrasErradas.join(", ")
  mostrarPalavra()
  verificarFim()
}

const imagensErros = [
  "/forca-peito.png",
  "/forca-bra-o-esquerdo.png",
  "/forca-bra-o-direito.png",
  "/forca-perna-esquerda.png",
  "/forca-perna-direita.png",
  "/forca-cabe-a.png",
]

function atualizarImagem() {
  console.log("Atualizando imagem... Erros:", erros)

  if (erros > 0 && erros <= maxErros) {
    // Criar a imagem se ela não existir
    let img = document.getElementById(`erro-${erros}`)
    if (!img) {
      img = document.createElement("img")
      img.id = `erro-${erros}`
      img.src = imagensErros[erros - 1]
      img.alt = `Parte ${erros} da forca`
      imagemDiv.appendChild(img)
    }

    // Mostrar a imagem com animação
    setTimeout(() => {
      img.classList.add("mostrar")
    }, 100)

    console.log(`Mostrando imagem ${erros}`)
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
  imagemDiv.innerHTML = ""
  letrasDigitadasDiv.textContent = ""
  escolherPalavra()
  mostrarPalavra()
}

// Permitir jogar pressionando Enter
letraInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    verificarLetra()
  }
})

// Inicializar o jogo
escolherPalavra()
mostrarPalavra()
