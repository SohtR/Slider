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
        notify: notifyObservers
    };
};

SLIDER.Model = function(){
    var that = this;
    
    var minValue = 100;
    var maxValue = 500;
    var step = 25;

    var mousePos;
    that.newPos = {};
   
    that.pos = {};
    that.sliderWidth;
    that.sliderLeft;
    that.sliderTop;
    this.modelChangedSubject = SLIDER.makeObservableSubject();
    
    that.getPercentOfSlider = function(){                       // Вычисляется процент от всего слайдера
        return Math.round((newPos/that.sliderWidth)*100);
    };
    this.getMousePosition = function(){
        $(document).mousemove(function (event) {
        event = event || window.event;
        var posX = event.pageX;
        var posY = event.pageY;
        that.pos = {x: posX, y: posY};
        that.modelChangedSubject.notifyObservers();
        });
    };
    
    this.getMousePositionRelativeToSliderSubject = SLIDER.makeObservableSubject();
    this.getMousePositionRelativeToSlider = function(){
        that.getMousePosition();
        newMousePositionX = that.pos.x - that.sliderLeft;
        newMousePositionY = that.pos.y - that.sliderTop;
        that.newPos = {x: newMousePositionX, y: newMousePositionY};
        return newPos = {x: newMousePositionX, y: newMousePositionY};
        that.getMousePositionRelativeToSliderSubject.notifyObservers();
    };
    

};

SLIDER.Controller = function(model, view){
    
    model.modelChangedSubject.addObserver(function () {
        
    });

    // model.getMousePosition();  //   вызвать функцию из модели
    // console.log(model.pos); //      затем можно использовать

    model.sliderWidth = view.slider.width();
    model.sliderLeft = view.slider.offset().left;
    model.sliderTop = view.slider.offset().top;

    model.getMousePositionRelativeToSliderSubject.addObserver(function () {
        // model.getMousePositionRelativeToSlider();
        // console.log(model.newPos);
    });
    
    
    
        view.slider.mousemove(function(){
            model.getMousePositionRelativeToSlider();
            view.slider.mousedown(function(){
                view.handler.animate({"left": model.newPos.x-10+ "px"}, 500);
                view.handler.clearQueue();
                // $inputPos.val(handlerPosNoMouse);
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
    
};


$(document).ready(function () {
    var view = new SLIDER.View($('.container').appendTo($("body")));
    var model = new SLIDER.Model();
    var controller = new SLIDER.Controller(model, view);
});