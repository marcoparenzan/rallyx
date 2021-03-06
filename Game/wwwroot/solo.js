define(["car", "gameover", "flag", "rock", "smoke", "hud"], function (Car, GameOver, Flag, Rock, Smoke, Hud) {

    var forall = function (self, callback) {
        if (self === undefined) return self;
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
        if (self === undefined) return self;
        if (self.dontCollide === true) return self;
        var keys = Object.keys(set);
        var i = 0;
        var exit = false;
        while (true) {
            if (exit) break;
            if (i === keys.length) break;
            var item = set[keys[i]];
            i++; // advance immediatly as I don't need to reference it again
            if (item.dontCollide === true) continue; // check if no collision is requested
            if (item.sprite !== undefined) {
                game.physics.arcade.collide(self.sprite, item.sprite, function (selfsprite, itemsprite) {
                    callback(self, this); // this === item
                    exit = true;
                }, null, item);
            }
        }
        return self;
    };

    return function (game) {

        this.init = function (args) {
            var self = this;
            if (args !== undefined) {
                self.highScore = args.highScore || 0;
            }
        };

        this.preload = function () {
            game.load.tilemap("default", 'assets/rallyx-map.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image("default", "assets/rallyx-map-tileset.png");

            game.load.spritesheet("hud", "assets/hud.png", 192, 960);

            game.load.spritesheet("car", "assets/car-spritesheet.png", 64, 64);

            game.load.spritesheet("flag", "assets/flag-spritesheet.png", 64, 64);
            game.load.spritesheet("rock", "assets/rock-spritesheet.png", 64, 64);
            game.load.spritesheet("smoke", "assets/smoke-spritesheet.png", 64, 64);
            game.load.spritesheet("gameover", "assets/gameover-spritesheet.png", 64, 64);
        };

        this.create = function () {
            var self = this;

            // creatin of "level" tilemap
            self.map = game.add.tilemap("default");
            // which layer should we render? That's right, "layer01"
            self.layer = this.map.createLayer("default");
            // adding tiles (actuallyone tile) to tilemap
            self.map.addTilesetImage("default", "default");
            // tile 1 (the black tile) has the collision enabled
            self.map.setCollisionBetween(2, 40, true);

            // set workd bounds to allow camera to follow the player
            game.world.setBounds(0, 0, 1008 * 4, 1536 * 4);

            this.hud = new Hud(game, {
                x0: 1088,
                y0: 0
            }).create();
            self.hud.create();

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

            self.startRound({
                round: 1,
                score: 0
            });
        };

        this.getTile = function (x, y) {
            return this.map.getTileWorldXY(x, y, this.map.tileWidth, this.map.tileHeight, this.layer);
        };

        this.startRound = function (args) {
            var self = this;
            self.round = args.round;
            self.hud.round(self.round);

            self.closingy = 960;
            self.openingy = 0;

            self.delete(); // if anything is already present. No recover, no spritepool

            self.player = new Car(game, {
                id: "player1",
                x0: 20 * 96 + 48,
                y0: 54 * 96 + 48,
                speed: 400,
                initialScore: args.score,
                initialLives: 3,
                initialFuel: 100,
                type: 2
            }).create();

            // making the camera follow the player
            game.camera.follow(self.player.sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

            self.enemiesX = [20, 18, 22, 16, 24, 14, 26];
            self.enemies = {};
            for (var i = 0; i <= this.round; i++) {
                var id = "enemy" + (i + 1);
                this.enemies[id] = new Car(game, {
                    id: id,
                    x0: this.enemiesX[i] * 96 + 48,
                    y0: 57 * 96 + 48,
                    speed: 400,
                    type: 3
                }).create();
            }

            var randomXY = function () {
                var x0;
                var y0;

                // calculate random xy until correct
                while (true) {
                    x0 = parseInt(Math.random() * 42 - 10);
                    y0 = parseInt(Math.random() * 64 - 10);
                    // exclusion condition outside 5,4 - 36-59
                    if (x0 < 5) continue;
                    if (x0 > 36) continue;
                    if (y0 < 4) continue;
                    if (y0 > 59) continue;
                    // exclusion condition in the starting rectangle 13,49 28,59
                    if (x0 >= 13 && x0 <= 28 && y0 >= 49 && y0 <= 59) continue;
                    // exclusion if tile not empty
                    var tile = self.map.getTile(x0, y0);
                    if (tile.index > 1) continue;
                    // and if not already something else...
                    // to do
                    break;
                }
                return {
                    x0: x0,
                    y0: y0
                };
            };

            self.flags = {};
            for (var i = 1; i <= 10; i++) {
                var xy = randomXY();
                var id = "flag" + i;
                var doubleValue = i === 10 ? true : false;
                self.flags[id] = new Flag(game, {
                    id: id,
                    x0: xy.x0 * 96 + 48,
                    y0: xy.y0 * 96 + 48,
                    doubleValue: doubleValue
                }).create();
            }

            self.smokes = {};

            this.rocks = {};
            for (var i = 1; i <= 5; i++) {
                var xy = randomXY();
                var id = "rock" + i;
                self.rocks[id] = new Rock(game, {
                    id: id,
                    x0: xy.x0 * 96 + 48,
                    y0: xy.y0 * 96 + 48
                }).create();
            }

            game.world.sort();

            this.restart();
        };

        this.restart = function () {
            var self = this;

            self.targetPlayerTile = undefined;

            self.playerToLeft = false;
            self.playerToUp = false;
            self.playerToRight = false;
            self.playerToDown = false;
            self.playerSmoking = false;

            self.nextFlagScore = 100;
            self.multiplyFlagScore = 1;
            self.completegameover = undefined;
            self.scheduleGoToTitle = undefined;
            self.scheduleStartRound = undefined;
            self.completenextlevel = undefined;
            self.completeexplosion = undefined;
            
            self.smokecounter = 2;
            self.playerSmokingCount = undefined;
            forall(self.smokes, function (smoke) {
                smoke.delete();
            });

            self.player.reset();
            forall(self.enemies, function (car) {
                car.reset();
            });

            self.scheduleTask(function () {
                var self = this;
                self.continue(2000);
                self.player.up();
            }, 2000);
        };

        this.catchTheFlag = function (flag) {
            var self = this;
            self.suspend();
            if (flag.doubleValue()) {
                self.multiplyFlagScore = 2;
            }
            self.player.addScore(self.nextFlagScore * self.multiplyFlagScore);
            if (Object.keys(self.flags).length === 1) {
                // because the delay due to the scheduled remove of the sprite, I check for 1, not 0.
                self.nextRound();
            } else {
                // so here I remove the sprite. If done before, I should support 1 or 0 (not reliable)
                flag.catch(self.nextFlagScore, self.multiplyFlagScore === 2);

                self.scheduleTask(function (args) {
                    delete self.flags[flag.id];
                    args.flag.delete();
                }, 3000, {
                    flag: flag
                });

                self.nextFlagScore += 100;
                self.continue();
            }
        };

        this.explosion = function () {
            var self = this;
            self.completeTasks();
            self.suspend();
            self.player.explode(); // because of animation
            if (self.player.lives === 0) {
                self.gameover();
            } else {
                // crash
                self.completeexplosion = true;
                self.scheduleTask("restart", 3000);
            }
        };

        this.gameover = function () {
            var self = this;
            self.suspend();
            self.gameOver = new GameOver(game).create(self.player.sprite.x, self.player.sprite.y);
            self.completeTasks();
            //self.delete();
            self.completegameover = true;
        };

        this.gameover2 = function () {
            var self = this;
            if (self.player.fuel > 0) {
                self.player.addScore(10);
                self.player.fuel--;
            } else if (self.closingy >= 0) {
                if (self.closingGraphics === undefined) {
                    self.closingGraphics = game.add.graphics(0, 0);
                    self.closingGraphics.fixedToCamera = true;
                    self.closingGraphics.z = 200;
                }
                self.closingGraphics.beginFill(0x000000, 1);
                self.closingGraphics.drawRect(0, self.closingy, 1280, 960 - self.closingy);
                self.closingGraphics.endFill();
                self.closingy -= 20;
            } else if (self.scheduleGoToTitle === undefined) {
                self.closingGraphics.destroy();
                self.closingGraphics = undefined;
                self.closingy = 960;
                self.scheduleTask("goToTitle", 2000, {
                    round: self.round,
                    score: self.player.score
                });
                self.scheduleGoToTitle = true; // so it always falls out after that
            }
        };

        this.nextRound = function () {
            var self = this;
            self.suspend();
            self.completeTasks();
            self.completenextlevel = true;
            //self.delete();
        };

        this.nextRound2 = function () {
            var self = this;
            if (self.player.fuel > 0) {
                self.player.addScore(10);
                self.player.fuel--;
            } else if (self.closingy >= 0) {
                if (self.closingGraphics === undefined) {
                    self.closingGraphics = game.add.graphics(0, 0);
                    self.closingGraphics.fixedToCamera = true;
                    self.closingGraphics.z = 200;
                }
                self.closingGraphics.beginFill(0x000000, 1);
                self.closingGraphics.drawRect(0, self.closingy, 1280, 960 - self.closingy);
                self.closingGraphics.endFill();
                self.closingy -= 20;
            } else if (self.scheduleStartRound === undefined) {
                self.closingGraphics.destroy();
                self.closingGraphics = undefined;
                self.closingy = 960;
                self.scheduleTask("startRound", 2000, {
                    round: self.round + 1,
                    score: self.player.score
                });
                self.scheduleStartRound = true; // so it always falls out after that
            }
        };

        this.delete = function () {
            var self = this;
            forall(self.enemies, function (item) {
                item.delete();
            });
            self.enemies = {};
            forall(self.flags, function (item) {
                item.delete();
            });
            self.flags = {};
            forall(self.rocks, function (item) {
                item.delete();
            });
            self.rocks = {};
            forall(self.smokes, function (item) {
                item.delete();
            });
            self.smokes = {};

            if (self.player !== undefined) {
                self.player.delete();
                self.player = undefined;
            }
        };

        this.goToTitle = function (args) {
            if (self.gameOver !== undefined) {
                self.gameOver.delete();
                self.gameOver = undefined;
            }
            game.state.start("title", true, false, {
                endGame: true,
                score: args.score,
                round: args.round
            });
        };

        this.suspend = function () {
            var self = this;

            self.player.suspend();
            forall(this.enemies, function (car) {
                car.suspend();
            });
        };

        this.enemiesContinues = function () {
            var self = this;
            forall(self.enemies, function (car) {
                car.continue();
            });
        };

        this.continue = function (enemiesDelayedBy) {
            var self = this;
            self.player.continue();
            if (enemiesDelayedBy !== undefined) {
                self.scheduleTask("enemiesContinues", enemiesDelayedBy);
            } else {
                self.enemiesContinues();
            }
        };

        this.render = function () {
            var self = this;
            self.hud
                .render()
                .round(self.round)
                .highScore(self.highScore)
                .score(self.player.score)
                .fuel(self.player.fuel)
                .lives(self.player.lives)
                .location(self.getTile(self.player.sprite.x, self.player.sprite.y), 0xffffff, 0, 240);
            forall(self.enemies, function (enemy) {
                self.hud.location(self.getTile(enemy.sprite.x, enemy.sprite.y), 0xff0000, 0, 240);
            });
            forall(self.flags, function (flag) {
                self.hud.location(self.getTile(flag.sprite.x, flag.sprite.y), 0xff0000, 0, 240);
            });
            return self;
        };

        this.update = function () {
            var self = this;

            self.updateTasks();

            if (self.completeexplosion === true) {
                return;
            }

            if (self.completenextlevel === true) {
                self.nextRound2();
                return;
            }

            if (self.completegameover === true) {
                self.gameover2();
                return;
            }

            self.player.update(self.map, self.layer);
            if (self.player.fuel <= 0) {
                // if player runs out of fuel, just explode (not checked the real game)
                self.explosion();
            }

            forall(self.enemies, function (enemy) {
                enemy.update(self.map, self.layer);
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

            if (self.playerSmoking === true && self.playerSmokingCount === undefined) {
                self.playerSmokingCount = 3;
                // so if not yet started smoking...start counter
            }

            // track when player changes tile
            var newPlayerTile = false;
            if (self.lastPlayerTile === undefined) newPlayerTile = true;
            else if (self.playerTile === undefined) newPlayerTile = true;
            else if (self.lastPlayerTile.x !== playerTile.x || self.lastPlayerTile.y !== playerTile.y) newPlayerTile = true;

            if (newPlayerTile === true) {
                // on the last, add the smoke if
                if (self.playerSmokingCount > 0) { // else is undefined so nothing to do
                    self.smokecounter++;
                    var id = "smoke" + self.smokecounter;
                    var smoke = new Smoke(game, {
                        id: id,
                        x0: self.lastPlayerTile.x * 96 + 48,
                        y0: self.lastPlayerTile.y * 96 + 48
                    }).create();
                    self.smokes[smoke.id] = smoke;

                    self.scheduleTask(function (args) {
                        var self = this;
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
                self.explosion();
            });

            collisionAmong(self.player, self.flags, function (player, flag) {
                self.catchTheFlag(flag);
                // enemies pass over flag....
            });

            collisionAmong(self.player, self.rocks, function (player, rock) {
                self.explosion();
            });

            forall(self.enemies, function (enemy) {

                // 09.02 - enemies does not collide each other
                // collisionAmong(enemy, self.enemies, function (enemy1, enemy2) {
                //     if (enemy1.id === enemy2.id) return;
                //     enemy1.reverse();
                //     enemy2.reverse();
                // });

                collisionAmong(enemy, self.rocks, function (enemy, rock) {
                    enemy.reverse(); // enemies does not explode over rocks, just reverse
                });

                collisionAmong(enemy, self.smokes, function (enemy, smoke) {
                    var direction = enemy.direction();
                    enemy.smoked();
                    // crash
                    self.scheduleTask(function (args) {
                        args.enemy.continue(args.direction);
                    }, 2500, {
                        enemy: enemy,
                        direction: direction
                    });
                });
            });

            // update hud
            if (self.player !== undefined) {
                self.hud.score(self.player.score);
            }
        };

        this.scheduledTasks = [];
        this.scheduleTask = function (task, delay, taskArgs) {
            var self = this;
            self.scheduledTasks.push({
                runAfter: game.time.time + delay,
                task: task,
                args: taskArgs
            });
        };

        this.runTask = function (task) {
            var self = this;
            if (typeof task.task === "string") {
                self[task.task](task.args);
            } else {
                task.task.call(self, task.args);
            }
        };

        this.completeTasks = function () {
            var self = this;
            while (self.scheduledTasks.length > 0) {
                var task = self.scheduledTasks[0];
                self.scheduledTasks.splice(0, 1);
                self.runTask(task);
            }
        };

        this.updateTasks = function () {
            var self = this;
            if (self.scheduledTasks.length === 0) return;
            for (var i = self.scheduledTasks.length - 1; i >= 0; i--) {
                var task = self.scheduledTasks[i];
                if (game.time.time < task.runAfter) continue;
                self.scheduledTasks.splice(i, 1);
                self.runTask(task);
            }
        };
    };
});