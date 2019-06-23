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
/////// MODEL ////////////////////////////////////////////////////////////////////

        SLIDER.Model = function(){
            var that = this;
            this.mousePosition = {};
            // this.modelChangedSubject = SLIDER.makeObservableSubject();
            
            
        
            $('html').mousemove(function (event) {
                event = event || window.event;
                var posX = event.pageX;
                var posY = event.pageY;
                that.mousePosition = {x: posX, y: posY};
            
                that.newMousePosition = that.getMousePositionRelativeToSlider();
                if(that.vertical && that.vertical !== 'undefined'){
                    that.percentOfSlider = that.getPercentOfSlider(that.newMousePosition.y, that.sliderWidth);
                }else{
                    that.percentOfSlider = that.getPercentOfSlider(that.newMousePosition.x, that.sliderWidth);
                }
                that.handlerPositionWithRange = that.getHandlerPositionWithRange(that.minValue, that.maxValue, that.percentOfSlider);
                that.handlerPositionWithStep = that.getHandlerPositionWithStep(that.handlerPositionWithRange, that.step);
                that.getHandlerPositionToSlider(that.handlerPositionWithStep, that.minValue, that.maxValue, that.sliderWidth);
                
                

                // that.modelChangedSubject.notifyObservers();
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
        
//////// CONTROLLER //////////////////////////////////////////

        SLIDER.Controller = function(model, view, opts){
            var options = opts;
            model.slider = view.slider;
            view.setVertical(options.vertical);
            view.setWidth(options.width);
            view.setRange(options.range);
            model.vertical = options.vertical;
            view.setInput(options.input);
            
            if (typeof(options.width) != 'undefined' && !options.vertical){
                view.slider.css('width',(options.width+'px'));
            }

            model.minValue = options.minValue;                  //// Передача опций в модель
            model.maxValue = options.maxValue;
            model.step = options.step;
            model.sliderWidth = options.width;
            model.startPosition = options.startPosition;
            model.sliderLeft = view.slider.offset().left;
            model.sliderTop = view.slider.offset().top;

            if(options.vertical && options.vertical !== 'undefined'){
                var direction = 'top';
                var popupAlign = 17;
            }else{
                var direction = 'left';
                var popupAlign = 20;
            }
              
            var newStartPositionF = model.getHandlerPositionWithStep(options.startPosition[0], options.step);                                   /////// Рассчет стартовой позиции ползунка
            newStartPositionF = model.getHandlerPositionToSlider(newStartPositionF, options.minValue, options.maxValue, options.width);
            view.handler.css(direction, newStartPositionF );

            var newStartPositionS = model.getHandlerPositionWithStep(options.startPosition[1], options.step);                                   /////// Рассчет стартовой позиции ползунка
            newStartPositionS = model.getHandlerPositionToSlider(newStartPositionS, options.minValue, options.maxValue, options.width);
            view.handlerSecond.css(direction, newStartPositionS);
            

            var firstHandler = model.handlerPositionToSlider,
                secondHandler = model.handlerPositionToSlider;
            var secondInput = options.startPosition[1];
            var firstInput = options.startPosition[0];
            view.slider.mousemove(function(){                                                       /////// Передвижение ползунка кликом на слайдере
                view.slider.click(function(){
                        if(!options.range){
                            var object = {};
                            object[direction] = `${model.handlerPositionToSlider - 10}px`;
                            view.handler.animate(object, 500);
                            view.input.val(model.handlerPositionWithStep);
                            view.handler.clearQueue();
                        }
                });
            });
            
            view.handler.on('mousedown', function() {                                               ///////  Передвижение ползунка
                $(document).on('mousemove', function () {
                    if(options.popup && options.popup !== 'undefined'){
                    view.popup.show();
                    }
                    firstHandler = model.handlerPositionToSlider;
                    firstInput = model.handlerPositionWithStep;
                    if(options.range){
                        if(firstHandler < secondHandler-options.step){
                            view.handler.css(direction, model.handlerPositionToSlider -10);
                            view.popup.css(direction, model.handlerPositionToSlider -popupAlign);
                            view.popup.text(model.handlerPositionWithStep);
                            view.input.val(`${firstInput} - ${secondInput}`);
                        }  
                    }else{
                        view.handler.css(direction, model.handlerPositionToSlider -10);
                        view.popup.css(direction, model.handlerPositionToSlider -popupAlign);
                        view.popup.text(model.handlerPositionWithStep);
                        view.input.val(model.handlerPositionWithStep);
                    }
                        
                    
                });
                $(document).mouseup(function(){
                    $(document).off('mousemove');
                    $(document).off('mouseup');
                    view.popup.hide();
                });
            });                                                                                     /////////

            view.handlerSecond.on('mousedown', function() {                                         ////// Передвижение второго ползунка если задан диапазон
                $(document).on('mousemove', function () {
                    if(options.popup && options.popup !== 'undefined'){
                    view.popup.show();
                    }
                    secondHandler = model.handlerPositionToSlider;
                    secondInput = model.handlerPositionWithStep;
                    if(secondHandler > firstHandler+options.step){
                        view.handlerSecond.css(direction, model.handlerPositionToSlider -10);
                        view.popup.css(direction, model.handlerPositionToSlider -popupAlign);
                        view.popup.text(model.handlerPositionWithStep);
                        view.input.val(`${firstInput} - ${secondInput}`);
                    }
                    
                     
                    
                });
                $(document).mouseup(function(){
                    $(document).off('mousemove');
                    $(document).off('mouseup');
                    view.popup.hide();
                });
            });                                                                                     /////////
            
            view.input.focusout(function(){                                                                                 /////////  Передвинуть ползунок на введенное в инпут значение
                var newPosFromInput = ((view.input.val() - options.minValue) / (options.maxValue - options.minValue));
                newPosFromInput *= options.width;
                var object = {};
                object[direction] = `${newPosFromInput - 10}px`;
                view.handler.animate(object, 500);
            })
            
            
        };

/////// VIEW //////////////////////////////////////
        
        SLIDER.View = function (rootObject) {
            var that = this;
            this.viewChangedSubject = SLIDER.makeObservableSubject();
            that.slider = $('<div class="slider"></div>').appendTo(rootObject);
            that.handler = $('<div class="sliderHandler"></div>').appendTo(that.slider);
            that.popup = $('<div class="popup"></div>').appendTo(that.slider).hide();
            that.handlerSecond = $('<div class="sliderHandlerSecond"></div>').appendTo(that.slider).hide();
            that.input = $('<input type="text" class="handlerPosition"></input>').appendTo(that.slider).hide();
            
            this.setRange = function(value){
                that.range = value;
                if (that.range && that.range !== 'undefined'){
                    that.handlerSecond.show();
                } 
            };
            
            this.setInput = function(value){
                that.inputShowing = value;
                if (that.inputShowing && that.inputShowing !== 'undefined'){
                    that.input.show();
                } 
            }
            
            this.setWidth = function(value){
                that.width = value;
                if(that.vertical && that.vertical !== 'undefined'){
                    that.slider.addClass('vertical').css("height", that.width);
                }
            };

            this.getWidth = function(){
                return that.width;
            };
            
            this.setVertical = function(value){
                that.vertical = value;
                if(that.vertical && that.vertical !== 'undefined'){
                    that.slider.addClass('vertical').css("width", 5).css("height", that.getWidth());
                    that.popup.addClass('vertical');
                }
            }
            
            
            
            
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
            step: 1,
            startPosition: 0,
            vertical: false,
            popup: false,
            range: false,
            input: false
        };
    
       
})(jQuery);

$(document).ready(function() {
    $(".1").MySlider(
        {
            range: true,
            startPosition: [0, 50],
            popup: true,
            input: true,
            step: 5
        });
    $(".2").MySlider(
        {
            width: 200,
            minValue: 100,
            maxValue: 500,
            step: 50,
            startPosition:300,
            vertical: true,
            popup: true,
            input: true
        });
});