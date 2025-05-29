const keys = {
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false },
    space: { pressed: false },
    j: { pressed: false },
    k: { pressed: false }
}

window.addEventListener("keydown", (e) => {
    let key = e.key
    switch (key) {
        case "arrowLeft":
        case "a":
            keys.a.pressed = true
            player.lastKeyPressed = key
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

window.addEventListener("keyup", (e) => {
    let key = e.key
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

function handleControls() {
    movement()
    function movement() {
        player.velocity.x = 0

        if (keys.a.pressed && ["a", "ArrowLeft"].includes(player.lastKeyPressed)) {
            player.velocity.x = -1.5
        }

        if (keys.d.pressed && ["d", "ArrowRight"].includes(player.lastKeyPressed)) {
            player.velocity.x = 1.5
        }

        if (keys.w.pressed && player.velocity.y === 0) {
            player.velocity.y = -16
        }
    }
}
