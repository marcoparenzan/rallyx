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
                    x0: 20 * 96 + 48,
                    y0: 54 * 96 + 48,
                    speed: 400
                });
                this.player.preload();

                this.enemies = {};
                this.foreachenemy = function (callback) {
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

                self.move_e = undefined;
                game.input.onUp.add(function (e) {
                    if (self.move_e == undefined) return;
                    self.move_e = undefined;
                });

                game.input.onHold.add(function (e) {
                    if (self.move_e != undefined) return;
                    self.move_e = e;
                });

                game.input.onDown.add(function (e) {
                    if (self.move_e != undefined) return;
                    self.move_e = e;
                }, self);

                game.input.keyboard.onDownCallback = function (ev) {
                    var tile = self.getPlayerTile();
                    switch (ev.keyCode) {
                        case 37:
                            if (self.playerCanTurnLeft(tile.x, tile.y)) self.player.left();
                            break;
                        case 38:
                            if (self.playerCanTurnUp(tile.x, tile.y)) self.player.up();
                            break;
                        case 39:
                            if (self.playerCanTurnRight(tile.x, tile.y)) self.player.right();
                            break;
                        case 40:
                            if (self.playerCanTurnDown(tile.x, tile.y)) self.player.down();
                            break;
                    }
                };

                this.foreachenemy(function (enemy) {
                    enemy.create().restart();
                });

                // set workd bounds to allow camera to follow the player
                game.world.setBounds(0, 0, 1008 * 4, 1536 * 4);

                // making the camera follow the player
                game.camera.follow(self.player.sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
            };

            this.getPlayerTile = function() {
                var self = this;
                return self.map.getTileWorldXY(self.player.sprite.x, self.player.sprite.y, self.map.tileWidth, self.map.tileHeight, self.layer);
            };

            this.playerCanTurnRight = function (x, y) {
                var self = this;
                var tile = this.map.getTileRight(self.map.currentLayer, x, y);
                if (tile == undefined) return false;
                if (tile.index > 1) return false;
                return true;                
            };

            this.playerCanTurnDown = function (x, y) {
                var self = this;
                var tile = this.map.getTileBelow(self.map.currentLayer, x, y);
                if (tile == undefined) return false;
                if (tile.index > 1) return false;
                return true;                
            };

            this.playerCanTurnLeft = function (x, y) {
                var self = this;
                var tile = this.map.getTileLeft(self.map.currentLayer, x, y);
                if (tile == undefined) return false;
                if (tile.index > 1) return false;
                return true;                
            };

            this.playerCanTurnUp = function (x, y) {
                var self = this;
                var tile = this.map.getTileAbove(self.map.currentLayer, x, y);
                if (tile == undefined) return false;
                if (tile.index > 1) return false;
                return true;                
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
                this.foreachenemy(function (enemy) {
                    enemy.suspend();
                });
            };

            this.restart = function () {
                var self = this;
                self.player.restart();
                this.foreachenemy(function (enemy) {
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

                if (self.move_e != undefined) {
                    self.player.moveTo(self.move_e.x, self.move_e.y);
                }

                self.player.updatelevel(self);
                this.foreachenemy(function (enemy) {
                    enemy.updatelevel(self);
                    self.player.updateenemy(enemy, function () {
                        self.playerOnEnemy();
                    });
                });
            };
        };
    });