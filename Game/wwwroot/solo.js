define(["gameOptions", "car", "gameover", "flag", "rock", "smoke", "pendings", "hud"], function (gameOptions, Car, GameOver, Flag, Rock, Smoke, Pendings, Hud) {

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
            if (item.sprite !== undefined) {
                game.physics.arcade.collide(self.sprite, item.sprite, function (selfsprite, itemsprite) {
                    callback(self, this); // this === item
                    exit = true;
                }, null, item);
            }
            i++;
        }
        return self;
    };

    return function (game) {

        this.preload = function () {
            game.load.tilemap("default", 'assets/rallyx-map.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image("default", "assets/rallyx-map-tileset.png");

            game.load.spritesheet("hud", "assets/hud.png", 192, 960);
            
            game.load.spritesheet("flag", "assets/flag-spritesheet.png", 64, 64);
            game.load.spritesheet("rock", "assets/rock-spritesheet.png", 64, 64);
            game.load.spritesheet("smoke", "assets/smoke-spritesheet.png", 64, 64);
            game.load.spritesheet("gameover", "assets/gameover-spritesheet.png", 64, 64);

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
            this.smokecounter = 2;

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

            this.hud = new Hud(game, {
                x0: 1088, 
                y0: 0
            }).preload();

            this.gameOver = new GameOver(game).preload();
        };

        this.getTile = function (x, y) {
            return this.map.getTileWorldXY(x, y, this.map.tileWidth, this.map.tileHeight, this.layer);
        };

        this.create = function () {
            var self = this;

            self.pendings = new Pendings(game);

            game.stage.backgroundColor = gameOptions.bgColor;

            // creatin of "level" tilemap
            self.map = game.add.tilemap("default");
            // which layer should we render? That's right, "layer01"
            self.layer = this.map.createLayer("default");
            // adding tiles (actuallyone tile) to tilemap
            self.map.addTilesetImage("default", "default");
            // tile 1 (the black tile) has the collision enabled
            self.map.setCollisionBetween(2, 40, true);

            self.targetPlayerTile = undefined;

            game.input.onUp.add(function (e) {
                if (self.targetPlayerTile == undefined) return;
                self.targetPlayerTile = undefined;
            });

            game.input.onHold.add(function (e) {
                self.targetPlayerTile = self.getTile(game.input.worldX, game.input.worldY);
            });

            game.input.onDown.add(function (e) {
                self.targetPlayerTile = self.getTile(game.input.worldX, game.input.worldY);
            }, self);

            self.playerToLeft = false;
            self.playerToUp = false;
            self.playerToRight = false;
            self.playerToDown = false;
            self.playerSmoking = false;

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
                    case 17:
                        self.playerSmoking = true;
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
                    case 17:
                        self.playerSmoking = false;
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

            self.hud.create();
            
            self.hudGraphics = game.add.graphics(1088, 0);
            self.hudGraphics.fixedToCamera = true;

            self.hudHighScoreText = game.add.text(1280, 22, (gameOptions.highScore || 0), { font: "28px Courier", fill: "#ffff00", align: "right"  });
            self.hudHighScoreText.fixedToCamera = true;
            self.hudHighScoreText.anchor.x = 1;

            self.hudScoreText = game.add.text(1280, 71, "SCORE", { font: "28px Courier", fill: "#ffff00", align: "right" });
            self.hudScoreText.fixedToCamera = true;
            self.hudScoreText.anchor.x = 1;
            
            self.restart();
        };

        this.hudSprite = function (obj, color, startx, starty) {
            var self = this;
            var tile = self.getTile(obj.sprite.x, obj.sprite.y);
            self.hudGraphics.beginFill(color, 1);
            self.hudGraphics.drawRect(tile.x * 5 + 0 + (startx || 0), tile.y * 5 + 0 + (starty || 0), 5, 5);
            self.hudGraphics.endFill();
        };

        this.catchTheFlag = function (flag) {
            var self = this;
            self.suspend();
            if (flag.doubleValue()) {
                self.multiplyFlagScore = 2;
            }
            self.player.addScore(self.nextFlagScore * self.multiplyFlagScore);
            flag.catch(self.nextFlagScore, self.multiplyFlagScore === 2);
            delete self.flags[flag.id]; // flag already removed because no other collision!
            if (self.flags.length === 0) {
                self.gameover();
            } else {

                self.pendings.schedule(function (args) {
                    args.flag.delete();
                }, 3000, {
                    flag: flag
                });

                self.nextFlagScore += 100;
                self.continue();
            }
        };

        this.gameover = function () {
            var self = this;

            self.pendings.schedule(function () {

                self.gameOver.show(self.player.sprite.x, self.player.sprite.y);
                self.pendings.complete();
                var timer = setInterval(function () {
                    if (self.player.fuel > 0) {
                        self.player.addScore(10);
                        self.player.fuel--;
                    } else {
                        clearInterval(timer);

                        self.pendings.schedule(function () {
                            game.state.start("title");
                        }, 1000);
                    }
                }, 25);

            }, 500);

        };

        this.explodes = function () {
            var self = this;
            self.pendings.complete();
            self.suspend();
            self.player.explode();
            if (self.player.lives === 0) {
                self.gameover();
            } else {
                // crash
                self.pendings.schedule(function () {
                    forall(self.enemies, function (car) {
                        self.restart();
                    });
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
                self.pendings.schedule(function () {
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

            self.playerSmokingCount = undefined;
            forall(self.smokes, function (smoke) {
                smoke.delete();
            });

            self.player.reset();
            forall(self.enemies, function (car) {
                car.reset();
            });

            self.pendings.schedule(function () {
                self.continue(true);
                self.player.up();
            }, 2000);

            self.suspended = false;
        };

        this.render = function () {
            var self = this;

            self.hudGraphics.clear();

            var fuelx = self.player.fuel * 192 / 100;
            self.hudGraphics.beginFill(0xffff00, 1);
            self.hudGraphics.drawRect(192-fuelx, 194, fuelx, 20);
            self.hudGraphics.endFill();

            var livesx = self.player.lives * 48;
            self.hudGraphics.beginFill(0x000000, 1);
            self.hudGraphics.drawRect(livesx, 575, 192-livesx, 36);
            self.hudGraphics.endFill();

            self.hudSprite(self.player, 0xffffff, 0, 240);
            forall(self.enemies, function (enemy) {
                self.hudSprite(enemy, 0xff0000, 0, 240);
            });
            forall(self.flags, function (flag) {
                self.hudSprite(flag, 0xffff00, 0, 240);
            });

            // hude 2UP
            self.hudGraphics.beginFill(0x000000, 1);
            self.hudGraphics.drawRect(0, 94, 192, 36);
            self.hudGraphics.endFill();

        };

        this.update = function () {
            var self = this;

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

            if (self.playerSmoking === true && self.playerSmokingCount === undefined) {
                self.playerSmokingCount = 3;
                // so if not yet started smoking...start counter
            }

            var playerTile = self.player.getTile(self.map, self.layer);
            // track when player changes tile
            var newPlayerTile = false;
            if (self.lastPlayerTile === undefined) newPlayerTile = true;
            else if (self.lastPlayerTile.x !== playerTile.x || self.lastPlayerTile.y !== playerTile.y) newPlayerTile = true;

            forall(this.enemies, function (car) {
                car.follow(playerTile, self.map, self.layer);
            });

            if (newPlayerTile === true) {
                // on the last, add the smoke if
                if (self.playerSmokingCount > 0) { // else is undefined so nothing to do
                    self.smokecounter++;
                    var id = "smoke" + self.smokecounter;
                    var smoke = new Smoke(game, {
                        id: id,
                        x0: self.lastPlayerTile.x * 96 + 48,
                        y0: self.lastPlayerTile.y * 96 + 48
                    }).preload().create();
                    self.smokes[smoke.id] = smoke;

                    self.pendings.schedule(function (args) {
                        args.smoke.delete();
                        delete self.smokes[args.smokeId];
                    }, 3000, {
                        smoke: smoke,
                        smokeId: smoke.id
                    });

                    // add smoke to the last player position
                    self.player.fuel--;
                    self.playerSmokingCount--;
                    if (self.playerSmokingCount === 0) self.playerSmokingCount = undefined; // disable smoking
                }

                // save the changed tile
                self.lastPlayerTile = playerTile;
            }

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

                collisionAmong(enemy, self.smokes, function (enemy, smoke) {
                    enemy.reverse(); // enemies does not explode over smoke, just reverse
                });


            });


            // update hud

            self.hudScoreText.text = self.player.score;
        };
    };
});