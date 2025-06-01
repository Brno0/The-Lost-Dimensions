//CONFIGURAÇÃO DO CANVAS
const canvas = document.getElementById("gameCanvas"); 
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// FUNDO DO JOGO
const backgrounds = [
  { image: new Image(), src: "assets/background.png" },  // fase 1
  { image: new Image(), src: "assets/background2.png" }  // fase 2
];
let currentBackground = 0;
backgrounds.forEach(bg => bg.image.src = bg.src);

// CONTROLE DO TECLADO
const keys = {};
document.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

// PERSONAGEM (HAGNAR)
const player = {
  x: 100,
  y: 100,
  frame: 0,
  frameDelay: 4,
  frameCounter: 0,
  speed: 2.8,          // velocidade Hagnar
  direction: "down",
  state: "idle_down",
  animations: {},
  width: 64,
  height: 64,          
  scale: 2.0,          // tamanho Hagnar 
  shadowOffsetY: 0.88, // valor padrão para posição da sombra nos pés
};

// PORTAL ENTRE FASES
const portalConfigs = [
  { x: canvas.width - 120, y: 70 },                             // Fase 1
  { x: canvas.width / 2 - 64, y: canvas.height - 140 },         // Fase 2
];

const portal = {
  x: portalConfigs[0].x,
  y: portalConfigs[0].y,
  width: 128,
  height: 128,
  image: new Image(),
};
portal.image.src = "assets/portal.png";

portal.image.src = "assets/portal.png";

// DETECÇÃO DE COLISÃO PORTAL
function isColliding(a, b) {
  const buffer = 40; // reduz o tamanho efetivo da colisão
  return (
    a.x < b.x + b.width - buffer &&
    a.x + a.width > b.x + buffer &&
    a.y < b.y + b.height - buffer &&
    a.y + a.height > b.y + buffer
  );
}

//Sombra portal
function drawPortalShadow() {
  const shadowWidth = portal.width * 0.8;
  const shadowHeight = portal.height * 0.30;

  const shadowX = portal.x + (portal.width - shadowWidth) / 2;
  const shadowY = portal.y + portal.height - shadowHeight * 0.8;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(
    shadowX + shadowWidth / 2,
    shadowY + shadowHeight / 2,
    shadowWidth / 2,
    shadowHeight / 2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
}

// CARREGAMENTO DE ANIMAÇÕES
let loadedCount = 0;
const directions = ["down", "left", "right", "up"];
const totalToLoad = directions.length * 4; // idle, run, attack1, attack2

function loadSprite(name, path, frameCount) {
  const img = new Image();
  img.src = path;
  img.onload = () => {
    player.animations[name] = {
      image: img,
      frameCount: frameCount,
      frameWidth: img.width / frameCount,
      frameHeight: img.height
    };
    loadedCount++;
    if (loadedCount === totalToLoad) {
      gameLoop(); // Inicia o jogo quando todas as animações estiverem carregadas
    }
  };
}

// Carregar animações
directions.forEach(dir => {
loadSprite(`idle_${dir}`, `assets/player/idle_${dir}.png`, 8);
loadSprite(`run_${dir}`, `assets/player/run_${dir}.png`, 8);
loadSprite(`attack1_${dir}`, `assets/player/attack1_${dir}.png`, 8);
loadSprite(`attack2_${dir}`, `assets/player/attack2_${dir}.png`, 8);
});

// DESENHO NA TELA
// Fundo
function drawBackground() {
  const bg = backgrounds[currentBackground].image;
  if (bg.complete) {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  }
}

// Player
function drawPlayer() {
  
  const anim = player.animations[player.state];
  if (!anim || !anim.image.complete) return;

  const frameW = anim.frameWidth;
  const frameH = anim.frameHeight;
  const sx = player.frame * frameW;

  const scaledW = frameW * player.scale;
  const scaledH = frameH * player.scale;

  ctx.drawImage(
    anim.image,
    sx, 0,
    frameW, frameH,
    player.x, player.y,
    scaledW, scaledH
  );
}

//Sombra do Player
function drawShadow() {
  const anim = player.animations[player.state];
  if (!anim) return;

  const scale = player.scale;
  const frameW = anim.frameWidth;
  const frameH = anim.frameHeight;

  const shadowWidth = frameW * scale * 0.25;
  const shadowHeight = frameH * scale * 0.12;

  const shadowX = player.x + (frameW * scale - shadowWidth) / 2;
  const shadowY = player.y + frameH * scale * player.shadowOffsetY;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(
    shadowX + shadowWidth / 2,
    shadowY + shadowHeight / 2,
    shadowWidth / 2,
    shadowHeight / 2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
}

// Atualiza lógica do jogador
function changeState(newState) {
  if (newState !== player.state) {
    player.state = newState;
    player.frame = 0;
    player.frameCounter = 0;

    const anim = player.animations[player.state];
    if (anim) {
      player.width = anim.frameWidth;
      player.height = anim.frameHeight;
    }
  }
  // Ajusta a sombra de acordo com a animação
if (newState.startsWith("idle")) {
  player.shadowOffsetY = 0.65;
} else if (newState.startsWith("run")) {
  player.shadowOffsetY = 0.65;
} else if (newState.startsWith("attack")) {
  player.shadowOffsetY = 0.65;
} else {
  player.shadowOffsetY = 0.65;
}

}

function updatePlayer() {
  let dx = 0, dy = 0;

  if (keys["w"]) {
    dy = -1;
    player.direction = "up";
  } else if (keys["s"]) {
    dy = 1;
    player.direction = "down";
  }
  if (keys["a"]) {
    dx = -1;
    player.direction = "left";
  } else if (keys["d"]) {
    dx = 1;
    player.direction = "right";
  }

  const isMoving = dx !== 0 || dy !== 0;
  const currentAnim = player.animations[player.state];

  // Travar entrada de novo ataque enquanto animação anterior não termina
  if (player.state.startsWith("attack")) {
    if (player.frame >= currentAnim?.frameCount - 1) {
      changeState("idle_" + player.direction);
    }
  } else {
    // Se ataque foi iniciado
    if (keys["j"]) {
      changeState("attack1_" + player.direction);
    } else if (keys["k"]) {
      changeState("attack2_" + player.direction);
    } else if (isMoving) {
      player.x += dx * player.speed;
      player.y += dy * player.speed;
      changeState("run_" + player.direction);
    } else {
      changeState("idle_" + player.direction);
    }
  }

  const anim = player.animations[player.state];
  if (!anim) return;

  player.frameCounter++;
  if (player.frameCounter >= player.frameDelay) {
    player.frameCounter = 0;
    player.frame++;

    if (player.frame >= anim.frameCount) {
      player.frame = 0;
    }
  }
}

// LOOP DO JOGO
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
drawPortalShadow();  // ⬅️ sombra antes do portal
ctx.drawImage(portal.image, portal.x, portal.y, portal.width, portal.height);

  //Verificar colisão do portal
 if (isColliding(player, portal)) {
  // Vai para a próxima fase
  currentBackground = (currentBackground + 1) % backgrounds.length;

  // Atualiza posição do portal com base na nova fase
  const config = portalConfigs[currentBackground] || portalConfigs[0];
  portal.x = config.x;
  portal.y = config.y;

  // Posiciona o jogador
  player.x = 50;
  player.y = 50;
}

  updatePlayer();
  drawShadow();  
  drawPlayer();

  requestAnimationFrame(gameLoop);
}