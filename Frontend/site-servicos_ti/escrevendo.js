const text = "Projeto em Andamento...";
const speed = 100; // Velocidade da digitação
const eraseSpeed = 50; // Velocidade ao apagar
const delayBeforeErase = 1500; // Tempo antes de começar a apagar
let i = 0;
let isDeleting = false;
let container = document.getElementById("typewriter");
let lineHeight = parseInt(window.getComputedStyle(container).lineHeight); // Altura da linha

function typeWriter() {
  const element = document.getElementById("typewriter");

  // Verifica se o texto ultrapassou o tamanho do container
  if (element.scrollHeight > element.clientHeight) {
    element.innerHTML += '\n'; // Adiciona uma nova linha
  }

  if (!isDeleting) {
    element.innerHTML = text.substring(0, i);
    i++;

    if (i > text.length) {
      isDeleting = true;
      setTimeout(typeWriter, delayBeforeErase);
    } else {
      setTimeout(typeWriter, speed);
    }
  } else {
    element.innerHTML = text.substring(0, i);
    i--;

    if (i < 0) {
      isDeleting = false;
      element.innerHTML = ''; // Limpa o texto após apagar
    }

    setTimeout(typeWriter, eraseSpeed);
  }
}

typeWriter(); // Inicia a animação
