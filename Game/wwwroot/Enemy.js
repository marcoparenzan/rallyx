define([], function () {

    var spriteframes = {
        "00": [7,8,9],
        "cube": [10,11,12],
        "02": [13,14,15],
        "03": [16,17,18],
        "04": [19,20,21],
        "05": [22,23,24],
        "06": [25,26,27],
        "07": [28,29,30],
        "08": [31,32,33],
        "09": [34,35,36],
        "copterside": [37,38,39],
        "11": [40,41,42],
        "12": [43,44,45],
        "13": [46,47,48],
        "14": [49,50,51],
        "bomb": [52],
        "medicine": [53],
        "copterfront": [54,55,56],
        "18": [57,58,59],
        "19": [60,61,62],
        "20": [63,64,65],
        "21": [66],
        "22": [67],
        "press": [68],
        "generator": [69],
        "barriers": [70,71,72,73],
        "digit": [74,75,76,77,78,79,80,81,82,83],
        "square": [84,85,86],
        "28": [87,88,89],
        "29": [90,91,92],
        "30": [93,94,95],
        "31": [96,97,98],
        "32": [99,100,101],
        "tank": [102,103,104],
        "34": [105,106,107],
        "35": [108,109,110],
        "36": [111,112,113],
        "37": [114,115,116],
        "leftexit": [117],
        "rightexit": [118],
        "leftrightexit": [119],
        "41": [120,121,122],
        "42": [123,124,125],
        "gun": [126,127]
    };

    return function (game, config) {
        var self = this;

        self.oncreate = config.oncreate;
        self.onrestart = config.onrestart;
        self.onupdatelevel = config.onupdatelevel;
        if (config.mode == "lr") {
            self.oncreate = function (enemy) {
            };
            self.onrestart = function (enemy) {
                enemy.sprite.x = config.x0;
                enemy.sprite.y = config.y0;
                enemy.right();
            };
            self.onupdatelevel = function (enemy) {
                if (enemy.sprite.x >= config.x2) {
                    enemy.left();
                }
                if (enemy.sprite.x <= config.x1) {
                    enemy.right();
                }
            };
        }
        else if (config.mode == "ud") {
            self.oncreate = function (enemy) {
            };
            self.onrestart = function (enemy) {
                enemy.sprite.x = config.x0;
                enemy.sprite.y = config.y0;
                enemy.down();
            };
            self.onupdatelevel = function (enemy) {
                if (enemy.sprite.y >= config.y2) {
                    enemy.up();
                }
                if (enemy.sprite.y <= config.y1) {
                    enemy.down();
                }
            };
        }

        self.preload = function () {
            game.load.spritesheet(config.name, "images/enemy.png", 24, 21);
            return self;
        };

        self.create = function () {
            // adding the hero sprite
            self.sprite = game.add.sprite(config.x0, config.y0, config.name);
            self.sprite.animations.add('base', spriteframes[config.spriteframesname], 6, true);

            // enabling ARCADE physics for the  hero
            game.physics.enable(self.sprite, Phaser.Physics.ARCADE);
            // setting hero gravity
            self.sprite.body.gravity.x = 0;
            self.sprite.body.gravity.y = 0;

            // setting hero anchor point
            self.sprite.anchor.x = 0.5;
            self.sprite.anchor.y = 1.0;
            if (self.oncreate != undefined) self.oncreate(self);
            return self;
        };

        self.restart = function () {
            self.sprite.x = config.x0;
            self.sprite.y = config.y0;
            if (self.onrestart != undefined) self.onrestart(self);
            return self;
        }

        self.suspend = function () {
            self.sprite.body.velocity.x = 0;
            self.sprite.body.velocity.y = 0;
            self.sprite.animations.stop();
            return self;
        };

        self.left = function () {
            if (self.sprite.body.velocity.x >= 0) {
                self.sprite.body.velocity.x = -config.speed;
                self.sprite.animations.play("base");
            }
            return self;
        };

        self.right = function () {
            if (self.sprite.body.velocity.x <= 0) {
                self.sprite.body.velocity.x = config.speed;
                self.sprite.animations.play("base");
            }
            return self;
        };

        self.up = function () {
            if (self.sprite.body.velocity.y >= 0) {
                self.sprite.body.velocity.y = -config.speed;
                self.sprite.animations.play("base");
            }
            return self;
        };

        self.down = function () {
            if (self.sprite.body.velocity.y <= 0) {
                self.sprite.body.velocity.y = config.speed;
                self.sprite.animations.play("base");
            }
            return self;
        };

        self.stopright = function () {
            if (self.sprite.body.velocity.x > 0) {
                self.sprite.body.velocity.x = 0;
                self.sprite.animations.stop();
            }
            return self;
        };

        self.stopleft = function () {
            if (self.sprite.body.velocity.x < 0) {
                self.sprite.body.velocity.x = 0;
                self.sprite.animations.stop();
            }
            return self;
        };

        self.stopdown = function () {
            if (self.sprite.body.velocity.y > 0) {
                self.sprite.body.velocity.y = 0;
                self.sprite.animations.stop();
            }
            return self;
        };

        self.stopup = function () {
            if (self.sprite.body.velocity.y < 0) {
                self.sprite.body.velocity.y = 0;
                self.sprite.animations.stop();
            }
            return self;
        };

        self.updatelevel = function (level) {

            if (self.onupdatelevel != undefined) self.onupdatelevel(self);

            // handling collision between the hero and the tiles
            self.onFloor = false;
            game.physics.arcade.collide(self.sprite, level.layer, function (that, layer) {
                self.onFloor = that.body.blocked.down;
            }, null, level);
            return self;
        };

        return self;
    };
});