// CONFIGURAÇÃO DO CANVAS
const canvas = document.getElementById("gameCanvas"); // Pega o elemento <canvas> do HTML
const ctx = canvas.getContext("2d"); // Contexto para desenhar em 2D

// VARIÁVEIS DE CONTROLE DE FASES E TRANSIÇÕES
let faseInicialAtiva = true;
let tempoTransicao = 0;
let faseTransicaoAtiva = false;
let tempoTransicaoFase = 0;
const tempoExibirMensagem = 2;   // segundos de exibição da mensagem da fase
const tempoExibirTransicao = 2;  // segundos de exibição da tela de transição

// AJUSTA O TAMANHO DO CANVAS PARA A TELA DO USUÁRIO
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas(); // Chama ao carregar
window.addEventListener("resize", resizeCanvas); // Chama ao redimensionar a tela

// IMAGENS DE FUNDO DAS FASES
const backgrounds = [
  { image: new Image(), src: "assets/mapas/background.png" },   // Fase 1
  { image: new Image(), src: "assets/mapas/background2.png" },  // Fase 2
  { image: new Image(), src: "assets/mapas/background3.png" },  // Fase 3
];

// IMAGENS DAS PEDRAS COLETÁVEIS
const stoneImages = [
  new Image(),
  new Image(),
  new Image()
]

// BARRA DE ITENS (HUD)
const hotbarImage = new Image();
hotbarImage.src = "assets/itens/hotbar.png";

// Define as imagens de cada pedra
stoneImages[0].src = "assets/pedras/gelo.png";   // Pedra de Gelo
stoneImages[1].src = "assets/pedras/terra.png";  // Pedra de Terra
stoneImages[2].src = "assets/pedras/fogo.png";   // Pedra de Fogo

// ARRAY QUE ARMAZENA QUAIS PEDRAS FORAM COLETADAS
const collectedStones = [false, false, false];

// Define a fase atual
let currentBackground = 0;

// 🎧 ÁUDIOS DO JOGO
const sounds = {
  sword: new Audio("assets/audio/sword-sound.mp3"),   // Som de espada
  dead: new Audio("assets/audio/dead.mp3"),           // Som de morte
  music: new Audio("assets/audio/musica.mp3"),        // Música de fundo
};
sounds.music.loop = true;
sounds.music.volume = 0.1; // Define o volume da música em 10%

// CARREGA TODAS AS IMAGENS DE FUNDO
backgrounds.forEach(bg => bg.image.src = bg.src);

// CONTROLE DE TECLADO
const keys = {};
document.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);  // Marca tecla pressionada
document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);   // Marca tecla solta

// TOCA A MÚSICA QUANDO O JOGADOR PRESSIONAR QUALQUER TECLA PELA PRIMEIRA VEZ
let musicStarted = false;
document.addEventListener("keydown", () => {
  if (!musicStarted) {
    sounds.music.play();
    musicStarted = true;
  }
});

// OBJETO DO PERSONAGEM (HAGNAR)
const player = {
  x: 100,
  y: 100,
  frame: 0,            // Frame atual da animação
  frameDelay: 4,       // Delay entre os frames (velocidade da animação)
  frameCounter: 0,     // Contador para controlar o tempo do frame
  speed: 10,           // Velocidade de movimento
  direction: "down",   // Direção atual
  state: "idle_down",  // Estado atual (parado, andando, etc)
  animations: {},      // Objeto onde ficarão as animações carregadas
  width: 64,
  height: 64,
  scale: 2.0,          // Escala (tamanho ampliado do sprite)
  shadowOffsetY: 0.88, // Posição da sombra
  currentHealth: 100,  // Vida atual do jogador
};

// CONTROLE DE CURA AUTOMÁTICA NO PONTO DE RESSPAWN
let lastHealTime = 0;      // Último tempo de cura
const healCooldown = 900;  // Intervalo mínimo entre curas (ms)
const healAmount = 8;      // Quantidade de vida recuperada

// FUNÇÃO PARA RESSPAWNAR O JOGADOR EM UMA POSIÇÃO ESPECÍFICA
function respawnPlayerAt(x, y) {
  player.x = x;
  player.y = y;

  spawnPoint.x = x;
  spawnPoint.y = y;
  spawnPoint.visible = true;
}

// CONFIGURAÇÕES DOS PORTAIS DE SAÍDA DAS FASES
const portalConfigs = [
  { x: canvas.width - 120, y: 70 },                    // Portal da fase 1
  { x: canvas.width / 2 - 64, y: canvas.height - 140 }, // Portal da fase 2
  { x: canvas.width / 2 - 64, y: canvas.height - 140 }, // Portal da fase 3
];

// CONFIGURAÇÕES DE PONTO DE ENTRADA (SPAWN) DAS FASES
const spawnConfigs = [
  { x: 90, y: 350 },     // Spawn fase 1
  { x: 200, y: 300 },    // Spawn fase 2
  { x: 150, y: 250 }     // Spawn fase 3
];

// PORTAL ENTRE FASES
const portal = {
  x: portalConfigs[0].x,  // Posição x baseada na fase atual (inicialmente fase 1)
  y: portalConfigs[0].y,  // Posição y baseada na fase atual
  width: 128,             // Largura do portal
  height: 128,            // Altura do portal
  image: new Image(),     // Criação do objeto de imagem
};
portal.image.src = "assets/itens/portal.png"; // Caminho da imagem do portal

// PONTO DE RESSPAWN DO JOGADOR
const spawnPoint = {
  x: 50,
  y: 50,
  width: 110,
  height: 110,
  image: new Image(),
  visible: true           // Se o spawnPoint deve ser desenhado (visível)
};
spawnPoint.image.src = "assets/itens/spawn.png"; // Caminho da imagem do spawn

// SPRITESHEET DO BOSS (FASE 1)
const bossSheet = new Image();
bossSheet.src = "assets/bosses/frost_guardian_free_192x128_SpriteSheet.png";

// SPRITESHEET DO BOSS (FASE 2)
const boss2Sheet = new Image();
boss2Sheet.src = "assets/bosses/minotaur_288x160_SpriteSheet.png"; // Caminho da sprite do boss 2

// SPRITESHEET DO BOSS (FASE 3)
const boss3Sheet = new Image();
boss3Sheet.src = "assets/bosses/boss3.png"; // Caminho da sprite do boss 3

// DADOS DE ANIMAÇÃO DE CADA BOSS (1 por fase)
const bossAnimationData = [
  {
    frameWidth: 192,       // Largura de cada frame
    frameHeight: 128,      // Altura de cada frame
    frameCount: 10,        // Número total de frames na spritesheet
    frameDelay: 6,         // Delay entre frames
    animations: {
      idle: 0,             // Índice da animação idle (parado)
      run: 1,
      attack: 2,
      dead: 3
    },
    currentFrame: 0,
    frameCounter: 0
  },
  {
    frameWidth: 288,
    frameHeight: 160,
    frameCount: 7,
    frameDelay: 6,
    animations: {
      idle: 0,
      run: 1,
      attack: 2,
      dead: 3
    },
    currentFrame: 0,
    frameCounter: 0
  },
  {
    frameWidth: 288,
    frameHeight: 160,
    frameCount: 8,
    frameDelay: 5,
    animations: {
      idle: 0,
      run: 1,
      attack: 2,
      dead: 3
    },
    currentFrame: 0,
    frameCounter: 0
  }
];

// FUNÇÃO QUE CALCULA A HITBOX DE QUALQUER ENTIDADE (ex: player ou boss)
function getHitbox(entity) {
  // Posição e tamanho inicial
  let x = entity.x;
  let y = entity.y;
  let width = entity.width || 0;
  let height = entity.height || 0;
  let scale = entity.scale || 1;

  // Aplica escala ao tamanho
  width *= scale;
  height *= scale;

  // Ajuste manual da hitbox do player para maior precisão
  if (entity === player) {
    const marginX = width * 0.58; // margem lateral (antes 0.2)
    const marginY = height * 0.32; // margem vertical (antes 0.1)
    x += marginX;
    y += marginY;
    width -= marginX * 2;
    height -= marginY * 2;
  }

  return { x, y, width, height }; // Retorna a hitbox final
}

// FUNÇÃO DE COLISÃO RETANGULAR (eixo-alinhado)
// Verifica se o retângulo A colide com o retângulo B
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// COLISÃO CIRCULAR (ex: aura, efeito, ataque em área)
// Verifica se o centro dos objetos A e B estão a uma certa distância (raio)
function isCircleColliding(a, b, radius) {
  const dx = (a.x + a.width / 2) - (b.x + b.width / 2);
  const dy = (a.y + a.height / 2) - (b.y + b.height / 2);
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < radius;
}

// FUNÇÃO QUE DESENHA A SOMBRA DO PORTAL
function drawPortalShadow() {
  // Define o tamanho da sombra proporcional ao portal
  const shadowWidth = portal.width * 0.8;
  const shadowHeight = portal.height * 0.30;

  // Posição da sombra no chão
  const shadowX = portal.x + (portal.width - shadowWidth) / 2;
  const shadowY = portal.y + portal.height - shadowHeight * 0.8;

  // Desenha uma elipse escura como sombra
  ctx.save(); // Salva o estado do canvas
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)"; // Cor da sombra com transparência
  ctx.beginPath();
  ctx.ellipse(
    shadowX + shadowWidth / 2,      // centro X
    shadowY + shadowHeight / 2,     // centro Y
    shadowWidth / 2,                // raio X
    shadowHeight / 2,               // raio Y
    0, 0, Math.PI * 2
  );
  ctx.fill();
  ctx.restore(); // Restaura o estado anterior
}
// CARREGAMENTO DE ANIMAÇÕES DO PLAYER
let loadedCount = 0; // Contador de imagens carregadas
const directions = ["down", "left", "right", "up"]; // Direções possíveis
const totalToLoad = directions.length * 4; // Total esperado: 4 animações por direção (idle, run, attack1, attack2)

const bossAnimations = {
  boss1: {} // Placeholder para futuras animações do boss
};

const bossStates = ["idle", "attack", "dead"]; // Estados animados do boss

// Função que carrega uma animação e armazena no player.animations
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

    // Quando todas as animações forem carregadas, inicia o jogo
    if (loadedCount === totalToLoad) {
      respawnPlayerAt(50, 50); // Posiciona o jogador
      gameLoop();              // Inicia o loop do jogo

      if (sounds.music.paused) {
        // (Este trecho está incompleto — talvez você queira iniciar a música aqui)
      }
    }
  };
}

// Carregamento das animações do personagem
directions.forEach(dir => {
  loadSprite(`idle_${dir}`, `assets/player/idle_${dir}.png`, 8);
  loadSprite(`run_${dir}`, `assets/player/run_${dir}.png`, 8);
  loadSprite(`attack1_${dir}`, `assets/player/attack1_${dir}.png`, 8);
  loadSprite(`attack2_${dir}`, `assets/player/attack2_${dir}.png`, 8);
});

// =======================
// DESENHO NA TELA
// =======================

// Desenha o fundo da fase atual
function drawBackground() {
  const bg = backgrounds[currentBackground].image;
  if (bg.complete) {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  }
}

// Desenha o personagem Hagnar na tela
function drawPlayer() {
  const anim = player.animations[player.state];
  if (!anim || !anim.image.complete) return;

  const frameW = anim.frameWidth;
  const frameH = anim.frameHeight;
  const sx = player.frame * frameW;

  const scaledW = frameW * player.scale;
  const scaledH = frameH * player.scale;

  // Desenha o sprite com escala aplicada
  ctx.drawImage(
    anim.image,
    sx, 0,
    frameW, frameH,
    player.x, player.y,
    scaledW, scaledH
  );
}

// Desenha a sombra do personagem Hagnar no chão
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

// =======================
// LÓGICA DO JOGADOR
// =======================

// Altera o estado (animação) do personagem
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

  // Ajuste da sombra de acordo com o estado
  player.shadowOffsetY = 0.65;
}

// Atualiza posição, estado e animação do personagem
function updatePlayer() {
  let dx = 0, dy = 0;

  // Movimento vertical
  if (keys["w"]) {
    dy = -1;
    player.direction = "up";
  } else if (keys["s"]) {
    dy = 1;
    player.direction = "down";
  }

  // Movimento horizontal
  if (keys["a"]) {
    dx = -1;
    player.direction = "left";
  } else if (keys["d"]) {
    dx = 1;
    player.direction = "right";
  }

  const isMoving = dx !== 0 || dy !== 0;
  const currentAnim = player.animations[player.state];

  // Se estiver atacando, espera a animação terminar antes de aceitar novo comando
  if (player.state.startsWith("attack")) {
    if (player.frame >= currentAnim?.frameCount - 1) {
      changeState("idle_" + player.direction);
    }
  } else {
    const isInSpawn = isColliding(getHitbox(player), spawnPoint);

    // Ataques
    if (keys["j"] && !isInSpawn) {
      changeState("attack1_" + player.direction);
      sounds.sword.currentTime = 0;
      sounds.sword.play();
    } else if (keys["k"] && !isInSpawn) {
      changeState("attack2_" + player.direction);
      sounds.sword.currentTime = 0;
      sounds.sword.play();

    // Movimento
    } else if (isMoving) {
      player.x += dx * player.speed;
      player.y += dy * player.speed;
      changeState("run_" + player.direction);

    // Parado
    } else {
      changeState("idle_" + player.direction);
    }
  }

  // Atualiza o frame da animação atual
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
// LISTA DE BOSS (UM PARA CADA FASE)
const bosses = [
  {
    // Boss da fase 1
    x: canvas.width * 0.786,
    y: canvas.height * 0.50,
    width: 150,
    height: 128,
    speed: 2.0,             // Velocidade de movimento do boss
    maxHealth: 800,
    currentHealth: 800,
    isActive: false,        // Ativo no momento? (true após ativação)
    activatedOnce: false,   // Já foi ativado alguma vez?
    dead: false,            // Está morto?
    attackCooldown: 1000,   // Tempo entre ataques (em ms)
    lastAttackTime: 0,      // Último tempo que atacou
    isAttacking: false,     // Está atacando agora?
    attackDuration: 400,    // Duração de um ataque (ms)
    facingLeft: true,
    scale: 1.4,
    currentAnimState: "idle", // Animação atual
    currentFrame: 0,
    frameCounter: 0
  },

  {
    // Boss da fase 2
    x: canvas.width * 0.803,
    y: canvas.height * -0.08, // Começa fora da tela (posição inicial)
    width: 80,
    height: 140,
    speed: 1.6,
    maxHealth: 1000,
    currentHealth: 1000,
    isActive: false,
    dead: false,
    attackCooldown: 1000,
    lastAttackTime: 0,
    isAttacking: false,
    attackDuration: 400,
    facingLeft: true,
    scale: 1.2,
  },

  {
    // Boss da fase 3
    x: canvas.width * 0.808,
    y: canvas.height * -0.10, // Começa fora da tela
    width: 60,
    height: 120,
    speed: 2.0,
    maxHealth: 1300,
    currentHealth: 1300,
    isActive: false,
    activatedOnce: false,
    dead: false,
    attackCooldown: 1000,
    lastAttackTime: 0,
    isAttacking: false,
    attackDuration: 600,
    facingLeft: true,
    scale: 1.2,
  },
];

// PEDRA ESPECIAL (DROP DO BOSS)
const specialStone = {
  x: 0,
  y: 0,
  width: 32,
  height: 32,
  collected: false,   // Se já foi coletada
  visible: false,     // Se deve ser desenhada na tela
  image: new Image(), // Imagem da pedra
};
specialStone.image.src = "assets/pedras/gelo.png"; // Caminho do asset

// *** ATAQUE DO PLAYER NO BOSS ***
if (player.state.startsWith("attack") && isColliding(player, boss)) {
  boss.currentHealth -= 0.5; // Aplica dano leve por ataque
  if (boss.currentHealth < 0) boss.currentHealth = 0;
}

// FUNÇÃO PARA DESENHAR A BARRA DE VIDA
function drawHealthBar(x, y, width, height, max, current, color) {
  ctx.fillStyle = "gray"; // Cor de fundo (barra vazia)
  ctx.fillRect(x, y, width, height);

  const ratio = Math.max(current / max, 0); // Proporção de vida restante
  ctx.fillStyle = color; // Cor da vida (verde, vermelho etc.)
  ctx.fillRect(x, y, width * ratio, height); // Preenche conforme a vida

  ctx.strokeStyle = "black";
  ctx.strokeRect(x, y, width, height); // Borda da barra
}

function drawBossFromSheet(boss, sheet) {
  let state = "idle"; // Estado padrão do boss

  // Define se o boss está virado para a esquerda ou direita com base na posição do player
  boss.facingLeft = player.x < boss.x;

  // Decide qual estado de animação o boss deve exibir
  if (boss.dead) {
    state = boss.deathAnimationPlayed ? "idle" : "dead"; // Se morreu e já terminou animação, volta ao idle
  } else if (boss.isAttacking) {
    state = "attack";
  } else if (boss.isActive) {
    state = "run";
  }

  // Obtém dados da animação da fase atual
  const animData = bossAnimationData[currentBackground];
  const animLine = animData.animations[state]; // Linha da spritesheet referente ao estado

  // Se mudou de estado, reinicia o frame e contador
  if (boss.currentAnimState !== state) {
    boss.currentAnimState = state;
    boss.currentFrame = 0;
    boss.frameCounter = 0;
  }

  // Evita desenhar caso a imagem ainda esteja carregando
  if (!sheet.complete) return;

  // Calcula a área do frame atual na spritesheet
  const sx = boss.currentFrame * animData.frameWidth;
  const sy = animLine * animData.frameHeight;
  const sw = animData.frameWidth;
  const sh = animData.frameHeight;

  // Calcula deslocamento para centralizar o sprite
  const offsetX = (boss.width - sw) / 2;
  const offsetY = (boss.height - sh) / 2;

  // Inverte o desenho se o boss estiver virado para a direita
  const scaleX = boss.facingLeft ? 1 : -1;
  const drawX = boss.facingLeft ? boss.x + offsetX : -(boss.x + offsetX) - sw;

  // Desenha o sprite
  ctx.save();
  ctx.scale(scaleX, 1); // Inversão horizontal
  ctx.drawImage(sheet, sx, sy, sw, sh, drawX, boss.y + offsetY, sw * boss.scale, sh * boss.scale);
  ctx.restore();

  // Avança o frame da animação
  boss.frameCounter++;
  if (boss.frameCounter >= animData.frameDelay) {
    boss.frameCounter = 0;
    if (state === "dead") {
      if (boss.currentFrame < animData.frameCount - 1) {
        boss.currentFrame++;
      } else {
        boss.deathAnimationPlayed = true;
      }
    } else {
      boss.currentFrame = (boss.currentFrame + 1) % animData.frameCount;
    }
  }
}

function nomeFase(numero) {
  const nomes = ["primeira", "segunda", "terceira"];
  return nomes[numero] || '${numero + 1}ª'; // Caso seja além da terceira
}

// Loop principal
function gameLoop() {
  updatePlayerPosition()
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (faseInicialAtiva || faseTransicaoAtiva) {
    tempoTransicao += 1 / 60;
    if (faseTransicaoAtiva) tempoTransicaoFase += 1 / 60;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '28px "Press Start 2P", monospace';
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";

    const nomeFaseAtual = ["primeira", "segunda", "terceira"][currentBackground] || `${currentBackground + 1}ª`;
    ctx.fillText(`Iniciando a ${nomeFaseAtual} fase.`, canvas.width / 2, canvas.height / 2);

    if (faseInicialAtiva && tempoTransicao >= tempoExibirMensagem) {
      faseInicialAtiva = false;
    }

    if (faseTransicaoAtiva && tempoTransicaoFase >= tempoExibirTransicao) {
      faseTransicaoAtiva = false;
      tempoTransicaoFase = 0;
    }

    requestAnimationFrame(gameLoop);
    return;
  }

function drawHotbar() {
  const hotbarWidth = 250;
  const hotbarHeight = 90;
  const padding = 10;
  const x = canvas.width - hotbarWidth - padding;
  const y = canvas.height - hotbarHeight - padding;

  // Desenha a imagem da hotbar
  ctx.drawImage(hotbarImage, x, y, hotbarWidth, hotbarHeight);

  const slotCount = 3;
  const slotWidth = 64;
  const slotHeight = 64;
  const slotSpacing = 8;
  const stoneSize = 40;

  const totalWidth = (slotWidth * slotCount) + (slotSpacing * (slotCount - 1));
  const startX = x + (hotbarWidth - totalWidth) / 2;
  const slotY = y + (hotbarHeight - slotHeight) / 2;

  for (let i = 0; i < slotCount; i++) {
    if (collectedStones[i]) {
      const slotX = startX + i * (slotWidth + slotSpacing);
      const centerX = slotX + slotWidth / 2;
      const centerY = slotY + slotHeight / 2;

      // Valores individuais de ajuste fino para cada pedra
      let offsetX = 0;
      let offsetY = 0;

      if (i === 0) { // Gelo
        offsetX = -18;
        offsetY = 1;
      } else if (i === 1) { // Terra
        offsetX = -3;
        offsetY = 1;
      } else if (i === 2) { // Fogo
        offsetX = 10;
        offsetY = 1;
      }

      ctx.drawImage(
        stoneImages[i],
        centerX - stoneSize / 2 + offsetX,
        centerY - stoneSize / 2 + offsetY,
        stoneSize,
        stoneSize
      );
    }
  }
}


  // Atualiza o boss da fase atual
  let boss = bosses[currentBackground];  // ⬅️ AQUI

drawBackground(); // primeiro desenha o fundo

if (spawnPoint.visible) {
  ctx.drawImage(spawnPoint.image, spawnPoint.x, spawnPoint.y, spawnPoint.width, spawnPoint.height);
}

if (currentBackground === 0) {
    specialStone.image.src = "assets/pedras/gelo.png";
  } else if (currentBackground === 1) {
    specialStone.image.src = "assets/pedras/terra.png";
    } else if (currentBackground === 2) {
    specialStone.image.src = "assets/pedras/fogo.png";
  }


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

    collectedStones[currentBackground] = true;

    console.log("Pedra coletada!");
  }
}

// Depois, desenha tudo o que vai por cima do fundo
drawHealthBar(20, canvas.height - 30, 200, 20, 100, player.currentHealth, "green");
drawHealthBar(canvas.width / 2 - 150, 20, 300, 20, boss.maxHealth, boss.currentHealth, "red");

if (boss.dead) {
  if (specialStone.visible === false) {
  drawPortalShadow();
  ctx.drawImage(portal.image, portal.x, portal.y, portal.width, portal.height);

}
}

  //Verificar colisão do portal
  if (boss.dead && specialStone.visible === false && isColliding(player, portal)) {
  if (currentBackground === 2) {
    window.location.href = "../pagina-final/html/index.html";
  } else {
    currentBackground++;
    faseTransicaoAtiva = true;
    tempoTransicaoFase = 0;

    // Atualiza posição do portal com base na nova fase
    const config = portalConfigs[currentBackground] || portalConfigs[0];
    portal.x = config.x;
    portal.y = config.y;

    respawnPlayerAt(50, 50);
  }


  // Atualiza posição do portal com base na nova fase
  const config = portalConfigs[currentBackground] || portalConfigs[0];
  portal.x = config.x;
  portal.y = config.y;
  player.x = canvas.width * 0.2;
  player.y = canvas.height * 0.7;
 // ou qualquer posição central que você queira

}

  spawnPoint.x = spawnConfigs[currentBackground].x;
  spawnPoint.y = spawnConfigs[currentBackground].y;
  spawnPoint.visible = true;



updateBoss();
if (!boss.dead) {
  if (currentBackground === 0) {
    drawBossFromSheet(boss, bossSheet, 0);  // boss fase 1

  } else if (currentBackground === 1) {
    drawBossFromSheet(boss, boss2Sheet, 1); // para o boss da fase 2
  } else if (currentBackground === 2) {
    drawBossFromSheet(boss, boss3Sheet, 2); // boss fase 3
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
 }
}


 updatePlayer();

if (spawnPoint.visible && isColliding(getHitbox(player), spawnPoint)) {
  const now = performance.now();
  if (now - lastHealTime >= healCooldown && player.currentHealth < 100) {
    player.currentHealth += healAmount;
    if (player.currentHealth > 100);
    lastHealTime = now;
    console.log("Cura gradual no Spawn! Vida atual:", player.currentHealth);
  }
}


  
// ⬇️ Verifica dano causado pelo player no boss durante o ataque
if (player.state.startsWith("attack") && isColliding(player, boss) && !boss.dead) {
  boss.currentHealth -= 2;
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
  drawHotbar();


 


  function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

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

    const animData = bossAnimationData[currentBackground];
    const attackFrames = animData.frameCount;
    const attackFrameDelay = animData.frameDelay;

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
  

function updatePlayerPosition() {
const hitbox = getHitbox(player);

// MARGENS DE SEGURANÇA (ajuste se quiser mais ou menos)
const margemLateral = 35; // distancia extra que ele vai ficar afastado da borda
const margemVertical = 0; // mantemos o topo e base como estão

// CIMA E BAIXO — permanece igual
if (hitbox.y < 0) player.y -= hitbox.y;
if (hitbox.y + hitbox.height > canvas.height)
  player.y -= (hitbox.y + hitbox.height - canvas.height);

// LADOS — com margem
if (hitbox.x < margemLateral)
  player.x += margemLateral - hitbox.x;

if (hitbox.x + hitbox.width > canvas.width - margemLateral)
  player.x -= (hitbox.x + hitbox.width - (canvas.width - margemLateral));

}
