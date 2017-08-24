define([], function () {
    return function (game, config) {
        var self = this;
        
        self.preload = function () {
            game.load.spritesheet("staticobject", "assets/staticobject-spritesheet.png", 64, 64);
            return self;
        };

        self.create = function () {
            return self.show(config.x0, config.y0, config.type);
        };

        self.show = function (x, y, type) {
            self.sprite = game.add.sprite(x, y, "staticobject");

            var frameRate = 20;
            
            self.sprite.animations.add('rocks', [0], frameRate, false);
            self.sprite.animations.add('flag', [4], frameRate, false);
            self.sprite.animations.add('flagL', [5], frameRate, false);
            self.sprite.animations.add('flagS', [6], frameRate, false);
                                    
            // enabling ARCADE physics for the  hero
            game.physics.enable(self.sprite, Phaser.Physics.ARCADE);
            self.sprite.body.immovable = true;
                        
            self.sprite.anchor.x = 0.5;
            self.sprite.anchor.y = 0.5;

            self.sprite.animations.play(type);
            
            return self;
        };
        
        self.update = function(map, layer) {
            return self;
        };

        self.delete = function() {
            self.sprite.destroy();
        };

        return self;
    };
});