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

    var setCookie = function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + ((exdays || 365)*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    };

    var getCookie = function(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };

    var deleteCookie = function(cname) {
        setCookie(cname,"",-1);
    };

    var Init = function (game) {

        this.init = function (args) {
            highScore = getCookie("highScore") || 0;
        };

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
            game.state.start("title", true, false, {
                highScore: highScore
            });
        };
    };

    var Title = function (game) {

        this.init = function (args) {
            if (args.endGame === true) {
                if (args.score > highScore) {
                    highScore = args.score;
                    setCookie("highScore", highScore);
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