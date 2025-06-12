// Constante da gravidade aplicada ao personagem
const gravity = 0.6

// CLASSE BASE: Sprite
// Representa um objeto simples com posição, velocidade e dimensões
class Sprite {
    constructor({ position, velocity, dimensions }) {
        this.position = position              // Posição do objeto no canvas (x, y)
        this.velocity = velocity              // Velocidade de movimento (x, y)
        this.width = dimensions.width         // Largura do objeto
        this.height = dimensions.height       // Altura do objeto
    }

    // Desenha o objeto no canvas como um retângulo branco
    draw() {
        ctx.fillStyle = "white" // Cor do retângulo
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    // Atualiza a posição do objeto e aplica gravidade
    update() {
        // Aplica a gravidade na velocidade vertical
        this.velocity.y += gravity

        // Verifica se o objeto colidiu com o "chão" (base do canvas)
        if (this.position.y + this.height + this.velocity.y >= canvas.height) {
            this.velocity.y = 0                             // Para de cair
            this.position.y = canvas.height - this.height   // Alinha com o chão
        } else {
            this.position.y += this.velocity.y // Continua caindo
        }

        // Atualiza a posição horizontal com base na velocidade
        this.position.x += this.velocity.x

        // Desenha o sprite com a nova posição
        this.draw()
    }
}

// CLASSE DERIVADA: Fighter (lutador)
// Herda de Sprite e pode ter funcionalidades adicionais específicas
class Fighter extends Sprite {
    constructor({ position, velocity, dimensions }) {
        super({ position, velocity, dimensions }) // Chama o construtor da classe pai

        this.lastKeyPressed = '' // Armazena a última tecla de movimento pressionada
    }
}

// INSTÂNCIA DO PRIMEIRO JOGADOR
const player = new Fighter({
    position: {
        x: 100,
        y: 100 // Posição inicial no canvas
    },
    velocity: {
        x: 0,
        y: 0 // Começa parado
    },
    dimensions: {
        width: 50,
        height: 150 // Tamanho do personagem
    }
})

// INSTÂNCIA DO SEGUNDO JOGADOR
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
