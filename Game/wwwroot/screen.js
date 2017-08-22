define(["gameOptions", "car"
], function (gameOptions, Car
) {
        return function (game) {
            this.preload = function () {
                game.load.tilemap("default", 'assets/rallyx-map.json', null, Phaser.Tilemap.TILED_JSON);
                game.load.image("default", "assets/rallyx-map-tileset.png");

                this.player = new Car(game, {
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

                this.enemies["1"] = new Car(game, {
                    x0: 18 * 96 + 48,
                    y0: 57 * 96 + 48,
                    speed: 400,
                    type: 1
                }).preload();

                this.enemies["2"] = new Car(game, {
                    x0: 20 * 96 + 48,
                    y0: 57 * 96 + 48,
                    speed: 400,
                    type: 1
                }).preload();

                this.enemies["3"] = new Car(game, {
                    x0: 22 * 96 + 48,
                    y0: 57 * 96 + 48,
                    speed: 400,
                    type: 1
                }).preload();
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

                self.targetPlayerTile = undefined;
                game.input.onUp.add(function (e) {
                    if (self.targetPlayerTile == undefined) return;
                    self.targetPlayerTile = undefined;
                });

                var getTile = function (x, y) {
                    return self.map.getTileWorldXY(x, y, self.map.tileWidth, self.map.tileHeight, self.layer);
                };

                game.input.onHold.add(function (e) {
                    self.targetPlayerTile = getTile(game.input.worldX, game.input.worldY);
                });

                game.input.onDown.add(function (e) {
                    self.targetPlayerTile = getTile(game.input.worldX, game.input.worldY);
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

                if (self.targetPlayerTile != undefined) {
                    self.player.follow(self.targetPlayerTile, self.map, self.layer);
                }
                else {
                    if (self.playerToLeft == true) {
                        if (self.player.canTurnLeft(self.map, self.layer)) self.player.left();
                    }
                    if (self.playerToUp == true) {
                        if (self.player.canTurnUp(self.map, self.layer)) self.player.up();
                    }
                    if (self.playerToRight == true) {
                        if (self.player.canTurnRight(self.map, self.layer)) self.player.right();
                    }
                    if (self.playerToDown == true) {
                        if (self.player.canTurnDown(self.map, self.layer)) self.player.down();
                    }
                }
                var playerTile = self.player.getTile(self.map, self.layer);
                this.foreachenemy(function (enemy) {
                    enemy.follow(playerTile, self.map, self.layer);
                });


                self.player.update(self.map, self.layer);

                this.foreachenemy(function (enemy) {
                    enemy.update(self.map, self.layer);
                });
            };
        };
    });