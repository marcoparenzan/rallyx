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
                    speed: 600
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

                self.player.create().restart().up();

                self.targetTile = undefined;
                game.input.onUp.add(function (e) {
                    if (self.targetTile == undefined) return;
                    self.targetTile = undefined;
                });

                game.input.onHold.add(function (e) {
                    self.targetTile = self.getTile(game.input.worldX, game.input.worldY);
                });

                game.input.onDown.add(function (e) {
                    self.targetTile = self.getTile(game.input.worldX, game.input.worldY);
                }, self);

                self.playerToLeft = false;
                self.playerToUp = false;
                self.playerToRight = false;
                self.playerToDown = false;

                game.input.keyboard.onDownCallback = function (ev) {
                    switch (ev.keyCode) {
                        case 37:
                            self.playerToLeft = true;
                            break;
                        case 38:
                            self.playerToUp = true;
                            break;
                        case 39:
                            self.playerToRight = true;
                            break;
                        case 40:
                            self.playerToDown = true;
                            break;
                    }
                };

                game.input.keyboard.onUpCallback = function (ev) {
                    switch (ev.keyCode) {
                        case 37:
                            self.playerToLeft = false;
                            break;
                        case 38:
                            self.playerToUp = false;
                            break;
                        case 39:
                            self.playerToRight = false;
                            break;
                        case 40:
                            self.playerToDown = false;
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

            this.getPlayerTile = function () {
                var self = this;
                return self.getTile(self.player.sprite.world.x, self.player.sprite.world.y);
            };

            this.getTile = function (x, y) {
                var self = this;
                return self.map.getTileWorldXY(x, y, self.map.tileWidth, self.map.tileHeight, self.layer);
            };

            this.playerCanTurnRight = function () {
                var self = this;
                var tile1 = self.getPlayerTile();
                var tile = self.map.getTileRight(self.map.currentLayer, tile1.x, tile1.y);
                if (tile == undefined) return false;
                if (tile.index > 1) return false;
                if ((self.player.sprite.y - self.player.sprite.height / 2) < (tile.worldY)) return false;
                if ((self.player.sprite.y + self.player.sprite.height / 2) > (tile.worldY + tile.height)) return false;
                return true;
            };

            this.playerCanTurnDown = function () {
                var self = this;
                var tile1 = self.getPlayerTile();
                var tile = self.map.getTileBelow(self.map.currentLayer, tile1.x, tile1.y);
                if (tile == undefined) return false;
                if (tile.index > 1) return false;
                if ((self.player.sprite.x - self.player.sprite.width / 2) < (tile.worldX)) return false;
                if ((self.player.sprite.x + self.player.sprite.width / 2) > (tile.worldX + tile.width)) return false;
                return true;
            };

            this.playerCanTurnLeft = function () {
                var self = this;
                var tile1 = self.getPlayerTile();
                var tile = self.map.getTileLeft(self.map.currentLayer, tile1.x, tile1.y);
                if (tile == undefined) return false;
                if (tile.index > 1) return false;
                if ((self.player.sprite.y - self.player.sprite.height / 2) < (tile.worldY)) return false;
                if ((self.player.sprite.y + self.player.sprite.height / 2) > (tile.worldY + tile.height)) return false;
                return true;
            };

            this.playerCanTurnUp = function () {
                var self = this;
                var tile1 = self.getPlayerTile();
                var tile = self.map.getTileAbove(self.map.currentLayer, tile1.x, tile1.y);
                if (tile == undefined) return false;
                if (tile.index > 1) return false;
                if ((self.player.sprite.x - self.player.sprite.width / 2) < (tile.worldX)) return false;
                if ((self.player.sprite.x + self.player.sprite.width / 2) > (tile.worldX + tile.width)) return false;
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

                if (self.targetTile != undefined) {
                    var tile = self.targetTile;
                    var x = tile.worldX + tile.width / 2;
                    var y = tile.worldY + tile.height / 2;

                    var dx = tile.worldX + tile.width / 2 - self.player.sprite.world.x;
                    var dy = tile.worldY + tile.height / 2 - self.player.sprite.world.y;
                    var adx = Math.abs(dx);
                    var ady = Math.abs(dy);
                    if (adx > ady) {
                        if (dx > 0) {
                            if (self.playerCanTurnRight()) self.player.right();
                        }
                        else {
                            if (self.playerCanTurnLeft()) self.player.left();
                        }
                    }
                    else {
                        if (dy > 0) {
                            if (self.playerCanTurnDown()) self.player.down();
                        }
                        else {
                            if (self.playerCanTurnUp()) self.player.up();
                        }
                    }
                }
                else {
                    if (self.playerToLeft == true) {
                        if (self.playerCanTurnLeft()) self.player.left();
                    }
                    if (self.playerToUp == true) {
                        if (self.playerCanTurnUp()) self.player.up();
                    }
                    if (self.playerToRight == true) {
                        if (self.playerCanTurnRight()) self.player.right();
                    }
                    if (self.playerToDown == true) {
                        if (self.playerCanTurnDown()) self.player.down();
                    }
                }

                game.physics.arcade.collide(self.player.sprite, self.layer, function (hero, tile) {
                    if (hero.body.blocked.up == true) {
                        if (self.playerCanTurnRight()) self.player.right();
                        else if (self.playerCanTurnLeft()) self.player.left();
                        else if (self.playerCanTurnDown()) self.player.down();
                    }
                    else if (hero.body.blocked.left == true) {
                        if (self.playerCanTurnUp()) self.player.up();
                        else if (self.playerCanTurnDown()) self.player.down();
                        else if (thselfis.playerCanTurnRight()) self.player.right();
                    }
                    else if (hero.body.blocked.down == true) {
                        if (self.playerCanTurnLeft()) self.player.left();
                        else if (self.playerCanTurnRight()) self.player.right();
                        else if (self.playerCanTurnUp()) self.player.up();
                    }
                    else if (hero.body.blocked.right == true) {
                        if (self.playerCanTurnDown()) self.player.down();
                        else if (self.playerCanTurnUp()) self.player.up();
                        else if (self.playerCanTurnLeft()) self.player.left();
                    }
                    else {
                        self.player.stopanimation();
                    }
                }, null, self);

                // this.foreachenemy(function (enemy) {
                //     enemy.updatelevel(self);
                //     self.player.updateenemy(enemy, function () {
                //         self.playerOnEnemy();
                //     });
                // });
            };
        };
    });