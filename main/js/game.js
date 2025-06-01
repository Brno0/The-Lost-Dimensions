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
  currentHealth: 100,


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
  const bufferX = 20;
  const bufferY = 30;
  return (
    a.x < b.x + b.width - bufferX &&
    a.x + a.width > b.x + bufferX &&
    a.y < b.y + b.height - bufferY &&
    a.y + a.height > b.y + bufferY
  );
}

function isCircleColliding(a, b, radius) {
  const dx = (a.x + a.width / 2) - (b.x + b.width / 2);
  const dy = (a.y + a.height / 2) - (b.y + b.height / 2);
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < radius;
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

const bosses = [
  {
    x: canvas.width - 240,
    y: 450 - 100 / 2,
    width: 60,
    height: 120,
    color: "darkred",
    speed: 1.2,
    maxHealth: 100,
    currentHealth: 100,
    isActive: false,
    dead: false
  },
  {
   x: 1300- 100 / 2,  // centralizado na plataforma da Fase 1
    y: 45 - 100 / 2,
    width: 80,
    height: 140,
    color: "darkblue", // cor diferente pro boss da fase 2
    speed: 1.6,
    maxHealth: 150,
    currentHealth: 150,
    isActive: false,
    dead: false
  }
];
const specialStone = {
  x: 0,
  y: 0,
  width: 32,
  height: 32,
  collected: false,
  visible: false,
  image: new Image(),
};
specialStone.image.src = "assets/gelo.png";


if (player.state.startsWith("attack") && isColliding(player, boss)) {
  boss.currentHealth -= 0.5; // dano leve por ataque
  if (boss.currentHealth < 0) boss.currentHealth = 0;
}

function drawHealthBar(x, y, width, height, max, current, color) {
  ctx.fillStyle = "gray"; // fundo da barra
  ctx.fillRect(x, y, width, height);

  const ratio = Math.max(current / max, 0);
  ctx.fillStyle = color; // barra de vida
  ctx.fillRect(x, y, width * ratio, height);

  ctx.strokeStyle = "black";
  ctx.strokeRect(x, y, width, height); // borda
}



// Loop principal
function gameLoop() {
  updatePlayerPosition()
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Atualiza o boss da fase atual
  let boss = bosses[currentBackground];  // ⬅️ AQUI

 
drawBackground(); // primeiro desenha o fundo

if (specialStone.visible && !specialStone.collected) {
  ctx.drawImage(
    specialStone.image,
    specialStone.x,
    specialStone.y,
    specialStone.width,
    specialStone.height
  );
}

  // Verificar se o player está próximo da pedra para coletar
  const playerCenterX = player.x + (player.width * player.scale) / 2;
  const playerCenterY = player.y + (player.height * player.scale) / 2;
  const stoneCenterX = specialStone.x + specialStone.width / 2;
  const stoneCenterY = specialStone.y + specialStone.height / 2;
  
  const distanceToStone = Math.sqrt(
    (playerCenterX - stoneCenterX) ** 2 + (playerCenterY - stoneCenterY) ** 2
  );

if (
  specialStone.visible &&
  !specialStone.collected &&
  distanceToStone < 80
) {
  // Exibe o texto de interação
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "Pressione 'E' para coletar",
    specialStone.x + specialStone.width / 2,
    specialStone.y - 10
  );

  // Coletar ao pressionar 'E'
  if (keys["e"]) {
    specialStone.collected = true;
    specialStone.visible = false;
    console.log("Pedra coletada!");
    // Aqui você pode adicionar algum efeito, som ou alteração no jogo
  }
}

// Depois, desenha tudo o que vai por cima do fundo
drawHealthBar(20, canvas.height - 30, 200, 20, 100, player.currentHealth, "green");
drawHealthBar(canvas.width / 2 - 150, 20, 300, 20, boss.maxHealth, boss.currentHealth, "red");

if (boss.dead) {
  drawPortalShadow();
  ctx.drawImage(portal.image, portal.x, portal.y, portal.width, portal.height);
}

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
  player.currentHealth = 100; // Regenera a vida

}

updateBoss();
if (!boss.dead) {
  ctx.fillStyle = boss.color;
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
}


  updatePlayer();

// ⬇️ Verifica dano causado pelo player no boss durante o ataque
if (player.state.startsWith("attack") && isColliding(player, boss) && !boss.dead) {
  boss.currentHealth -= 0.5;
  if (boss.currentHealth < 0) boss.currentHealth = 0;
}

  if (player.currentHealth <= 0) {
  player.currentHealth = 0;
  player.speed = 0;
  ctx.fillStyle = "black";
  ctx.font = "40px Arial";
  ctx.fillText("Você morreu!", canvas.width / 2 - 100, canvas.height / 2);
  return; // Para interromper o jogo
}


  drawShadow();  
  drawPlayer();

  function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function updateBoss() {
  const dist = distance(player, boss);
  boss.isActive = dist < 400; // range para perseguição do boss

  if (boss.isActive && boss.currentHealth > 0) {
    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      boss.x += (dx / len) * boss.speed;
      boss.y += (dy / len) * boss.speed;
    }
  }

  // Causa dano ao player em colisão
 if (!boss.dead && isColliding(player, boss)) {
  player.currentHealth -= 0.2;
}

}
if (boss.currentHealth <= 0 && !boss.dead) {
  boss.currentHealth = 0;
  boss.isActive = false;
  boss.dead = true;

  // Faz a pedra aparecer na posição do boss
  specialStone.x = boss.x + boss.width / 2 - specialStone.width / 2;
  specialStone.y = boss.y + boss.height / 2 - specialStone.height / 2;
  specialStone.visible = true;
  specialStone.collected = false;
}



  requestAnimationFrame(gameLoop);

  
}


function updatePlayerPosition() {
  if (!player.width || !player.height) return; // impede erros antes da animação carregar

  if (keys["arrowup"] || keys["w"]) player.y -= player.speed;
  if (keys["arrowdown"] || keys["s"]) player.y += player.speed;
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;

const centerOffsetX = (player.width * player.scale) / 2;
const centerOffsetY = (player.height * player.scale) / 2;

player.x = Math.max(0 - centerOffsetX, Math.min(canvas.width - centerOffsetX, player.x));
player.y = Math.max(0 - centerOffsetY, Math.min(canvas.height - centerOffsetY, player.y));


}
