var makeObservableSubject = function () {
    var observers = [];
    var addObserver = function (o) {
        if (typeof o !== 'function') {
            throw new Error('observer must be a function');
        }
        for (var i = 0; i < observers.length; i++) {
            var observer = observers[i];
            if (observer === o) {
                throw new Error('observer already in the list');
            }
        }
        observers.push(o);
    };
    var removeObserver = function (o) {
        for (var i = 0; i < observers.length; i++) {
            var observer = observers[i];
            if (observer === o) {
                observers.splice(i, 1);
                return;
            }
        }
        throw new Error('could not find observer in list of observers');
    };
    var notifyObservers = function (data) {
        // Make a copy of observer list in case the list
        // is mutated during the notifications.
        var observersSnapshot = observers.slice(0);
        for (var i = 0; i < observersSnapshot.length; i++) {
            observersSnapshot[i](data);
        }
    };
    return {
        addObserver: addObserver,
        removeObserver: removeObserver,
        notifyObservers: notifyObservers,
        notify: notifyObservers
    };
};


var View = function (rootObject) {
    var that = this;
    // $container.append('<div class="slider"><div class="popup"></div><div class="slider-handler"></div></div><input type="text" class="handlerPosition">');
    that.slider = $('<div class="slider"></div>').appendTo(rootObject);
    that.handler = $('<div class="slider-handler"></div>').appendTo(that.slider);
    that.popup = $('<div class="popup"></div>').appendTo(that.slider);
    
};


$(document).ready(function () {
    var view = new View($('.container').appendTo($("body")));
});