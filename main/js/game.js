const canvas = document.getElementById("gameCanvas"); 
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Fundo
const bgImg = new Image();
bgImg.src = "assets/background.png";

// Teclado
const keys = {};
document.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

// PLAYER
const player = {
  x: 100,
  y: 100,
  frame: 0,
  frameDelay: 8,
  frameCounter: 0,
  speed: 3.5,
  direction: "down",
  state: "idle_down",
  animations: {},
  width: 64,
  height: 64,
  scale: 1.8 // <--- Aumenta 1.5x (ajuste como preferir)
};


// Contador de sprites carregadas
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

// Fundo
function drawBackground() {
  if (bgImg.complete) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
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




// Loop principal
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  updatePlayer();
  drawPlayer();
  requestAnimationFrame(gameLoop);
}
