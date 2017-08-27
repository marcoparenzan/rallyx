define([], function () {
    return function (game, config) {
        var self = this;
        
        self.preload = function () {
            return self;
        };

        self.create = function () {
            self.sprite = game.add.sprite(config.x0, config.y0, "hud");

            self.sprite.animations.add('hud', [0], 1, false);
            self.sprite.fixedToCamera = true;
            
            self.sprite.animations.play("hud");
            
            return self;
        };
        
        self.update = function(map, layer) {
            return self;
        };

        return self;
    };
});