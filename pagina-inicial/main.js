const canvas = document.getElementById('gameCanvas'); 
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// CARREGAMENTO DOS ASSETS
const assets = {
    background: new Image(),
    play_button: new Image(),
    dicas_button: new Image(),
    painel_dicas: new Image(),
    historia: [
        new Image(), // pag1
        new Image(), // pag2
        new Image(), // pag3
        new Image()  // pag4
    ]
};

assets.background.src = 'assets/intro.png';
assets.play_button.src = 'assets/button_play.PNG';
assets.dicas_button.src = 'assets/buttonDicas.png';
assets.painel_dicas.src = 'assets/dicasThelost.PNG';
assets.historia[0].src = 'paginasHistoria/pag1.png';
assets.historia[1].src = 'paginasHistoria/pag2.png';
assets.historia[2].src = 'paginasHistoria/pag3.png';
assets.historia[3].src = 'paginasHistoria/pag4.png';

let assetsLoaded = 0;
const totalAssets = 4 + assets.historia.length;

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

let iniciarHistoria = false;
let historiaIndex = 0;
let historiaTempo = 0;
const TEMPO_POR_TELA = 15;

let redirecionou = false;

[...Object.values(assets).filter(a => !Array.isArray(a)), ...assets.historia].forEach(img => {
    img.onload = () => {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) {
            requestAnimationFrame(gameLoop);
        }
    };
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('click', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    if (!iniciarHistoria && isInside(x, y, playButtonArea)) {
        iniciarHistoria = true;
    }

    if (!iniciarHistoria && isInside(x, y, dicasButtonArea)) {
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

    if (!iniciarHistoria) {
        ctx.drawImage(assets.background, 0, 0, width, height);
        playButtonArea = drawButton(assets.play_button, width / 2, height * 0.85, playScale);
        playScale += scaleDirection * 0.002;
        if (playScale > 0.45 || playScale < 0.4) scaleDirection *= -1;

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

        if (dicasVisivel) {
            const scale = 0.5;
            const img = assets.painel_dicas;
            ctx.drawImage(
                img,
                width / 2 - (img.width * scale) / 2,
                height / 2 - (img.height * scale) / 2,
                img.width * scale,
                img.height * scale
            );
        }
    }

    if (iniciarHistoria && historiaIndex < assets.historia.length) {
        const img = assets.historia[historiaIndex];
        ctx.drawImage(img, 0, 0, width, height);
        historiaTempo += 1 / 60;
        if (historiaTempo >= TEMPO_POR_TELA) {
            historiaIndex++;
            historiaTempo = 0;
        }
    }

    if (iniciarHistoria && historiaIndex >= assets.historia.length && !redirecionou) {
        redirecionou = true;
        window.location.href = '../main/index.html';
    }

    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
});