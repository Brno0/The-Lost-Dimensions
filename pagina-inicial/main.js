const canvas = document.getElementById('gameCanvas'); 
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Assets
const assets = {
    background: new Image(),
    play_button: new Image(),
    dicas_button: new Image(),
    painel_dicas: new Image(),
    intro_transition: new Image() // Hagnar
};

assets.background.src = 'assets/intro.png';
assets.play_button.src = 'assets/button_play.png';
assets.dicas_button.src = 'assets/buttonDicas.png';
assets.painel_dicas.src = 'assets/dicasThelost.png';
assets.intro_transition.src = 'assets/começandoHagnar.png';

let assetsLoaded = 0;
const totalAssets = Object.keys(assets).length;

// Estados
let dicasVisivel = false;
let playButtonArea = null;
let dicasButtonArea = null;
let playScale = 0.4;
let scaleDirection = 1;
let mouseX = 0;
let mouseY = 0;
let dicasScale = 0.1;
const baseScale = 0.1;
const hoverScale = 0.12;
const transitionSpeed = 0.01;

let isTransitioning = false;
let transitionAlpha = 0;
let transitionDone = false;

// Mensagem pós-transição
let mostrarMensagem = false;
let tempoMensagem = 0;
let mensagemMostrada = false;

// Nova transição: fade-out da imagem do Hagnar
let fadeOutHagnar = false;
let fadeOutAlpha = 1;

// Contagem para redirecionar ao jogo
let redirecionou = false;
const WAIT_BEFORE_REDIRECT = 2;

// Preload
Object.values(assets).forEach((img) => {
    img.onload = () => {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) {
            requestAnimationFrame(gameLoop);
        }
    };
});

// Eventos
canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('click', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    if (isInside(x, y, playButtonArea) && !isTransitioning && !transitionDone) {
        isTransitioning = true;
    }

    if (isInside(x, y, dicasButtonArea)) {
        dicasVisivel = !dicasVisivel;
    } else if (dicasVisivel) {
        dicasVisivel = false;
    }
});

function isInside(x, y, area) {
    return area &&
        x >= area.x && x <= area.x + area.width &&
        y >= area.y && y <= area.y + area.height;
}

function drawButton(img, centerX, centerY, scale) {
    const width = img.width * scale;
    const height = img.height * scale;
    const x = centerX - width / 2;
    const y = centerY - height / 2;

    ctx.drawImage(img, x, y, width, height);

    return { x, y, width, height };
}

function gameLoop() {
    ctx.clearRect(0, 0, width, height);

    // Fundo de fundo
    if (!transitionDone) {
        ctx.drawImage(assets.background, 0, 0, width, height);
    }

    // Botão Play animado
    if (!transitionDone) {
        playButtonArea = drawButton(assets.play_button, width / 2, height * 0.85, playScale);
        playScale += scaleDirection * 0.002;
        if (playScale > 0.45 || playScale < 0.4) {
            scaleDirection *= -1;
        }
    }

    // Hover botão Dicas
    const hoverArea = {
        x: width - 60 - (assets.dicas_button.width * dicasScale) / 2,
        y: height - 60 - (assets.dicas_button.height * dicasScale) / 2,
        width: assets.dicas_button.width * dicasScale,
        height: assets.dicas_button.height * dicasScale
    };

    const hoveringDicas = isInside(mouseX, mouseY, hoverArea);
    dicasScale += (hoveringDicas ? 1 : -1) * transitionSpeed;
    dicasScale = Math.max(baseScale, Math.min(hoverScale, dicasScale));

    dicasButtonArea = drawButton(assets.dicas_button, width - 60, height - 60, dicasScale);

    // Painel Dicas
    if (dicasVisivel) {
        const scale = 0.5;
        const img = assets.painel_dicas;
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;
        ctx.drawImage(
            img,
            width / 2 - imgWidth / 2,
            height / 2 - imgHeight / 2,
            imgWidth,
            imgHeight
        );
    }

    // Primeira transição: Fade-in da imagem Hagnar
    if (isTransitioning) {
        transitionAlpha += 0.02;
        if (transitionAlpha >= 1) {
            transitionAlpha = 1;
            isTransitioning = false;
            transitionDone = true;
        }

        ctx.save();
        ctx.globalAlpha = transitionAlpha;
        ctx.drawImage(assets.intro_transition, 0, 0, width, height);
        ctx.restore();
    }

    // Mostra imagem do Hagnar
    if (transitionDone && !mostrarMensagem && !fadeOutHagnar) {
        ctx.drawImage(assets.intro_transition, 0, 0, width, height);

        tempoMensagem += 1 / 60;
        if (tempoMensagem >= 5) {
            fadeOutHagnar = true;
        }
    }

    // Fade-out da imagem do Hagnar
    if (fadeOutHagnar && !mostrarMensagem) {
        fadeOutAlpha -= 0.02;
        if (fadeOutAlpha <= 0) {
            fadeOutAlpha = 0;
            fadeOutHagnar = false;
            mostrarMensagem = true;
        }

        ctx.save();
        ctx.globalAlpha = fadeOutAlpha;
        ctx.drawImage(assets.intro_transition, 0, 0, width, height);
        ctx.restore();
    }

    // Tela preta com frase
    if (mostrarMensagem) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);

        ctx.font = '24px "Press Start 2P", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText("Iniciando a primeira fase !", width / 2, height / 2);
    
        tempoMensagem += 1 / 60;
        if (tempoMensagem >= WAIT_BEFORE_REDIRECT && !redirecionou) {
            redirecionou = true;
            // Redireciona para o jogo em “../main/index.html”
            window.location.href = '../main/index.html';
        }
    }

    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
});
