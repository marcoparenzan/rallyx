define([], function () {
    return function (game, config) {
        var self = this;

        self.preload = function () {
            game.load.spritesheet("player", "assets/cars.png", 64, 64);
            return self;
        };

        self.create = function () {

            var typeIndex = (config.type || 0) * 12;

            // adding the hero sprite
            self.sprite = game.add.sprite(config.x0, config.y0, "player");
            self.sprite.animations.add('up', [typeIndex+0], 8, false);
            self.sprite.animations.add('upright', [typeIndex+0, typeIndex+1, typeIndex+2, typeIndex+3], 8, false);
            self.sprite.animations.add('right', [typeIndex+3], 8, false);
            self.sprite.animations.add('rightdown', [typeIndex+3, typeIndex+4, typeIndex+5, typeIndex+6], 8, false);
            self.sprite.animations.add('down', [typeIndex+6], 8, false);
            self.sprite.animations.add('downleft', [typeIndex+6, typeIndex+7, typeIndex+8, typeIndex+9], 8, false);
            self.sprite.animations.add('left', [typeIndex+9], 8, false);
            self.sprite.animations.add('leftup', [typeIndex+9, typeIndex+10, typeIndex+11, typeIndex+0], 8, false);

            // enabling ARCADE physics for the  hero
            game.physics.enable(self.sprite, Phaser.Physics.ARCADE);

            // setting hero anchor point
            self.sprite.anchor.x = 0.5;
            self.sprite.anchor.y = 0.5;

            return self;
        };

        self.startanimation = function () {
            var vx = self.sprite.body.velocity.x;
            var vy = self.sprite.body.velocity.y;
            if (vx > 0)
                self.sprite.animations.play("right");
            else if (vx < 0)
                self.sprite.animations.play("left");
            else if (vy > 0)
                self.sprite.animations.play("down");
            else if (vy < 0)
                self.sprite.animations.play("up");
            else
                self.sprite.animations.play("stop");
            return self;
        };

        self.stopanimation = function () {
            self.sprite.animations.stop(null, true);
            return self;
        };

        self.restart = function () {
            self.sprite.x = config.x0;
            self.sprite.y = config.y0;
            self.up();
            return self;
        }

        self.suspend = function () {
            self.sprite.body.velocity.x = 0;
            self.sprite.body.velocity.y = 0;
            self.sprite.animations.stop(null, true);
            return self;
        };

        self.left = function () {
            if (self.sprite.body.velocity.x<0) return;
            self.sprite.body.velocity.x = -config.speed;
            self.sprite.body.velocity.y = 0;
            self.startanimation();
            return self;
        };

        self.right = function () {
            if (self.sprite.body.velocity.x > 0) return;
            self.sprite.body.velocity.x = config.speed;
            self.sprite.body.velocity.y = 0;
            self.startanimation();
            return self;
        };

        self.up = function () {
            if (self.sprite.body.velocity.y < 0) return;
            self.sprite.body.velocity.x = 0;
            self.sprite.body.velocity.y = -config.speed;
            self.startanimation();
            return self;
        };

        self.down = function () {
            if (self.sprite.body.velocity.y > 0) return;
            self.sprite.body.velocity.x = 0;
            self.sprite.body.velocity.y = config.speed;
            self.startanimation();
            return self;
        };

        self.stop = function () {
            self.sprite.body.velocity.x = 0;
            self.sprite.body.velocity.y = 0;
            self.stopanimation();
            return self;
        };

        self.explode = function () {
            self.sprite.animations.play("explode");
            return self;
        };

        self.canTurnRight = function (map, layer) {
            var tile1 = self.getTile(map, layer);
            var tile = map.getTileRight(map.currentLayer, tile1.x, tile1.y);
            if (tile == undefined) return false;
            if (tile.index > 1) return false;
            if ((self.sprite.y - self.sprite.height / 2) < (tile.worldY)) return false;
            if ((self.sprite.y + self.sprite.height / 2) > (tile.worldY + tile.height)) return false;
            return true;
        };

        self.canTurnDown = function (map, layer) {
            var tile1 = self.getTile(map, layer);
            var tile = map.getTileBelow(map.currentLayer, tile1.x, tile1.y);
            if (tile == undefined) return false;
            if (tile.index > 1) return false;
            if ((self.sprite.x - self.sprite.width / 2) < (tile.worldX)) return false;
            if ((self.sprite.x + self.sprite.width / 2) > (tile.worldX + tile.width)) return false;
            return true;
        };

        self.canTurnLeft = function (map, layer) {
            var tile1 = self.getTile(map, layer);
            var tile = map.getTileLeft(map.currentLayer, tile1.x, tile1.y);
            if (tile == undefined) return false;
            if (tile.index > 1) return false;
            if ((self.sprite.y - self.sprite.height / 2) < (tile.worldY)) return false;
            if ((self.sprite.y + self.sprite.height / 2) > (tile.worldY + tile.height)) return false;
            return true;
        };

        self.canTurnUp = function (map, layer) {
            var tile1 = self.getTile(map, layer);
            var tile = map.getTileAbove(map.currentLayer, tile1.x, tile1.y);
            if (tile == undefined) return false;
            if (tile.index > 1) return false;
            if ((self.sprite.x - self.sprite.width / 2) < (tile.worldX)) return false;
            if ((self.sprite.x + self.sprite.width / 2) > (tile.worldX + tile.width)) return false;
            return true;
        };

        self.getTile = function (map, layer) {
            return map.getTileWorldXY(self.sprite.world.x, self.sprite.world.y, map.tileWidth, map.tileHeight, layer);
        };

        self.update = function(map, layer) {
            self.sprite.game.physics.arcade.collide(self.sprite, layer, function (sprite, tile) {
                if (sprite.body.blocked.up == true) {
                    if (self.canTurnRight(map, layer)) self.right();
                    else if (self.canTurnLeft(map, layer)) self.left();
                    else if (self.canTurnDown(map, layer)) self.down();
                }
                else if (sprite.body.blocked.left == true) {
                    if (self.canTurnUp(map, layer)) self.up();
                    else if (self.canTurnDown(map, layer)) self.down();
                    else if (thselfis.canTurnRight(map, layer)) self.right();
                }
                else if (sprite.body.blocked.down == true) {
                    if (self.canTurnLeft(map, layer)) self.left();
                    else if (self.canTurnRight(map, layer)) self.right();
                    else if (self.canTurnUp(map, layer)) self.up();
                }
                else if (sprite.body.blocked.right == true) {
                    if (self.canTurnDown(map, layer)) self.down();
                    else if (self.canTurnUp(map, layer)) self.up();
                    else if (self.canTurnLeft(map, layer)) self.left();
                }
                else {
                    self.stopanimation();
                }
            }, null, self);
        };

        self.follow = function(tile, map, layer) {

            var x = tile.worldX + tile.width / 2;
            var y = tile.worldY + tile.height / 2;

            var dx = tile.worldX + tile.width / 2 - self.sprite.world.x;
            var dy = tile.worldY + tile.height / 2 - self.sprite.world.y;
            var adx = Math.abs(dx);
            var ady = Math.abs(dy);
            if (adx > ady) {
                if (dx > 0) {
                    if (self.canTurnRight(map, layer)) self.right();
                }
                else {
                    if (self.canTurnLeft(map, layer)) self.left();
                }
            }
            else {
                if (dy > 0) {
                    if (self.canTurnDown(map, layer)) self.down();
                }
                else {
                    if (self.canTurnUp(map, layer)) self.up();
                }
            }
        };

        return this;
    };
});