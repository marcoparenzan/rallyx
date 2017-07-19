define(["gameOptions", "player"
    // , "enemy"
], function (gameOptions, Player
    // , Enemy
) {
        return function (game) {
            this.preload = function () {
                game.load.tilemap("default", 'assets/rallyx-map.json', null, Phaser.Tilemap.TILED_JSON);
                game.load.image("default", "assets/rallyx-map-tileset.png");

                this.player = new Player(game, {
                    x0: 15 * 96 + 48,
                    y0: 15 * 96 + 48,
                    speed: 400
                });
                this.player.preload();

                this.enemies = {};
                this.eachenemy = function (callback) {
                    var keys = Object.keys(this.enemies);
                    for (var i = 0; i < keys.length; i++) {
                        callback(this.enemies[keys[i]]);
                    }
                };

                // this.enemies["1"] = new Enemy(game, {
                //     name: "enemy1",
                //     spriteframesname: "06",
                //     x0: 13*8+12,
                //     y0: 7*8,
                //     y1: 7*8,
                //     y2: 22*8,
                //     speed: 95,
                //     mode: "ud"
                // }).preload();

                // this.enemies["2"] = new Enemy(game, {
                //     name: "enemy2",
                //     spriteframesname: "copterside",
                //     x0: 20*8+12,
                //     y0: 12*8,
                //     y1: 12*8,
                //     y2: 16*8,
                //     speed: 30,
                //     mode: "ud"
                // }).preload();

                // this.enemies["3"] = new Enemy(game, {
                //     name: "enemy3",
                //     spriteframesname: "05",
                //     x0: 23*8+12,
                //     y0: 20*8,
                //     x1: 23*8+12,
                //     x2: 40*8-12,
                //     speed: 68,
                //     mode: "lr"
                // }).preload();
            };

            this.create = function () {
                game.stage.backgroundColor = gameOptions.bgColor;

                var self = this;

                // creatin of "level" tilemap
                self.map = game.add.tilemap("default");
                // which layer should we render? That's right, "layer01"
                self.layer = this.map.createLayer("default");
                // adding tiles (actuallyone tile) to tilemap
                self.map.addTilesetImage("default", "default");
                // tile 1 (the black tile) has the collision enabled
                self.map.setCollisionBetween(2, 40, true);

                self.player.create().restart();

                game.input.onDown.add(function(e){
                    var self = this;
                    var dx = e.x - self.player.sprite.worldPosition.x;
                    var dy = e.y - self.player.sprite.worldPosition.y;
                    var adx = Math.abs(dx);
                    var ady = Math.abs(dy);
                    if (adx>ady) {
                        if (dx > 0) {
                            self.player.right();
                        }
                        else {
                            self.player.left();
                        }
                    }
                    else  {
                        if (dy > 0) {
                            self.player.down();
                        }
                        else {
                            self.player.up();
                        }
                    }
                }, this);

                // game.input.keyboard.onDownCallback = function (ev) {
                //     switch (ev.keyCode) {
                //         case 37:
                //             self.player.left();
                //             break;
                //         case 38:
                //             self.player.up();
                //             break;
                //         case 39:
                //             self.player.right();
                //             break;
                //         case 40:
                //             self.player.down();
                //             break;
                //     }
                // };
                // game.input.keyboard.onUpCallback = function (ev) {
                //     switch (ev.keyCode) {
                //         default:
                //         break;
                //     }
                // };

                this.eachenemy(function (enemy) {
                    enemy.create().restart();
                });

                // set workd bounds to allow camera to follow the player
                game.world.setBounds(0, 0, 1008*4, 1536*4);

                // making the camera follow the player
                game.camera.follow(self.player.sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
            };

            this.playerOnEnemy = function () {
                var self = this;
                self.suspend();
                var id = setTimeout(function () {
                    self.player.explode();
                    // self.decreaseLife();
                    var id1 = setTimeout(function () {
                        self.restart();
                        clearTimeout(id1);
                    }, 250);
                    clearTimeout(id);
                }, 1000);
            };

            this.suspend = function () {
                var self = this;
                self._suspended = true;
                self.player.suspend();
                this.eachenemy(function (enemy) {
                    enemy.suspend();
                });
            };

            this.restart = function () {
                var self = this;
                self.player.restart();
                this.eachenemy(function (enemy) {
                    enemy.restart();
                });
                self._suspended = false;
            };

            this.update = function () {
                var self = this;

                // game.debug.text("self.player.x=" + self.player.x, 10, 10);
                // game.debug.text("self.player.y=" + self.player.y, 10, 20);
                // game.debug.text("self.player.sprite.body.velocity.x=" + self.player.sprite.body.velocity.x, 10, 30);
                // game.debug.text("self.player.sprite.body.velocity.y=" + self.player.sprite.body.velocity.y, 10, 40);

                if (self._suspended == true) return;

                self.player.updatelevel(self);
                this.eachenemy(function (enemy) {
                    enemy.updatelevel(self);
                    self.player.updateenemy(enemy, function () {
                        self.playerOnEnemy();
                    });
                });
            };
        };
    });