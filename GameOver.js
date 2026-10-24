define([], function () {
    return function (game, config) {
        var self = this;

        self.create = function (x, y) {
            self.sprite = game.add.sprite(x, y, "gameover");
            
            self.sprite.animations.add('default', [0], config.frameRate, false);
                        
            self.sprite.anchor.x = 0.5;
            self.sprite.anchor.y = 0.5;

            self.sprite.animations.play("default");
            
            return self;
        };

        self.delete = function() {
            if (self.sprite === undefined) return;
            self.sprite.destroy();
            self.sprite = undefined;
        };

        return self;
    };
});