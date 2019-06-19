var SLIDER = {};

SLIDER.makeObservableSubject = function () {
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
    };
};

SLIDER.Model = function(){
    var that = this;
    this.mousePosition = {};
    this.modelChangedSubject = SLIDER.makeObservableSubject();
    that.minValue = 100;
    that.maxValue = 500;
    that.step = 25;
    
   
    $(document).mousemove(function (event) {
        event = event || window.event;
        var posX = event.pageX;
        var posY = event.pageY;
        that.mousePosition = {x: posX, y: posY};

        that.percentOfSlider = that.getPercentOfSlider(that.newMousePosition.x, that.sliderWidth);
        that.handlerPositionWithRange = that.getHandlerPositionWithRange(that.minValue, that.maxValue, that.percentOfSlider);
       

        that.modelChangedSubject.notifyObservers();
    });
     this.getMousePosition = function(){
        return that.mousePosition;
    };

    this.getMousePositionRelativeToSlider = function(){
        newMousePositionX = that.mousePosition.x - that.sliderLeft;
        newMousePositionY = that.mousePosition.y - that.sliderTop;
        return that.newMousePosition = {x: newMousePositionX, y: newMousePositionY};
    };

    this.getPercentOfSlider = function(newMousePosition, sliderWidth){
        that.getMousePosition();
        that.getMousePositionRelativeToSlider();
        if(sliderWidth)
        return Math.round((newMousePosition/sliderWidth)*100);
        else {
            throw new Error("slider width shouldn't be 0");
        }
    };

    this.getHandlerPositionWithRange = function(minValue, maxValue, percentOfSlider){
        return handlerPositionWithRange = ((maxValue-minValue)*(percentOfSlider/100))+minValue;
    }
    
    
    
    
};
   

SLIDER.Controller = function(model, view){
    model.sliderWidth = view.slider.width();
    model.sliderLeft = view.slider.offset().left;
    model.sliderTop = view.slider.offset().top;
    
    view.slider.mousemove(function(){
        model.getMousePositionRelativeToSlider();
        view.slider.mousedown(function(){
            view.handler.animate({"left": model.newMousePosition.x - 10 + "px"}, 500);
            view.handler.clearQueue();
        });
    });
};

SLIDER.View = function (rootObject) {
    var that = this;
    this.viewChangedSubject = SLIDER.makeObservableSubject();
    // $container.append('<div class="slider"><div class="popup"></div><div class="slider-handler"></div></div><input type="text" class="handlerPosition">');
    that.slider = $('<div class="slider"></div>').appendTo(rootObject);
    that.handler = $('<div class="slider-handler"></div>').appendTo(that.slider);
    that.popup = $('<div class="popup"></div>').appendTo(that.slider).hide();
    
    that.handler.mousedown(function() {
        $(document).mousemove(function () {
            that.popup.show();
        });
        $(document).mouseup(function(){
            $(document).off('mousemove');
            $(document).off('mouseup');
            that.popup.hide();
        });
    });

};



// $(document).ready(function () {
//     var view = new SLIDER.View($('.container').appendTo($(".container")));
//     var model = new SLIDER.Model();
//     var controller = new SLIDER.Controller(model, view);
    
// });