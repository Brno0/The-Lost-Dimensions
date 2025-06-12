// OBJETO DE CONTROLE DAS TECLAS
// Armazena o estado (pressionado ou não) de cada tecla usada no jogo
const keys = {
    a: { pressed: false },      // Tecla A (ou seta esquerda)
    d: { pressed: false },      // Tecla D (ou seta direita)
    w: { pressed: false },      // Tecla W (ou seta para cima ou espaço)
    space: { pressed: false },  // (não está sendo usado diretamente aqui)
    j: { pressed: false },      // Tecla J (para ações, ataque, etc)
    k: { pressed: false }       // Tecla K (também para ações)
}

// EVENTO DE TECLA PRESSIONADA
// Atualiza o estado das teclas quando são pressionadas
window.addEventListener("keydown", (e) => {
    let key = e.key // Captura a tecla pressionada

    switch (key) {
        case "arrowLeft":
        case "a":
            keys.a.pressed = true           // Marca "a" como pressionada
            player.lastKeyPressed = key     // Armazena a última tecla pressionada
            break

        case "arrowRight":
        case "d":
            keys.d.pressed = true
            player.lastKeyPressed = key
            break

        case " ":
        case "arrowUp":
        case "w":
            keys.w.pressed = true
            break

        case "j":
        case "k":
            keys.j.pressed = true
            break
    }
})

// EVENTO DE TECLA SOLTA
// Atualiza o estado das teclas quando são soltas
window.addEventListener("keyup", (e) => {
    let key = e.key // Captura a tecla liberada

    switch (key) {
        case "arrowLeft":
        case "a":
            keys.a.pressed = false
            break

        case "arrowRight":
        case "d":
            keys.d.pressed = false
            break

        case " ":
        case "arrowUp":
        case "w":
            keys.w.pressed = false
            break

        case "j":
        case "k":
            keys.j.pressed = false
            break
    }
})

// FUNÇÃO PARA LIDAR COM MOVIMENTO
function handleControls() {
    movement() // Chama a função interna de movimento

    // FUNÇÃO INTERNA DE MOVIMENTO
    function movement() {
        player.velocity.x = 0 // Reseta a velocidade horizontal do jogador

        // Move para a esquerda se a tecla 'a' ou 'ArrowLeft' for a última pressionada
        if (keys.a.pressed && ["a", "ArrowLeft"].includes(player.lastKeyPressed)) {
            player.velocity.x = -1.5 // Move para a esquerda
        }

        // Move para a direita se a tecla 'd' ou 'ArrowRight' for a última pressionada
        if (keys.d.pressed && ["d", "ArrowRight"].includes(player.lastKeyPressed)) {
            player.velocity.x = 1.5 // Move para a direita
        }

        // Pula se 'w', 'ArrowUp' ou espaço estiver pressionado e o jogador não estiver no ar
        if (keys.w.pressed && player.velocity.y === 0) {
            player.velocity.y = -16 // Salto vertical
        }
    }
}
