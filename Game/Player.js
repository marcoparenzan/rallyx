define([], function () {
    return function (game, config) {
        var self = this;

        self.preload = function () {
            game.load.spritesheet("player", "assets/cars.png", 64, 64);
            return self;
        };

        self.create = function () {

            // adding the hero sprite
            self.sprite = game.add.sprite(config.x0, config.y0, "player");
            self.sprite.animations.add('up', [0], 8, false);
            self.sprite.animations.add('upright', [0, 1, 2, 3], 8, false);
            self.sprite.animations.add('right', [3], 8, false);
            self.sprite.animations.add('rightdown', [3, 4, 5, 6], 8, false);
            self.sprite.animations.add('down', [6], 8, false);
            self.sprite.animations.add('downleft', [6, 7, 8, 9], 8, false);
            self.sprite.animations.add('left', [9], 8, false);
            self.sprite.animations.add('leftup', [9, 10, 11, 0], 8, false);

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

        return this;
    };
});