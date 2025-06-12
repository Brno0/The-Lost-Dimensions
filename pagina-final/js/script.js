const canvas = document.getElementById("canvasFinal");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const imagens = [
  "../assets/pag5.png",
  "../assets/pag6.png",
  "../assets/pag7.png",
  "../assets/pag8.png",
  "../assets/pag9.png"
];

let index = 0;
const img = new Image();

function desenharImagem() {
  img.src = imagens[index];
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Oculta o botão se estiver na última imagem
    const btn = document.getElementById("btnPular");
    if (img.src.includes("pag9.png")) {
      btn.style.display = "none";
    } else {
      btn.style.display = "block";
    }
  };
}

desenharImagem();

document.getElementById("btnPular").addEventListener("click", () => {
  index++;
  if (index < imagens.length) {
    desenharImagem();
  } else {
    window.location.href = "../pagina-inicial/html/index.html";
  }
});

