define(["gameOptions", "car"], function (gameOptions, Car) {

    var every = function (self, callback) {
        var keys = Object.keys(self);
        var i = 0;
        while (true) {
            if (i === keys.length) break;
            callback(self[keys[i]]);
            i++;
        }
        return self;
    };
    
    var collidesWith = function (self, set, callback) {
        var keys = Object.keys(set);
        var i = 0;
        var collisionStack = [];
        while (true) {
            if (i === keys.length) break;
            var item = set[keys[i]];
            game.physics.arcade.collide(self.sprite, item.sprite, function (selfsprite, itemsprite) {
                callback(self, this, collisionStack); // this === item
                collisionStack.push(this);
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
                initialLives: 3
            }).preload();

            this.enemies = {};
            this.enemies.enemy1 = new Car(game, {
                id: "enemy1",
                x0: 18 * 96 + 48,
                y0: 57 * 96 + 48,
                speed: 400,
                type: 1
            }).preload();

            this.enemies.enemy2= new Car(game, {
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

            this.nextFlagScore = 100;
            this.flags = {
            };

            this.smokes = {};

            this.holes = {};
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
            every(this.enemies, function (car) {
                car.create();
            });

            // set workd bounds to allow camera to follow the player
            game.world.setBounds(0, 0, 1008 * 4, 1536 * 4);

            // making the camera follow the player
            game.camera.follow(self.player.sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

            this.restart();
        };

        this.suspend = function () {
            var self = this;
            self.player.suspend();
            every(this.enemies, function (car) {
                car.suspend();
            });
            self._suspended = true;
        };

        this.restart = function () {
            var self = this;

            self.player.reset();
            every(self.enemies, function (car) {
                car.reset();
            });

            setTimeout(function(){
                self.player.restart().up();
                setTimeout(function() {
                    every(self.enemies, function (car) {
                        car.restart();
                    });
                }, 2000);
            }, 1000);

            self._suspended = false;
        };

        this.update = function () {
            var self = this;

            game.debug.text("Player 1 | Score " + self.player.score + " | Lives " + self.player.lives, 10, 10);

            if (self._suspended == true) return;

            self.player.update(self.map, self.layer);
            every(self.enemies, function(enemy) { 
                enemy.update(self.map, self.layer); 
            });
            every(self.flags, function(flag) { flag.update(self.map, self.layer); });
            every(self.holes, function(hole) { hole.update(self.map, self.layer); });

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
            every(this.enemies, function (car) {
                car.follow(playerTile, self.map, self.layer);
            });

            // player to enemy collision
            collidesWith(self.player, self.enemies, function(player, enemy) {
                self.suspend();
                self.player.explode();
                // crash
                setTimeout(function() {
                    self.restart();
                }, 1000);
            });

            collidesWith(self.player, self.flags, function(player, flag) {
                self.player.addScore(self.nextFlagScore);
                self.nextFlagScore += 100;
                flag.delete();
                delete self.flags[flag.id];
            });

            collidesWith(self.player, self.holes, function(player, hole) {
                self.suspend();
                self.player.explode();
                // crash
                setTimeout(function() {
                    self.restart();
                }, 1000);
            });

            every(self.enemies, function(enemy){

                collidesWith(enemy, self.enemies, function(enemy1, enemy2) {
                    enemy1.reverse();
                    enemy2.reverse();
                });    

            });
     };
    };
});