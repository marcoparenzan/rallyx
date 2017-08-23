define([], function () {
    return function (scope) {
        this.scope = scope;
        this.promises = [];

        var Promise = function(scope) {
            var self = this;
            self.scope = scope;
            self.then = function(callback) {
                self._then = callback;
                return self;
            };
            self.when = function(callback) {
                self._when = callback;
                return self;
            };
            self.fulfill = function() {
                if (self._then === undefined) return self;
                var execute = true;
                if (self._when !== undefined) {
                    execute = self._when.apply(self.scope, arguments); 
                }
                if (execute === true) {
                    self._then.apply(self.scope, arguments);
                }
                return self;
            };
            self.promises.push(self);
            return self;
        };

        this.fulfill = function() {
            var self = this;
            var i = 0;
            while (true) {
                if (i === self.promises.length) break;
                self.promises.fulfill.apply(self.scope, arguments);
                i++;
            }
            
            return self;
        };
        
        this.promise = function() {
            var self = this;
            return new Promise(self.scope);
        };

        return this;
    };
});