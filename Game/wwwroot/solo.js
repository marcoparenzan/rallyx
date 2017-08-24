define(["gameOptions", "car", "gameover", "flag", "rock"], function (gameOptions, Car, GameOver, Flag, Rock) {

    var forall = function (self, callback) {
        var keys = Object.keys(self);
        var i = 0;
        while (true) {
            if (i === keys.length) break;
            callback(self[keys[i]]);
            i++;
        }
        return self;
    };

    var collisionAmong = function (self, set, callback) {
        var keys = Object.keys(set);
        var i = 0;
        var exit = false;
        while (true) {
            if (exit) break;
            if (i === keys.length) break;
            var item = set[keys[i]];
            game.physics.arcade.collide(self.sprite, item.sprite, function (selfsprite, itemsprite) {
                callback(self, this); // this === item
                exit = true;
            }, null, item);
            i++;
        }
        return self;
    };

    return function (game) {

        this.preload = function () {
            game.load.tilemap("default", 'assets/rallyx-map.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image("default", "assets/rallyx-map-tileset.png");

            this.player = new Car(game, {
                id: "player1",
                x0: 20 * 96 + 48,
                y0: 54 * 96 + 48,
                speed: 400,
                initialScore: 0,
                initialLives: 3,
                initialFuel: 100
            }).preload();

            this.enemies = {};
            this.enemies.enemy1 = new Car(game, {
                id: "enemy1",
                x0: 18 * 96 + 48,
                y0: 57 * 96 + 48,
                speed: 400,
                type: 1
            }).preload();

            this.enemies.enemy2 = new Car(game, {
                id: "enemy2",
                x0: 20 * 96 + 48,
                y0: 57 * 96 + 48,
                speed: 400,
                type: 1
            }).preload();

            this.enemies.enemy3 = new Car(game, {
                id: "enemy3",
                x0: 22 * 96 + 48,
                y0: 57 * 96 + 48,
                speed: 400,
                type: 1
            }).preload();

            this.flags = {};
            this.flags.flags1 = new Flag(game, {
                id: "flags1",
                x0: 8 * 96 + 48,
                y0: 9 * 96 + 48
            }).preload();
            this.flags.flags2 = new Flag(game, {
                id: "flags2",
                x0: 30 * 96 + 48,
                y0: 14 * 96 + 48
            }).preload();
            this.flags.flags3 = new Flag(game, {
                id: "flags3",
                x0: 36 * 96 + 48,
                y0: 49 * 96 + 48
            }).preload();
            this.flags.flags4 = new Flag(game, {
                id: "flags4",
                x0: 10 * 96 + 48,
                y0: 46 * 96 + 48
            }).preload();
            this.flags.flags5 = new Flag(game, {
                id: "flags5",
                x0: 13 * 96 + 48,
                y0: 26 * 96 + 48
            }).preload();
            this.flags.flags6 = new Flag(game, {
                id: "flags6",
                x0: 27 * 96 + 48,
                y0: 28 * 96 + 48
            }).preload();
            this.flags.flags7 = new Flag(game, {
                id: "flags7",
                x0: 17 * 96 + 48,
                y0: 42 * 96 + 48
            }).preload();
            this.flags.flags8 = new Flag(game, {
                id: "flags8",
                x0: 35 * 96 + 48,
                y0: 18 * 96 + 48
            }).preload();
            this.flags.flags9 = new Flag(game, {
                id: "flags9",
                x0: 5 * 96 + 48,
                y0: 23 * 96 + 48
            }).preload();
            this.flags.flags10 = new Flag(game, {
                id: "flags10",
                x0: 30 * 96 + 48,
                y0: 33 * 96 + 48,
                doubleValue: true
            }).preload();

            this.smokes = {};

            this.rocks = {};
            this.rocks.rock1 = new Rock(game, {
                id: "rock1",
                x0: 12 * 96 + 48,
                y0: 4 * 96 + 48
            }).preload();
            this.rocks.rock2 = new Rock(game, {
                id: "rock2",
                x0: 27 * 96 + 48,
                y0: 31 * 96 + 48
            }).preload();
            this.rocks.rock3 = new Rock(game, {
                id: "rock3",
                x0: 36 * 96 + 48,
                y0: 43 * 96 + 48
            }).preload();
            this.rocks.rock4 = new Rock(game, {
                id: "rock4",
                x0: 15 * 96 + 48,
                y0: 22 * 96 + 48
            }).preload();
            this.rocks.rock5 = new Rock(game, {
                id: "rock5",
                x0: 26 * 96 + 48,
                y0: 47 * 96 + 48
            }).preload();

            this.gameOver = new GameOver(game).preload();
        };

        this.create = function () {
            var self = this;

            game.stage.backgroundColor = gameOptions.bgColor;

            // creatin of "level" tilemap
            self.map = game.add.tilemap("default");
            // which layer should we render? That's right, "layer01"
            self.layer = this.map.createLayer("default");
            // adding tiles (actuallyone tile) to tilemap
            self.map.addTilesetImage("default", "default");
            // tile 1 (the black tile) has the collision enabled
            self.map.setCollisionBetween(2, 40, true);

            var getTile = function (x, y) {
                return self.map.getTileWorldXY(x, y, self.map.tileWidth, self.map.tileHeight, self.layer);
            };

            self.targetPlayerTile = undefined;

            game.input.onUp.add(function (e) {
                if (self.targetPlayerTile == undefined) return;
                self.targetPlayerTile = undefined;
            });

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

            this.player.create();
            forall(this.enemies, function (car) {
                car.create();
            });
            forall(this.flags, function (flag) {
                flag.create();
            });
            forall(this.rocks, function (rock) {
                rock.create();
            });

            // set workd bounds to allow camera to follow the player
            game.world.setBounds(0, 0, 1008 * 4, 1536 * 4);
            // making the camera follow the player
            game.camera.follow(self.player.sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

            this.restart();
        };

        this.catchTheFlag = function (flag) {
            var self = this;
            self.suspend();
            if (flag.doubleValue()) {
                self.multiplyFlagScore = 2;
            }
            self.player.addScore(self.nextFlagScore * self.multiplyFlagScore);
            flag.catch(self.nextFlagScore, self.multiplyFlagScore === 2);
            self.nextFlagScore += 100;
            delete self.flags[flag.id];
            self.continue();
        };

        this.explodes = function () {
            var self = this;
            self.suspend();
            self.player.explode();
            if (self.player.lives === 0) {
                setTimeout(function () {
                    // game over
                    self.gameOver.show(self.player.sprite.x, self.player.sprite.y);
                    setTimeout(function () {
                        game.state.start("title");
                    }, 3000);
                }, 1000);
            } else {
                // crash
                setTimeout(function () {
                    self.restart();
                }, 1000);
            }
        };

        this.suspend = function () {
            var self = this;
            self.player.suspend();
            forall(this.enemies, function (car) {
                car.suspend();
            });
            self.suspended = true;
        };

        this.continue = function (enemiesDelayed) {
            var self = this;
            self.suspended = false;
            self.player.continue();
            if (enemiesDelayed == true) {
                setTimeout(function () {
                    forall(self.enemies, function (car) {
                        car.continue();
                    });
                }, 2000);
            } else {
                forall(self.enemies, function (car) {
                    car.continue();
                });
            }
        };

        this.restart = function () {
            var self = this;

            self.nextFlagScore = 100;
            self.multiplyFlagScore = 1;

            self.player.reset();
            forall(self.enemies, function (car) {
                car.reset();
            });

            setTimeout(function () {
                self.continue(true);
                self.player.up();
            }, 2000);

            self.suspended = false;
        };

        this.update = function () {
            var self = this;

            game.debug.text("Player 1 | Score " + self.player.score + " | Lives " + self.player.lives + " | Fuel " + parseInt(self.player.fuel), 10, 10);

            if (self.suspended == true) return;

            self.player.update(self.map, self.layer);
            if (self.player.fuel <= 0) {
                // if player runs out of fuel, just explode (not checked the real game)
                self.explodes();
            }

            forall(self.enemies, function (enemy) {
                enemy.update(self.map, self.layer);
            });
            forall(self.flags, function (flag) {
                flag.update(self.map, self.layer);
            });
            forall(self.rocks, function (rock) {
                rock.update(self.map, self.layer);
            });

            // driving
            if (self.targetPlayerTile != undefined) {
                self.player.follow(self.targetPlayerTile, self.map, self.layer);
            } else {
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
            forall(this.enemies, function (car) {
                car.follow(playerTile, self.map, self.layer);
            });

            // player to enemy collision
            collisionAmong(self.player, self.enemies, function (player, enemy) {
                self.explodes();
            });

            collisionAmong(self.player, self.flags, function (player, flag) {
                self.catchTheFlag(flag);
                // enemies pass over flag....
            });

            collisionAmong(self.player, self.rocks, function (player, rock) {
                self.explodes();
            });

            forall(self.enemies, function (enemy) {

                collisionAmong(enemy, self.enemies, function (enemy1, enemy2) {
                    if (enemy1.id === enemy2.id) return;
                    enemy1.reverse();
                    enemy2.reverse();
                });

                collisionAmong(enemy, self.rocks, function (enemy, rock) {
                    enemy.reverse(); // enemies does not explode over rocks, just reverse
                });

            });
        };
    };
});