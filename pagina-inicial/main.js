const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload,
        create
    }
};

const game = new Phaser.Game(config);

function preload() {
    console.log('Preloading assets...');
    this.load.image('background', 'assets/introthelost.png');
    this.load.image('play_button', 'assets/button_play.png');
    this.load.image('dicas_button', 'assets/buttonDicas.png'); // nova imagem
    this.load.image('painel_dicas', 'assets/dicasThelost.png');

}

function create() {
    const { width, height } = this.scale;

    const bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
    bg.setDisplaySize(width, height);
    bg.setScrollFactor(0);

    // Botão Play
    const buttonX = width / 2;
    const buttonY = height * 0.85;

    const playButton = this.add.image(buttonX, buttonY, 'play_button')
        .setInteractive()
        .setScale(0.1);

    this.tweens.add({
        targets: playButton,
        scale: { from: 0.4, to: 0.45 },
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });

    playButton.on('pointerover', () => playButton.setScale(0.3));
    playButton.on('pointerout', () => playButton.setScale(0.25));
    playButton.on('pointerdown', () => {
        console.log('Iniciar jogo');
        // this.scene.start('GameScene');
    });

  // Botão Dicas
let dicasTexto = null;
let dicasVisivel = false;
let dicasPainel = null;

// Posição no canto inferior direito
const buttonMargin = 20;
const dicasButton = this.add.image(this.scale.width - buttonMargin, this.scale.height - buttonMargin, 'dicas_button')
    .setOrigin(1, 1) // Alinha o canto inferior direito do botão com as coordenadas
    .setInteractive()
    .setScale(0.1); // Escala menor

// Animações de hover
dicasButton.on('pointerover', () => {
    this.tweens.add({
        targets: dicasButton,
        scale: 0.12,
        duration: 200,
        ease: 'Power2'
    });
});

dicasButton.on('pointerout', () => {
    this.tweens.add({
        targets: dicasButton,
        scale: 0.1,
        duration: 200,
        ease: 'Power2'
    });
});

// Ao clicar, exibe ou esconde o painel de dicas
dicasButton.on('pointerdown', () => {
    if (!dicasVisivel) {
        dicasPainel = this.add.image(this.scale.width / 2, this.scale.height / 2, 'painel_dicas')
            .setOrigin(0.5)
            .setScale(0.5)
            .setDepth(10);
        dicasVisivel = true;
    } else {
        dicasPainel.destroy();
        dicasVisivel = false;
    }
});

        // Fecha ao clicar em qualquer parte da tela
        this.input.once('pointerdown', () => {
            dicasPainel.destroy();
            dicasVisivel = false;
        });
    }


// Evento global para esconder o texto se clicar fora do botão
this.input.on('pointerdown', (pointer, currentlyOver) => {
    const clicouForaDoBotao = !currentlyOver.includes(dicasButton);

    if (clicouForaDoBotao && dicasVisivel) {
        dicasTexto.destroy();
        dicasTexto = null;
        dicasVisivel = false;
    }
});

