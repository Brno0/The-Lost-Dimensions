const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const canvasWidth = 1024
const canvasHeight = 577

canvas.width = canvasWidth
canvas.height = canvasHeight

const gravity = 0.6

class Sprite {
    constructor({ position, velocity, dimensions }) {
        this.position = position
        this.velocity = velocity
        this.width = dimensions.width
        this.height = dimensions.height
    }

    draw() {
        ctx.fillStyle = "white"
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update() {
        this.velocity.y += gravity

        if (this.position.y + this.height + this.velocity.y >= canvas.height) {
            this.velocity.y = 0
            this.position.y = canvas.height - this.height
        } else {
            this.position.y += this.velocity.y
        }

        this.position.x += this.velocity.x

        this.draw()
    }
}

// Exemplo de instâncias (substitua pela sua classe Fighter se quiser)
const player = new Sprite({
    position: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
    dimensions: { width: 50, height: 150 }
})

const player2 = new Sprite({
    position: { x: 200, y: 150 },
    velocity: { x: 0, y: 0 },
    dimensions: { width: 50, height: 150 }
})

let prevTime = 0

function animate() {
    window.requestAnimationFrame(animate)

    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    handleControls()

    player.update()
    player2.update()

    let delta = (performance.now() - prevTime) / 1000
    let fps = 1 / delta

    prevTime = performance.now()
    // console.log(`FPS: ${fps}`)
}

animate()
