define([], function () {
    return function (game) {
        var self = this;

        self.timer = game.time.create(false);
        self.timer.start();
        self.pendings = [];
        self.schedule = function (callback, delay, args) {
            self.pendings.push({
                callback: callback,
                args: args
            });
            self.timer.add(delay, callback, self, args);
        };
        self.suspend = function() {
            self.timer.pause();
        };
        self.continue = function() {
            self.timer.resume();
        };
        self.complete = function () {
            self.timer.removeAll();
            while(self.pendings.length > 0) {
                var pending = self.pendings[0]; self.pendings.shift();
                pending.callback.call(self, pending.args);
            }
        };
        self.reset = function() {
            self.timer.removeAll();
            self.pendings = [];
        };

        return self;
    };
});