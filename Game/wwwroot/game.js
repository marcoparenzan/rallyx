requirejs.config({
    baseUrl: '.',
    paths: {}
});

requirejs([
    "solo",
], function (
    Solo
) {
    game = new Phaser.Game(1280, 960, Phaser.CANVAS, "Rally-X");
    var highScore;

    var Init = function (game) {

        this.preload = function () {
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
            // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

            //game.load.audio('default', ['captured.wav']);
        };

        this.create = function () {

            // var backgroundMusic = game.add.audio('default');
            // backgroundMusic.loop = true;
            // backgroundMusic.play();

            // starting ARCADE physics
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.state.start("title");
        };
    };

    var Title = function (game) {

        this.init = function (args) {
            if (args !== undefined) {
                if (highScore !== undefined) {
                    if (highScore < args.score) highScore = args.score;
                }
                else {
                    highScore = args.score;
                }
            }
        };

        this.preload = function () {
            game.load.image("title", "assets/title.png");
        };

        this.start = function () {
            game.state.start("solo", true, false, {
                highScore: highScore
            });
        };

        this.create = function () {
            var self = this;
            game.add.sprite(0, 0, 'title');

            game.input.onDown.add(function (e) {
                self.start();
            }, self);

            // handle keyboard
            game.input.keyboard.onDownCallback = function (ev) {
                switch (ev.keyCode) {
                    case 17:
                    case 32:
                        self.start();
                        break;
                }
            };
        };
    };

    game.state.add("init", new Init(game));
    game.state.add("title", new Title(game));
    game.state.add("solo", new Solo(game));
    game.state.start("init");
});