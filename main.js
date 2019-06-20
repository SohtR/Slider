(function ($) {
   

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
            
            
        
            $('html').mousemove(function (event) {
                event = event || window.event;
                var posX = event.pageX;
                var posY = event.pageY;
                that.mousePosition = {x: posX, y: posY};
                // console.log(that.mousePosition);
                
            
                that.newMousePosition = that.getMousePositionRelativeToSlider();
                // console.log( that.newMousePosition);
                that.percentOfSlider = that.getPercentOfSlider(that.newMousePosition.x, that.sliderWidth);
                // console.log(`that.percentOfSlider:${that.percentOfSlider}`);
                that.handlerPositionWithRange = that.getHandlerPositionWithRange(that.minValue, that.maxValue, that.percentOfSlider);
                // console.log(`that.handlerPositionWithRange:${that.handlerPositionWithRange}`);
                that.handlerPositionWithStep = that.getHandlerPositionWithStep(that.handlerPositionWithRange, that.step);
                // console.log(`that.handlerPositionWithStep:${that.handlerPositionWithStep}`);
                that.getHandlerPositionToSlider(that.handlerPositionWithStep, that.minValue, that.maxValue, that.sliderWidth);
                // console.log(that.handlerPositionToSlider);
                
                that.modelChangedSubject.notifyObservers();
            });
            this.getMousePosition = function(){
                return that.mousePosition;
            };

            this.getMousePositionRelativeToSlider = function(){
                newMousePositionX = that.mousePosition.x - that.sliderLeft;
                newMousePositionY = that.mousePosition.y - that.sliderTop;
                return {x: newMousePositionX, y: newMousePositionY};
            };

            this.getPercentOfSlider = function(newMousePosition, sliderWidth){
                that.getMousePosition();
                that.getMousePositionRelativeToSlider();
                if(sliderWidth){
                    newMousePosition = Math.min(Math.max(0, newMousePosition), sliderWidth);
                    return Math.round((newMousePosition/sliderWidth)*100);
                }
                else {
                    throw new Error("slider width shouldn't be 0");
                }
            };

            this.getHandlerPositionWithRange = function(minValue, maxValue, percentOfSlider){
                return ((maxValue-minValue)*(percentOfSlider/100))+minValue;
            };
            
            this.getHandlerPositionWithStep = function(handlerPosition, step){
                return (Math.round(handlerPosition/step))*step;
            };
            
            this.handlerPositionToSliderChangedSubject = SLIDER.makeObservableSubject();
            this.getHandlerPositionToSlider = function(HandlerPositionWithStep, minValue, maxValue, sliderWidth){
                that.handlerPositionToSlider = sliderWidth*((HandlerPositionWithStep - minValue) / (maxValue - minValue)); 
                that.handlerPositionToSliderChangedSubject.notifyObservers();
                return  that.handlerPositionToSlider;
            };
            

        };
        

        SLIDER.Controller = function(model, view, opts){
            var options = opts;
            model.slider = view.slider;
            
            if (typeof(options.width) != 'undefined'){
                view.slider.css('width',(options.width+'px'));
            }

            model.minValue = options.minValue;
            model.maxValue = options.maxValue;
            model.step = options.step;


            model.sliderWidth = view.slider.width();
            model.sliderLeft = view.slider.offset().left;
            model.sliderTop = view.slider.offset().top;

            view.slider.mousemove(function(){
                view.slider.click(function(){
                    view.handler.animate({"left": model.handlerPositionToSlider - 10 + "px"}, 500);
                    view.handler.clearQueue();
                });
            });
            
            view.handler.on('mousedown', function() {
                $(document).on('mousemove', function () {
                    view.popup.show();
                    view.handler.css("left", model.handlerPositionToSlider -10);
                    view.popup.css("left", model.handlerPositionToSlider -20);
                    view.popup.text(model.handlerPositionWithStep);
                    console.log(model.handlerPositionToSlider);
                    console.log(model.handlerPositionWithStep);
                    
                    
                });
                $(document).mouseup(function(){
                    $(document).off('mousemove');
                    $(document).off('mouseup');
                    view.popup.hide();
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


/////////////////////////////////////////////////////////////////////////////////////////////
        $.fn.MySlider = function (options) {
            var opts = $.extend({}, $.fn.MySlider.defaults, options);

            return this.each(function () {
            var view = new SLIDER.View($(this));
            var model = new SLIDER.Model();
            var controller = new SLIDER.Controller(model, view, opts);
            });
        }

        $.fn.MySlider.defaults = {
            width: 300,
            minValue: 0,
            maxValue: 100,
            step: 1
        };
    
       
})(jQuery);

$(document).ready(function() {
    $(".container.1").MySlider();
    $(".container.2").MySlider(
        {
            width: 200,
            minValue: 100,
            maxValue: 500,
            step: 50
        });
});