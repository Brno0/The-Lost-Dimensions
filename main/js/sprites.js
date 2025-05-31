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

class Fighter extends Sprite {
    constructor({ position, velocity, dimensions }) {
        super({
            position,
            velocity,
            dimensions
        })

        this.lastKeyPressed = ''
    }
}

const player = new Fighter({
    position: {
        x: 100,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    dimensions: {
        width: 50,
        height: 150
    }
})

const player2 = new Fighter({
    position: {
        x: 200,
        y: 150
    },
    velocity: {
        x: 0,
        y: 0
    },
    dimensions: {
        width: 50,
        height: 150
    }
})
