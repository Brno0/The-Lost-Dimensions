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
    this.load.image('background', 'assets/intro_background.png');
    this.load.image('play_button', 'assets/button_play.png');
}


function create() {
    const { width, height } = this.scale;

    // Fundo esticado para preencher completamente a tela
    const bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
    bg.setDisplaySize(width, height);
    bg.setScrollFactor(0);

    // POSICIONAMENTO DO BOTÃO
    const buttonX = width / 2;
const buttonY = height * 0.45;


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

    playButton.on('pointerover', () => {
        playButton.setScale(0.3);
    });

    playButton.on('pointerout', () => {
        playButton.setScale(0.25);
    });

    playButton.on('pointerdown', () => {
        console.log('Iniciar jogo');
        // this.scene.start('GameScene');
    });
}