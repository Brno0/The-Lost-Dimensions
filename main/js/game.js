 canvas = document.getElementById("gameCanvas");
 ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);


 canvas = document.getElementById("gameCanvas");
 ctx = canvas.getContext("2d");
const bgImg = new Image();
bgImg.src = "assets/background.png"; // ajuste o nome se necessário


const keys = {};
document.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

// CONFIGURAÇÃO DO PLAYER
const player = {
  x: 100,
  y: 100,
  width: 128,
  height: 128,
  frame: 0,
  frameDelay: 8,
  frameCounter: 0,
  speed: 3.5,
  direction: "right",
  state: "idle", // idle, run, attack1, attack3
  image: null,
  animations: {}
};

// CARREGA UMA SPRITESHEET
function loadSprite(name, path, frameCount) {
  const img = new Image();
  img.src = path;
  player.animations[name] = {
    image: img,
    frameCount: frameCount
  };
}

// CARREGA TODAS AS ANIMAÇÕES
loadSprite("idle", "assets/player/idle.png", 6);
loadSprite("run", "assets/player/Run.png", 8);
loadSprite("attack1", "assets/player/Attack_1.png", 4);
loadSprite("attack3", "assets/player/Attack_3.png", 4);

function drawBackground() {
  if (bgImg.complete) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  }
}


// DESENHA O PLAYER COM BASE NA ANIMAÇÃO ATUAL
function drawPlayer() {
  const anim = player.animations[player.state];
  const frameWidth = player.width;

  if (!anim.image.complete) return;

  ctx.save();

  if (player.direction === "left") {
    ctx.translate(player.x + frameWidth, player.y);
    ctx.scale(-1, 1);
    ctx.drawImage(
      anim.image,
      player.frame * frameWidth, 0,
      frameWidth, player.height,
      0, 0,
      frameWidth, player.height
    );
  } else {
    ctx.drawImage(
      anim.image,
      player.frame * frameWidth, 0,
      frameWidth, player.height,
      player.x, player.y,
      frameWidth, player.height
    );
  }

  ctx.restore();
}

function updatePlayer() {
  let dx = 0, dy = 0;

  if (keys["w"]) dy -= 1;
  if (keys["s"]) dy += 1;
  if (keys["a"]) { dx -= 1; player.direction = "left"; }
  if (keys["d"]) { dx += 1; player.direction = "right"; }

  const moving = dx !== 0 || dy !== 0;

  if (moving) {
    // Normaliza para manter velocidade constante na diagonal
    const length = Math.sqrt(dx * dx + dy * dy);
    dx = dx / length;
    dy = dy / length;

    player.x += dx * player.speed;
    player.y += dy * player.speed;
  }

  // Ataques têm prioridade
  if (keys["j"]) {
    player.state = "attack1";
  } else if (keys["k"]) {
    player.state = "attack3";
  } else if (moving) {
    player.state = "run";
  } else {
    player.state = "idle";
  }

  // Atualiza animação
  player.frameCounter++;
  if (player.frameCounter >= player.frameDelay) {
    player.frameCounter = 0;
    player.frame++;
    const anim = player.animations[player.state];
    if (player.frame >= anim.frameCount) {
      player.frame = 0;
      if (player.state.startsWith("attack")) {
        player.state = "idle";
      }
    }
  }
}


// LIMPA TELA
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// LOOP PRINCIPAL
function gameLoop() {
  drawBackground();     // desenha o fundo
  updatePlayer();       // atualiza lógica do jogador
  drawPlayer();         // desenha o jogador por cima
  requestAnimationFrame(gameLoop);
}
  
// Espera as imagens carregarem antes de iniciar
window.onload = () => {
  gameLoop();
};
