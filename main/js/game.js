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
  { image: new Image(), src: "assets/background2.png" }, // fase 2
  { image: new Image(), src: "assets/background3.png" },  // fase 3

];
let currentBackground = 0;
// 🎧 ÁUDIOS DO JOGO
const sounds = {
  sword: new Audio("assets/audio/sword-sound.mp3"),
  dead: new Audio("assets/audio/dead.mp3"),
  music: new Audio("assets/audio/musica.mp3"),
};
sounds.music.loop = true;
sounds.music.volume = 0.2; // ← volume mais baixo (20%)

sounds.music.loop = true;

backgrounds.forEach(bg => bg.image.src = bg.src);

// CONTROLE DO TECLADO
const keys = {};
document.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

let musicStarted = false;

document.addEventListener("keydown", () => {
  if (!musicStarted) {
    sounds.music.play();
    musicStarted = true;
  }
});


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
<<<<<<< HEAD
portal.image.src = "assets/portal.png";
=======
portal.image.src = "assets/itens/portal.png";
<<<<<<< HEAD

=======
>>>>>>> brntestes
>>>>>>> parent of c8632c8 (Update game.js)

// SPRITESHEET DO BOSS (fase 1)
const bossSheet = new Image();
bossSheet.src = "assets/bosses/frost_guardian_free_192x128_SpriteSheet.png";

// SPRITESHEET DOS BOSS 2 E 3
const boss2Sheet = new Image();
boss2Sheet.src = "assets/bosses/boss2.png"; // coloque o caminho certo da sprite do boss2

const boss3Sheet = new Image();
boss3Sheet.src = "assets/bosses/boss3.png"; // coloque o caminho certo da sprite do boss3


const bossAnimationData = {
  frameWidth: 192,
  frameHeight: 128,
  frameCount: 10,
  frameDelay: 6,
  animations: {
    idle: 0,
    run: 1,
    attack: 2,
    dead: 3
  },
  currentFrame: 0,
  frameCounter: 0
};


function getHitbox(entity) {
  // Valores padrão
  let x = entity.x;
  let y = entity.y;
  let width = entity.width || 0;
  let height = entity.height || 0;
  let scale = entity.scale || 1;

  // Redimensiona com escala (se existir)
  width *= scale;
  height *= scale;

  // Se for o player, ajustamos a hitbox manualmente
  if (entity === player) {
  const marginX = width * 0.58; // antes 0.2
  const marginY = height * 0.32; // antes 0.1

  x += marginX;
  y += marginY;
  width -= marginX * 2;
  height -= marginY * 2;
}

  return { x, y, width, height };
}


// DETECÇÃO DE COLISÃO PORTAL
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
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

const bossAnimations = {
  boss1: {}
};

const bossStates = ["idle", "attack", "dead"];


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
        
      if (sounds.music.paused) { // Iniciar música de fundo se ainda não estiver tocando
        
}

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
      sounds.sword.currentTime = 0;
      sounds.sword.play();

    } else if (keys["k"]) {
      changeState("attack2_" + player.direction);
      sounds.sword.currentTime = 0;
      sounds.sword.play();

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

const bosses = [
  {
<<<<<<< HEAD
  x: canvas.width - 280,
  y: 450 - 100 / 2,
  width: 150,
  height: 128,
=======
<<<<<<< HEAD
<<<<<<< HEAD
=======
<<<<<<< Updated upstream
  x: canvas.width - 240,
  y: 450 - 100 / 2,
  width: 60,
  height: 120,
  color: "darkred",
>>>>>>> parent of c8632c8 (Update game.js)
  speed: 2.0,
  maxHealth: 200,
  currentHealth: 200,
  isActive: false,
  activatedOnce: false, 
  dead: false,
  attackCooldown: 1000,
  lastAttackTime: 0,
  isAttacking: false,
  attackDuration: 400,
<<<<<<< HEAD
  facingLeft: true,
},
=======
},
=======
>>>>>>> brntestes
=======
>>>>>>> brntestes
    x: canvas.width - 240,
    y: 450 - 100 / 2,
    width: 60,
    height: 120,
    color: "darkred",
    speed: 2.0,
    maxHealth: 200,
    currentHealth: 200,
    isActive: false,
    activatedOnce: false,
    dead: false,
    attackCooldown: 1000, // 1 segundo entre ataques
    lastAttackTime: 0,
    isAttacking: false,
    attackDuration: 400,
  },
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Stashed changes
>>>>>>> brntestes
=======
>>>>>>> brntestes
>>>>>>> parent of c8632c8 (Update game.js)

  {
 x: 1300- 100 / 2,
    y: 45 - 100 / 2,
    width: 80,
    height: 140,
    color: "darkblue", // cor diferente pro boss da fase 2
    speed: 1.6,
    maxHealth: 250,
    currentHealth: 250,
    isActive: false,
    dead: false,
    attackCooldown: 1000, // 1 segundo entre ataques
    lastAttackTime: 0,
    isAttacking: false,
    attackDuration: 400, // tempo visível de ataque
<<<<<<< HEAD
    attackCooldown: 1000, // 1 segundo entre ataques
=======
<<<<<<< HEAD
<<<<<<< HEAD

=======
<<<<<<< Updated upstream
    attackCooldown: 1000, // 1 segundo entre ataques
=======

>>>>>>> Stashed changes
>>>>>>> brntestes
=======

>>>>>>> brntestes
>>>>>>> parent of c8632c8 (Update game.js)
    lastAttackTime: 0,
    facingLeft: true,
},
{
x: canvas.width - 240,
  y: 450 - 100 / 2,
  width: 60,
  height: 120,
  color: "darkred",
  speed: 2.0,
  maxHealth: 200,
  currentHealth: 200,
  isActive: false,
  activatedOnce: false, 
  dead: false,
  attackCooldown: 1000,
  lastAttackTime: 0,
  isAttacking: false,
  attackDuration: 600,
  facingLeft: true,
},

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


function drawBossFromSheet(boss, sheet) {
  let state = "idle";
  boss.facingLeft = player.x < boss.x;

  if (boss.dead && boss.deathAnimationPlayed) return;
  if (boss.dead && !boss.deathAnimationPlayed) state = "dead";
  else if (boss.isAttacking) state = "attack";
  else if (boss.isActive) state = "run";

  const animLine = bossAnimationData.animations[state];
  if (!sheet.complete) return;

  const sx = bossAnimationData.currentFrame * bossAnimationData.frameWidth;
  const sy = animLine * bossAnimationData.frameHeight;
  const sw = bossAnimationData.frameWidth;
  const sh = bossAnimationData.frameHeight;

  const offsetX = (boss.width - sw) / 2;
  const offsetY = (boss.height - sh) / 2;

  const scaleX = boss.facingLeft ? 1 : -1;
  const drawX = boss.facingLeft ? boss.x + offsetX : -(boss.x + offsetX) - sw;

  ctx.save();
  ctx.scale(scaleX, 1);

  ctx.drawImage(sheet, sx, sy, sw, sh, drawX, boss.y + offsetY, sw, sh);
  ctx.restore();

  bossAnimationData.frameCounter++;
  if (bossAnimationData.frameCounter >= bossAnimationData.frameDelay) {
    bossAnimationData.frameCounter = 0;
    if (state === "dead") {
      if (bossAnimationData.currentFrame < bossAnimationData.frameCount - 1) {
        bossAnimationData.currentFrame++;
      } else {
        boss.deathAnimationPlayed = true;
      }
    } else {
      bossAnimationData.currentFrame = (bossAnimationData.currentFrame + 1) % bossAnimationData.frameCount;
    }
  }
}



// Loop principal
function gameLoop() {
<<<<<<< HEAD
  updatePlayerPosition()
=======
<<<<<<< HEAD
<<<<<<< HEAD

=======
<<<<<<< Updated upstream
  updatePlayerPosition()
=======

>>>>>>> Stashed changes
>>>>>>> brntestes
=======

>>>>>>> brntestes
>>>>>>> parent of c8632c8 (Update game.js)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  

  // Atualiza o boss da fase atual
  let boss = bosses[currentBackground];  // ⬅️ AQUI

drawBackground(); // primeiro desenha o fundo

<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
=======
<<<<<<< Updated upstream
>>>>>>> parent of c8632c8 (Update game.js)
if (specialStone.visible && !specialStone.collected) {
  ctx.drawImage(
    specialStone.image,
    specialStone.x,
    specialStone.y,
    specialStone.width,
    specialStone.height
  );
}
<<<<<<< HEAD
=======
=======
>>>>>>> brntestes
=======
>>>>>>> brntestes
  if (
    specialStone.visible &&
    !specialStone.collected &&
    specialStone.image.complete &&
    specialStone.image.naturalWidth > 0
  ) {
    ctx.drawImage(
      specialStone.image,
      specialStone.x,
      specialStone.y,
      specialStone.width,
      specialStone.height
    );
  }
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Stashed changes
>>>>>>> brntestes
=======
>>>>>>> brntestes
>>>>>>> parent of c8632c8 (Update game.js)

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
  if (boss.dead && isColliding(player, portal)) {
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
  if (currentBackground === 0) {
    drawBossFromSheet(boss, bossSheet);
  } else if (currentBackground === 1) {
    drawBossFromSheet(boss, boss2Sheet);
  } else if (currentBackground === 2) {
    drawBossFromSheet(boss, boss3Sheet);
  }

  if (boss.isAttacking) {
  ctx.beginPath();
  ctx.arc(
    boss.x + boss.width / 2,
    boss.y + boss.height / 2,
    30,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "rgba(255, 165, 0, 0.3)";
  ctx.fill();
}

// ⬇️ Desenha a hitbox do boss
ctx.strokeStyle = "black";
ctx.strokeRect(boss.x, boss.y, boss.width, boss.height);
// ⬇️ Desenha a hitbox de ataque do boss (expandida)
const bossHitbox = {
  x: boss.x - 0.1,
  y: boss.y - 0.1,
  width: boss.width + 0.2,
  height: boss.height + 0.2,
};
ctx.strokeStyle = "orange";
ctx.strokeRect(bossHitbox.x, bossHitbox.y, bossHitbox.width, bossHitbox.height);


}


  updatePlayer();
<<<<<<< HEAD
  

// ⬇️ Verifica dano causado pelo player no boss durante o ataque
if (player.state.startsWith("attack") && isColliding(player, boss) && !boss.dead) {
  boss.currentHealth -= 2;
  if (boss.currentHealth < 0) boss.currentHealth = 0;
}
=======
<<<<<<< HEAD
=======

>>>>>>> brntestes
>>>>>>> parent of c8632c8 (Update game.js)



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

  // Hitbox do jogador
const playerHitbox = getHitbox(player);
ctx.strokeStyle = "lime"; // verde
ctx.strokeRect(playerHitbox.x, playerHitbox.y, playerHitbox.width, playerHitbox.height);


<<<<<<< HEAD
  function distance(a, b) {
=======
<<<<<<< HEAD
<<<<<<< HEAD
  function updateBoss() {
    let boss = bosses[currentBackground];
    const dist = distance(player, boss);
    if (!boss.activatedOnce && dist < 400) {
      boss.isActive = true;
      boss.activatedOnce = true;
    }
    // Ativa apenas uma vez quando o jogador se aproxima
    if (!boss.activatedOnce && dist < 200) {
      boss.isActive = true;
      boss.activatedOnce = true;
    }

    if (boss.activatedOnce && boss.currentHealth > 0 && !isColliding(player, boss)) {

      const dx = player.x - boss.x;
      const dy = player.y - boss.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        boss.x += (dx / len) * boss.speed;
        boss.y += (dy / len) * boss.speed;
      }
    }

    const now = performance.now();

    // DETECÇÃO DE ATAQUE COM DELAY
    // Aumenta a hitbox do boss para fins de ataque
    const bossHitbox = {
      x: boss.x - 1,
      y: boss.y - 1,
      width: boss.width + 1,
      height: boss.height + 1,

    };

    if (!boss.dead && isColliding(player, bossHitbox)) {
      if (!boss.isAttacking && now - boss.lastAttackTime > boss.attackCooldown) {
        boss.isAttacking = true;
        boss.lastAttackTime = now;

        setTimeout(() => {
          // Verifica novamente a colisão com a hitbox aumentada
          if (isColliding(player, bossHitbox)) {
            player.currentHealth -= 10;
          }
          boss.isAttacking = false;
        }, boss.attackDuration);
      }
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

  specialStone.collected = false;


  requestAnimationFrame(gameLoop);
}

function distance(a, b) {
=======
<<<<<<< Updated upstream
  function distance(a, b) {
>>>>>>> brntestes
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

<<<<<<< HEAD
=======
function updateBoss() {
  let boss = bosses[currentBackground];
  const dist = distance(player, boss);
  if (!boss.activatedOnce && dist < 400) {
  boss.isActive = true;
  boss.activatedOnce = true;
}
  // Ativa apenas uma vez quando o jogador se aproxima
  if (!boss.activatedOnce && dist < 200) {
    boss.isActive = true;
    boss.activatedOnce = true;
  }

if (boss.activatedOnce && boss.currentHealth > 0 && !isColliding(player, boss)) {

    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      boss.x += (dx / len) * boss.speed;
      boss.y += (dy / len) * boss.speed;
=======
=======
>>>>>>> brntestes
  function updateBoss() {
    let boss = bosses[currentBackground];
    const dist = distance(player, boss);
    if (!boss.activatedOnce && dist < 400) {
      boss.isActive = true;
      boss.activatedOnce = true;
    }
    // Ativa apenas uma vez quando o jogador se aproxima
    if (!boss.activatedOnce && dist < 200) {
      boss.isActive = true;
      boss.activatedOnce = true;
    }

    if (boss.activatedOnce && boss.currentHealth > 0 && !isColliding(player, boss)) {

      const dx = player.x - boss.x;
      const dy = player.y - boss.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        boss.x += (dx / len) * boss.speed;
        boss.y += (dy / len) * boss.speed;
      }
    }

    const now = performance.now();

    // DETECÇÃO DE ATAQUE COM DELAY
    // Aumenta a hitbox do boss para fins de ataque
    const bossHitbox = {
      x: boss.x - 1,
      y: boss.y - 1,
      width: boss.width + 1,
      height: boss.height + 1,

    };

    if (!boss.dead && isColliding(player, bossHitbox)) {
      if (!boss.isAttacking && now - boss.lastAttackTime > boss.attackCooldown) {
        boss.isAttacking = true;
        boss.lastAttackTime = now;

        setTimeout(() => {
          // Verifica novamente a colisão com a hitbox aumentada
          if (isColliding(player, bossHitbox)) {
            player.currentHealth -= 10;
          }
          boss.isAttacking = false;
        }, boss.attackDuration);
      }
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

  specialStone.collected = false;


  requestAnimationFrame(gameLoop);
}

function distance(a, b) {
>>>>>>> parent of c8632c8 (Update game.js)
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

<<<<<<< HEAD
function updateBoss() {
  let boss = bosses[currentBackground];
  const dist = distance(player, boss);
  if (!boss.activatedOnce && dist < 400) {
  boss.isActive = true;
  boss.activatedOnce = true;
}
  // Ativa apenas uma vez quando o jogador se aproxima
  if (!boss.activatedOnce && dist < 200) {
    boss.isActive = true;
    boss.activatedOnce = true;
  }

if (boss.activatedOnce && boss.currentHealth > 0 && !isColliding(player, boss)) {

    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      boss.x += (dx / len) * boss.speed;
      boss.y += (dy / len) * boss.speed;
    }
  }

  const now = performance.now();

  // DETECÇÃO DE ATAQUE COM DELAY
  // Aumenta a hitbox do boss para fins de ataque
const bossHitbox = {
 x: boss.x - 1,
 y: boss.y - 1,
 width: boss.width + 1,
 height: boss.height + 1,

};

if (!boss.dead && isColliding(player, bossHitbox)) {
  if (!boss.isAttacking && now - boss.lastAttackTime > boss.attackCooldown) {
    boss.isAttacking = true;
    boss.lastAttackTime = now;
    boss.attackFrameCount = 0;

    const attackFrames = bossAnimationData.frameCount; // total de frames de ataque
    const attackFrameDelay = bossAnimationData.frameDelay;
    const attackTotalDuration = attackFrames * attackFrameDelay * (1000 / 60); // ms

    setTimeout(() => {
      if (isColliding(player, bossHitbox)) {
        player.currentHealth -= 10; // dano real somente após animação
      }
      boss.isAttacking = false;
    }, attackTotalDuration);
  }
}


}


if (boss.currentHealth <= 0 && !boss.dead) {
  boss.currentHealth = 0;
  boss.isActive = false;
  boss.dead = true;
  sounds.dead.currentTime = 0;
  sounds.dead.play();

   // Parar música se for o último boss (fase 3)
  if (currentBackground === 2) {
    sounds.music.pause();
    sounds.music.currentTime = 0;
}

  // Faz a pedra aparecer na posição do boss
  specialStone.x = boss.x + boss.width / 2 - specialStone.width / 2;
  specialStone.y = boss.y + boss.height / 2 - specialStone.height / 2;
  specialStone.visible = true;
  specialStone.collected = false;

}

  specialStone.collected = false;


requestAnimationFrame(gameLoop);
}
  

=======
>>>>>>> brntestes
>>>>>>> parent of c8632c8 (Update game.js)
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
