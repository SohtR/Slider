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
            
            this.setMinValue = function(value){
                that.minValue = value;
            }

            this.setDirection = function(vertical){
                var isVertical = vertical;
                if(isVertical && isVertical !== 'undefined'){
                    that.direction = 'top';
                    that.popupAlign = 17;
                }else{
                    that.direction = 'left';
                    that.popupAlign = 20;
                }
            }
            
        
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

        SLIDER.Controller = function(model, view, opts, config){
            var that = this;
            var options = opts;
            
            
            view.setVertical(options.vertical);
            view.setRange(options.range);
            view.setWidth(options.width);
            view.setInput(options.input);
            view.setScale(options.minValue, options.maxValue, options.step);
            view.showScale(options.scale);
            
            model.setMinValue(options.minValue);

            // model.minValue = options.minValue;                  //// Передача опций в модель
            model.maxValue = options.maxValue;
            model.step = options.step;
            model.sliderWidth = options.width;
            model.startPosition = options.startPosition;
            model.sliderLeft = view.slider.offset().left;
            model.sliderTop = view.slider.offset().top;
            model.vertical = options.vertical;

            // that.setDirection = function(vertical){
            //     var isVertical = vertical;
            //     if(isVertical && isVertical !== 'undefined'){
            //         that.direction = 'top';
            //         that.popupAlign = 17;
            //     }else{
            //         that.direction = 'left';
            //         that.popupAlign = 20;
            //     }
            // }
            model.setDirection(options.vertical);
              
            var newStartPositionF = model.getHandlerPositionWithStep(options.startPosition[0], options.step);                                   /////// Рассчет стартовой позиции ползунка
            newStartPositionF = model.getHandlerPositionToSlider(newStartPositionF, options.minValue, options.maxValue, options.width);
            view.handler.css(model.direction, newStartPositionF );

            var newStartPositionS = model.getHandlerPositionWithStep(options.startPosition[1], options.step);                                   /////// Рассчет стартовой позиции ползунка
            newStartPositionS = model.getHandlerPositionToSlider(newStartPositionS, options.minValue, options.maxValue, options.width);
            view.handlerSecond.css(model.direction, newStartPositionS);
            

            var firstHandler = model.handlerPositionToSlider,
                secondHandler = model.handlerPositionToSlider,
                secondInput = options.startPosition[1],
                firstInput = options.startPosition[0],
                firstProgressPosition = (model.handlerPositionToSlider/options.width)*100,
                secondProgressPosition = (model.handlerPositionToSlider/options.width)*100;
            
            view.slider.mousemove(function(){                                                       /////// Передвижение ползунка кликом на слайдере
                view.slider.click(function(){
                        if(!options.range){
                            var object = {};
                            object[model.direction] = `${model.handlerPositionToSlider - 10}px`;
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
                    if(model.handlerPositionWithStep < options.minValue ){
                        model.handlerPositionWithStep = options.minValue;
                        model.handlerPositionToSlider = ((model.handlerPositionWithStep - options.minValue) / (options.maxValue - options.minValue));
                        model.handlerPositionToSlider *= options.width;
                    }
                    
                    firstHandler = model.handlerPositionToSlider;
                    firstInput = model.handlerPositionWithStep;
                    firstProgressPosition = (model.handlerPositionToSlider/options.width)*100;
                    if(options.range){
                        if(firstHandler < secondHandler){
                            
                            view.handler.css(model.direction, model.handlerPositionToSlider -10);
                            view.slider.css('background', `linear-gradient(to right, #e5e5e5 0%, #e5e5e5 ${firstProgressPosition}%, #e75735 ${firstProgressPosition}%, #e75735 ${secondProgressPosition}%, #e5e5e5 ${secondProgressPosition}%, #e5e5e5 100%)`);
                            view.popup.css(model.direction, model.handlerPositionToSlider - model.popupAlign);
                            view.popup.text(model.handlerPositionWithStep);
                            view.input.val(`${firstInput} - ${secondInput}`);
                        }  
                    }else{
                        firstProgressPosition = (model.handlerPositionToSlider/options.width)*100;
                        view.handler.css(model.direction, model.handlerPositionToSlider -10);
                        view.slider.css('background', `linear-gradient(to right, #e75735 0%, #e75735 ${firstProgressPosition}%, #e5e5e5 ${firstProgressPosition}%, #e5e5e5 100%)`);
                        view.popup.css(model.direction, model.handlerPositionToSlider - model.popupAlign);
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
                    if(model.handlerPositionWithStep > options.maxValue){
                        model.handlerPositionWithStep = options.maxValue;
                        model.handlerPositionToSlider = ((model.handlerPositionWithStep - options.minValue) / (options.maxValue - options.minValue));
                        model.handlerPositionToSlider *= options.width;
                    }
                    secondHandler = model.handlerPositionToSlider;
                    secondInput = model.handlerPositionWithStep;
                    secondProgressPosition = (model.handlerPositionToSlider/options.width)*100;
                    if(secondHandler > firstHandler){
                        view.handlerSecond.css(model.direction, model.handlerPositionToSlider -10);
                        view.slider.css('background', `linear-gradient(to right, #e5e5e5 0%, #e5e5e5 ${firstProgressPosition}%, #e75735 ${firstProgressPosition}%, #e75735 ${secondProgressPosition}%, #e5e5e5 ${secondProgressPosition}%, #e5e5e5 100%)`);
                        view.popup.css(model.direction, model.handlerPositionToSlider - model.popupAlign);
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
                object[model.direction] = `${newPosFromInput - 10}px`;
                view.handler.animate(object, 500);
            })

            config.configRangeChangedSubject.addObserver(function () {
                view.setRange(config.newRange);
            });

            config.configVerticalChangedSubject.addObserver(function () {
                view.setVertical(config.newVertical);
                model.vertical = options.vertical;
                model.setDirection(options.vertical);
                // model.getHandlerPositionToSlider(model.handlerPositionWithStep, model.minValue, model.maxValue, model.sliderWidth);
                // view.handler.css(model.direction, model.handlerPositionToSlider -10);
                // view.handlerSecond.css(model.direction, model.handlerPositionToSlider -10);
                
            });

            config.configPopupChangedSubject.addObserver(function () {

            });
            
            config.configStepChangedSubject.addObserver(function () {
                model.step = options.step;
                view.scale.empty();
                view.setScale(options.minValue, options.maxValue, options.step);
            });

            config.configInputChangedSubject.addObserver(function () {
                view.setInput(config.newInput);
            });

            config.configWidthChangedSubject.addObserver(function () {
                view.setWidth(config.configWidth.val());
                model.sliderWidth = config.configWidth.val();
            });

            config.configMaxValueChangedSubject.addObserver(function () {
                model.maxValue = options.maxValue;
                view.scale.empty();
                view.setScale(options.minValue, options.maxValue, options.step);
            });

            config.configMinValueChangedSubject.addObserver(function () {
                model.setMinValue(parseInt(options.minValue));  
                view.setScale(options.minValue, options.maxValue);
                view.scale.empty();
                view.setScale(options.minValue, options.maxValue, options.step);  
            });

            config.configChangedSubject.addObserver(function () {
            });

            config.configScaleChangedSubject.addObserver(function () {
                view.showScale(options.scale);
            });
            
            
        };

/////// VIEW //////////////////////////////////////
        
        SLIDER.View = function (rootObject) {
            var that = this;
            this.viewChangedSubject = SLIDER.makeObservableSubject();
            that.slider = $('<div class="slider"></div>').prependTo(rootObject);
            that.handler = $('<div class="sliderHandler"></div>').appendTo(that.slider);
            that.popup = $('<div class="popup"></div>').appendTo(that.slider).hide();
            that.handlerSecond = $('<div class="sliderHandlerSecond"></div>').appendTo(that.slider).hide();
            that.scale = $('<div class="scale"></div>').appendTo(that.slider);
            that.input = $('<input type="text" class="handlerPosition"></input>').appendTo(that.slider).hide();
            

            this.setScale = function(minValue, maxValue, step){
                minValue = parseInt(minValue);
                maxValue = parseInt(maxValue);
                step = parseInt(step);
                that.scaleStart = $('<span class="scaleStart"></span>').appendTo(that.scale);
                that.scaleStart.text(minValue);
                var scaleAmount = Math.round(maxValue-minValue)/step,
                    scaleSum = minValue + step;
                for (var i = 1; i < scaleAmount; i++){
                    $('<span class="scaleMiddle"></span>').appendTo(that.scale).text(scaleSum);
                    scaleSum += step;
                }    
                that.scaleEnd = $('<span class="scaleEnd"></span>').appendTo(that.scale);
                that.scaleEnd.text(maxValue);
                
            };

            this.showScale = function(value){
                that.scaleShow = value;
                if(that.scaleShow && that.scaleShow!== 'undefined'){
                    that.scale.show();
                } else{
                    that.scale.hide();
                }
            }

            this.setRange = function(value){
                that.range = value;
                if (that.range && that.range !== 'undefined'){
                    that.handlerSecond.show();
                } else{
                    that.handlerSecond.hide();
                } 
            };
            
            this.setInput = function(value){
                that.inputShowing = value;
                if (that.inputShowing && that.inputShowing !== 'undefined'){
                    that.input.show();
                } else{
                    that.input.hide();
                }
            }
            
            this.setWidth = function(value){
                that.width = value;
               
                if(that.vertical && that.vertical !== 'undefined'){
                    that.slider.addClass('vertical').css("height", that.width);
                    that.scale.addClass('scaleVertical');
                    that.slider.css("width", 5);
                    that.popup.addClass('vertical');
                } else{
                    that.slider.removeClass('vertical').css("height", 5);
                    that.slider.css("width", that.width);
                    that.popup.removeClass('vertical');
                }
            };

            this.getWidth = function(){
                return that.width;
            };
            
            this.setVertical = function(value){
                that.vertical = value;
                if(that.vertical && that.vertical !== 'undefined'){
                    that.slider.addClass('vertical').css("height", that.width);
                    that.scale.addClass('scaleVertical');
                    that.slider.css("width", 5);
                    that.popup.addClass('vertical');
                    that.handler.css('left', -7);
                    that.handlerSecond.css('left', -7);
                } else {
                    that.slider.removeClass('vertical').css("height", 5);
                    that.slider.css("width", that.width);
                    that.popup.removeClass('vertical');
                    that.scale.removeClass('scaleVertical');
                    that.handler.css('top', -7);
                    that.handlerSecond.css('top', -7);
                }
            }
            
            
            
            
        };
        

        SLIDER.Config = function(rootObject, opts){
            var options = opts;
            var that = this;
            this.configChangedSubject = SLIDER.makeObservableSubject();

            that.configBody = $('<div class="config"></div>').appendTo(rootObject);
            

            this.configWidthChangedSubject = SLIDER.makeObservableSubject();
            $configWidth =  $('<label>Width</label>').appendTo(that.configBody);
            that.configWidth = $('<input type="text" name="width">').appendTo(that.configBody);
            that.configWidth.val(parseInt(options.width));
            
            that.configWidth.focusout(function(){                                                                                 /////////  Передвинуть ползунок на введенное в инпут значение
                
                that.newWidth = options.width; 
                
                
                that.configWidthChangedSubject.notifyObservers();
            });
            
            this.configStepChangedSubject = SLIDER.makeObservableSubject();
            $configStep =  $('<label>Step</label>').appendTo(that.configBody);
            that.configStep = $('<input type="text" name="step">').appendTo(that.configBody);
            that.configStep.val(options.step);
            that.configStep.focusout(function(){                                                                                 /////////  Передвинуть ползунок на введенное в инпут значение
                options.step =  that.configStep.val(); 
                that.configStepChangedSubject.notifyObservers();
            });

            this.configMinValueChangedSubject = SLIDER.makeObservableSubject();
            $configMinValue =  $('<label>MinValue</label>').appendTo(that.configBody);
            that.configMinValue = $('<input type="text" name="MinValue">').appendTo(that.configBody);
            that.configMinValue.val(options.minValue);
            that.configMinValue.focusout(function(){                                                                                 /////////  Передвинуть ползунок на введенное в инпут значение
                options.minValue =  parseInt(that.configMinValue.val()); 
                that.configMinValueChangedSubject.notifyObservers();
            });

            this.configMaxValueChangedSubject = SLIDER.makeObservableSubject();
            $configMaxValue =  $('<label>MaxValue</label>').appendTo(that.configBody);
            that.configMaxValue = $('<input type="text" name="MaxValue">').appendTo(that.configBody);
            that.configMaxValue.val(options.maxValue);
            that.configMaxValue.focusout(function(){                                                                                 /////////  Передвинуть ползунок на введенное в инпут значение
                options.maxValue =  that.configMaxValue.val(); 
                that.configMaxValueChangedSubject.notifyObservers();
            });

            this.configPopupChangedSubject = SLIDER.makeObservableSubject();
            that.configPopup = $('<button name="popup">Popup</button>').appendTo(that.configBody);
            that.configPopup.click(function(){                                                                                 /////////  Передвинуть ползунок на введенное в инпут значение
                options.popup = !options.popup;
                that.configPopupChangedSubject.notifyObservers();
            });

            this.configRangeChangedSubject = SLIDER.makeObservableSubject();
            that.configRange = $('<button name="range">Range</button>').appendTo(that.configBody);
            that.configRange.click(function(){                                                                                 /////////  Передвинуть ползунок на введенное в инпут значение
                options.range = !options.range;
                that.newRange = options.range;
                that.configRangeChangedSubject.notifyObservers();
            });

            this.configInputChangedSubject = SLIDER.makeObservableSubject();
            that.configInput = $('<button name="input">Input</button>').appendTo(that.configBody);
            that.configInput.click(function(){                                                                                 /////////  Передвинуть ползунок на введенное в инпут значение
                options.input = !options.input;
                that.newInput = options.input;
                that.configInputChangedSubject.notifyObservers();
            });

            this.configVerticalChangedSubject = SLIDER.makeObservableSubject();
            that.configVertical = $('<button name="vertical">Vertical</button>').appendTo(that.configBody);
            that.configVertical.click(function(){                                                                                 /////////  Передвинуть ползунок на введенное в инпут значение
                options.vertical = !options.vertical;
                that.newVertical = options.vertical;
                that.configVerticalChangedSubject.notifyObservers();
            });
            
            this.configScaleChangedSubject = SLIDER.makeObservableSubject();
            that.configScale = $('<button name="scale">Scale</button>').appendTo(that.configBody);
            that.configScale.click(function(){                                                                                 /////////  Передвинуть ползунок на введенное в инпут значение
                options.scale = !options.scale;
                that.newScale = options.scale;
                that.configScaleChangedSubject.notifyObservers();
            });

            
            
        }


/////////////////////////////////////////////////////////////////////////////////////////////
        $.fn.MySlider = function (options) {
            var opts = $.extend({}, $.fn.MySlider.defaults, options);

            return this.each(function () {
            var view = new SLIDER.View($(this));
            var config = new SLIDER.Config($(this), opts);
            var model = new SLIDER.Model();
            var controller = new SLIDER.Controller(model, view, opts, config);
            });
        }

        $.fn.MySlider.defaults = {
            width: 300,
            minValue: 0,
            maxValue: 100,
            step: 1,
            startPosition: [0, 100],
            vertical: false,
            popup: false,
            range: false,
            input: false,
            scale: true
        };
    
       
})(jQuery);

$(document).ready(function() {
    $(".1").MySlider(
        {
            range: true,
            startPosition: [0, 330],
            popup: true,
            input: false,
            step: 30,
            minValue: 0,
            maxValue: 330
        });
    $(".2").MySlider(
        {
            width: 200,
            minValue: 100,
            maxValue: 500,
            step: 50,
            startPosition:[300, 400],
            vertical: true,
            popup: true,
            input: true,
            range:true
        });
    $(".3").MySlider(
        {
            range: true,
            startPosition: [0, 330],
            popup: true,
            input: false,
            step: 30,
            minValue: 0,
            maxValue: 330
        });
});