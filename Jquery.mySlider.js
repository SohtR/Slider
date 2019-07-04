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
        this.modelChangedSubject = SLIDER.makeObservableSubject();
        
        this.setMinValue = function(value){
            that.minValue = value;
        }

        this.setDirection = function(vertical){
            var isVertical = vertical;
            if(isVertical && isVertical !== 'undefined'){
                that.direction = 'top';
                that.popupAlign = 17;
                that.directionProgress = 'to bottom';
            }else{
                that.direction = 'left';
                that.popupAlign = 20;
                that.directionProgress = 'to right';
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
            // that.startPositionFirst = that.getStartPosition(that.startPosition[0], that.step, that.minValue, that.maxValue, that.width);
            // that.startPositionSecond = that.getStartPosition(that.startPosition[1], that.step, that.minValue, that.maxValue, that.sliderWidth);
            // console.log(that.startPosition[0], that.step, that.minValue, that.maxValue, that.sliderWidth);
            

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
        
        this.getStartPosition = function(startPosition, step, minValue, maxValue, width){
            var newStartPosition = that.getHandlerPositionWithStep(startPosition, step);
            return that.getHandlerPositionToSlider(newStartPosition, minValue, maxValue, width);
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
        view.getWidth(options.width);

        model.setMinValue(options.minValue);
        model.minValue = options.minValue;                  //// Передача опций в модель
        model.maxValue = options.maxValue;
        model.step = options.step;
        model.sliderWidth = options.width;
        model.startPosition = options.startPosition;
        model.sliderLeft = view.slider.offset().left;
        model.sliderTop = view.slider.offset().top;
        model.vertical = options.vertical;
        model.setDirection(options.vertical);
        
        var newStartPositionFirst = model.getStartPosition(options.startPosition[0], options.step, options.minValue, options.maxValue, options.width);
        view.newStartPositionFirst = newStartPositionFirst;
       
        var newStartPositionSecond = model.getStartPosition(options.startPosition[1], options.step, options.minValue, options.maxValue, options.width);
        view.firstHandler = newStartPositionFirst;
        view.secondHandlerPos = newStartPositionSecond;
        
        view.setStartPosition(view.firstHandler, view.secondHandlerPos, model.direction, options.range, options.width, model.directionProgress);
        
        view.secondHandlerPos = model.handlerPositionToSlider;
        view.secondInput = options.startPosition[1];
        view.firstInput = options.startPosition[0];
        

        model.modelChangedSubject.addObserver(function () {                                             //////// Передача переменных в View
            view.direction = model.direction;
            view.range = options.range;
            view.handlerPositionToSlider = model.handlerPositionToSlider;
            view.handlerPositionWithStep = model.handlerPositionWithStep;
            view.popupAlign = model.popupAlign;
            view.directionProgress = model.directionProgress;
           
            view.popupOption = options.popup;
            view.minValue = options.minValue;
            view.maxValue = options.maxValue;
            view.width = options.width;
            view.progress = options.progress;
            view.startPosition = options.startPosition;
            config.configVerticalChangedSubject.addObserver(function () {
                view.handlerPositionToSlider = model.handlerPositionToSlider;
            })
        });
                                              
        
        

        config.configRangeChangedSubject.addObserver(function () {
            view.setRange(config.newRange);
        });

        config.configVerticalChangedSubject.addObserver(function () {
            view.setVertical(config.newVertical);
            model.vertical = options.vertical;
            model.setDirection(options.vertical);
            view.handlerPositionToSlider = model.handlerPositionToSlider;
            
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

        config.configProgressChangedSubject.addObserver(function () {
            view.slider.css('background', '#e5e5e5');
        });

                      
    };

/////// VIEW //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    SLIDER.View = function (rootObject) {
        var that = this;
        this.viewChangedSubject = SLIDER.makeObservableSubject();
        that.slider = $('<div class="slider"></div>').prependTo(rootObject);
        that.handler = $('<div class="sliderHandler"></div>').appendTo(that.slider);
        that.popup = $('<div class="popup"></div>').appendTo(that.slider).hide();
        that.handlerSecond = $('<div class="sliderHandlerSecond"></div>').appendTo(that.slider).hide();
        that.scale = $('<div class="scale"></div>').appendTo(that.slider);
        that.input = $('<input type="text" class="handlerPosition"></input>').appendTo(that.slider).hide();
        
        

        that.slider.mousemove(function(){ 
            that.slider.click(function(){
                if(!that.range){
                    var object = {};
                    object[that.direction] = `${that.handlerPositionToSlider - 10}px`;
                    that.handler.animate(object, 500);
                    that.input.val(that.handlerPositionWithStep);
                    that.handler.clearQueue();
                }
            });
        });
        this.viewHandlerChangedSubject = SLIDER.makeObservableSubject();
        
        
        that.handler.on('mousedown', function() { 
            $(document).on('mousemove', function () {
                if(that.popupOption && that.popupOption !== 'undefined'){
                that.popup.show();
                }
                if(that.handlerPositionWithStep < that.minValue ){
                    that.handlerPositionWithStep = that.minValue;
                    that.handlerPositionToSlider = ((that.handlerPositionWithStep - that.minValue) / (that.maxValue - that.minValue));
                    that.handlerPositionToSlider *= that.width;
                }
                firstHandler = that.handlerPositionToSlider;
                that.firstHandler = that.handlerPositionToSlider;
                that.firstHandlerPos = that.handlerPositionToSlider;
                that.firstInput = that.handlerPositionWithStep;
                that.firstProgressPosition = (that.handlerPositionToSlider/that.width)*100;
                if(that.range){
                    if(that.firstHandlerPos < that.secondHandlerPos){
                        if(typeof(that.firstProgressPosition) == 'undefined'|| isNaN(that.firstProgressPosition)){
                            that.firstProgressPosition = ((parseInt(that.handler.css(that.direction))+10)/that.width)*100;
                        }
                        if(typeof(that.secondProgressPosition) == 'undefined'|| isNaN(that.secondProgressPosition)){
                            that.secondProgressPosition = ((parseInt(that.handlerSecond.css(that.direction))+10)/that.width)*100;
                        }
                        if(that.progress){
                            that.slider.css('background', `linear-gradient(${that.directionProgress}, #e5e5e5 0%, #e5e5e5 ${that.firstProgressPosition}%, #e75735 ${that.firstProgressPosition}%, #e75735 ${that.secondProgressPosition}%, #e5e5e5 ${that.secondProgressPosition}%, #e5e5e5 100%)`);
                        }
                        that.handler.css(that.direction, that.firstHandler -10);
                        that.popup.css(that.direction, that.handlerPositionToSlider - that.popupAlign);
                        that.popup.text(that.handlerPositionWithStep);
                        that.input.val(`${that.firstInput} - ${that.secondInput}`);
                    }  
                }else{
                    that.firstProgressPosition = (that.handlerPositionToSlider/that.width)*100;
                    if(typeof(that.firstProgressPosition) == 'undefined'|| isNaN(that.firstProgressPosition)){
                        that.firstProgressPosition = ((parseInt(that.handler.css(that.direction))+10)/that.width)*100;
                    }
                    if(typeof(that.secondProgressPosition) == 'undefined'|| isNaN(that.secondProgressPosition)){
                        that.secondProgressPosition = ((parseInt(that.handlerSecond.css(that.direction))+10)/that.width)*100;
                    }
                    if(that.progress){
                        that.slider.css('background', `linear-gradient(${that.directionProgress}, #e75735 0%, #e75735 ${that.firstProgressPosition}%, #e5e5e5 ${that.firstProgressPosition}%, #e5e5e5 100%)`);
                    }
                    that.handler.css(that.direction, that.handlerPositionToSlider -10);
                    that.popup.css(that.direction, that.handlerPositionToSlider - that.popupAlign);
                    that.popup.text(that.handlerPositionWithStep);
                    that.input.val(that.handlerPositionWithStep);
                }
                that.viewHandlerChangedSubject.notifyObservers();
            });
            $(document).mouseup(function(){
                $(document).off('mousemove');
                $(document).off('mouseup');
                that.popup.hide();
            });
        });    
        
        that.handlerSecond.on('mousedown', function() { 
            
            $(document).on('mousemove', function () {
                if(that.popupOption && that.popupOption !== 'undefined'){
                that.popup.show();
                }
                if(that.handlerPositionWithStep > that.maxValue){
                    that.handlerPositionWithStep = that.maxValue;
                    that.handlerPositionToSlider = ((that.handlerPositionWithStep - that.minValue) / (that.maxValue - that.minValue));
                    that.handlerPositionToSlider *= that.width;
                }
                that.secondHandlerPos = that.handlerPositionToSlider;
                that.secondInput = that.handlerPositionWithStep;
                that.secondProgressPosition = (that.handlerPositionToSlider/that.width)*100;
                if(typeof(that.firstHandlerPos) == 'undefined'){
                    that.firstHandlerPos = parseInt(that.handler.css(that.direction))+10;
                }
                if(that.secondHandlerPos > that.firstHandlerPos ){
                    if(typeof(that.firstProgressPosition) == 'undefined' || isNaN(that.firstProgressPosition)){
                        that.firstProgressPosition = ((parseInt(that.handler.css(that.direction))+10)/that.width)*100;
                    }
                    if(typeof(that.secondProgressPosition) == 'undefined' || isNaN(that.secondProgressPosition)){
                        that.secondProgressPosition = ((parseInt(that.handlerSecond.css(that.direction))+10)/that.width)*100;
                    }
                    
                    that.handlerSecond.css(that.direction, that.secondHandlerPos -10);
                    if(that.progress){
                        that.slider.css('background', `linear-gradient(${that.directionProgress}, #e5e5e5 0%, #e5e5e5 ${that.firstProgressPosition}%, #e75735 ${that.firstProgressPosition}%, #e75735 ${that.secondProgressPosition}%, #e5e5e5 ${that.secondProgressPosition}%, #e5e5e5 100%)`);
                    }
                    that.popup.css(that.direction, that.handlerPositionToSlider - that.popupAlign);
                    that.popup.text(that.handlerPositionWithStep);
                    that.input.val(`${that.firstInput} - ${that.secondInput}`);
                }
            });
            $(document).mouseup(function(){
                $(document).off('mousemove');
                $(document).off('mouseup');
                that.popup.hide();
            });
        });                
   
        that.input.focusout(function(){                                                                                 /////////  Передвинуть ползунок на введенное в инпут значение
            var newPosFromInput = ((that.input.val() - that.minValue) / (that.maxValue - that.minValue));
            newPosFromInput *= that.width;
            var object = {};
            object[that.direction] = `${newPosFromInput - 10}px`;
            that.handler.animate(object, 500);
            
        })

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

        this.getWidth = function(value){
            return that.width = value;
        };

        this.setVertical = function(value){
            that.vertical = value;
            
            if(that.vertical && that.vertical !== 'undefined'){
                that.slider.addClass('vertical').css("height", that.width);
                that.scale.addClass('scaleVertical');
                that.slider.css("width", 5);
                that.popup.addClass('vertical');
                that.popup.css('left', 25);
                that.handler.css('left', -7);
                that.handler.css('top', that.firstHandlerPos -10);
                that.handlerSecond.css('left', -7);
                that.handlerSecond.css('top', that.secondHandlerPos -10);
            } else {
                that.slider.removeClass('vertical').css("height", 5);
                that.slider.css("width", that.width);
                that.popup.removeClass('vertical');
                that.scale.removeClass('scaleVertical');
                that.handler.css('top', -7);
                that.handler.css('left', that.firstHandlerPos -10);
                that.handlerSecond.css('top', -7);
                that.handlerSecond.css('left', that.secondHandlerPos -10);
                that.popup.css('top', -45);
            }
        };
        
        this.setStartPosition = function(newStartPositionFirst, newStartPositionSecond, direction, range, width, directionProgress){
            that.handler.css(direction, newStartPositionFirst - 10);
            that.handlerSecond.css(direction, newStartPositionSecond-10);
            var startProgress = (newStartPositionFirst/that.width)*100;                                                                          //////// Установка стартовой позиции прогресс-бара
            var endProgress = (newStartPositionSecond/that.width)*100;
            if (range){
                that.slider.css('background', `linear-gradient(${directionProgress}, #e5e5e5 0%, #e5e5e5 ${startProgress}%, #e75735 ${startProgress}%, #e75735 ${endProgress}%, #e5e5e5 ${endProgress}%, #e5e5e5 100%)`);
            } else {
                that.slider.css('background', `linear-gradient(${directionProgress}, #e75735 0%, #e75735 ${startProgress}%, #e5e5e5 ${startProgress}%, #e5e5e5 100%)`);
            }

        };
        
        
    };
//////////////////  CONFIG    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    SLIDER.Config = function(rootObject, opts){
        var options = opts;
        var that = this;
        this.configChangedSubject = SLIDER.makeObservableSubject();
        if(options.config){
            that.configBody = $('<div class="config"></div>').appendTo(rootObject);
        }
        
        this.configWidthChangedSubject = SLIDER.makeObservableSubject();
        $configWidth =  $('<label>Width</label>').appendTo(that.configBody);
        that.configWidth = $('<input type="text" name="width">').appendTo(that.configBody);
        that.configWidth.val(parseInt(options.width));
        
        that.configWidth.focusout(function(){                                                                                 /////////  Изменить ширину слайдера
            
            that.newWidth = options.width; 
            
            
            that.configWidthChangedSubject.notifyObservers();
        });
        
        this.configStepChangedSubject = SLIDER.makeObservableSubject();
        $configStep =  $('<label>Step</label>').appendTo(that.configBody);
        that.configStep = $('<input type="text" name="step">').appendTo(that.configBody);
        that.configStep.val(options.step);
        that.configStep.focusout(function(){                                                                                 /////////  Изменить шаг
            options.step =  that.configStep.val(); 
            that.configStepChangedSubject.notifyObservers();
        });

        this.configMinValueChangedSubject = SLIDER.makeObservableSubject();
        $configMinValue =  $('<label>MinValue</label>').appendTo(that.configBody);
        that.configMinValue = $('<input type="text" name="MinValue">').appendTo(that.configBody);
        that.configMinValue.val(options.minValue);
        that.configMinValue.focusout(function(){                                                                                 /////////  Изменить минимальное значение
            options.minValue =  parseInt(that.configMinValue.val()); 
            that.configMinValueChangedSubject.notifyObservers();
        });

        this.configMaxValueChangedSubject = SLIDER.makeObservableSubject();
        $configMaxValue =  $('<label>MaxValue</label>').appendTo(that.configBody);
        that.configMaxValue = $('<input type="text" name="MaxValue">').appendTo(that.configBody);
        that.configMaxValue.val(options.maxValue);
        that.configMaxValue.focusout(function(){                                                                                 /////////  Изменить максимальное значение
            options.maxValue =  that.configMaxValue.val(); 
            that.configMaxValueChangedSubject.notifyObservers();
        });

        this.configPopupChangedSubject = SLIDER.makeObservableSubject();
        that.configPopup = $('<button name="popup">Popup</button>').appendTo(that.configBody);
        that.configPopup.click(function(){                                                                                 /////////  Вкл/Выкл Подсказку
            options.popup = !options.popup;
            that.configPopupChangedSubject.notifyObservers();
        });

        this.configRangeChangedSubject = SLIDER.makeObservableSubject();
        that.configRange = $('<button name="range">Range</button>').appendTo(that.configBody);
        that.configRange.click(function(){                                                                                 /////////  Одиночное значение/диапазон
            options.range = !options.range;
            that.newRange = options.range;
            that.configRangeChangedSubject.notifyObservers();
        });

        this.configInputChangedSubject = SLIDER.makeObservableSubject();
        that.configInput = $('<button name="input">Input</button>').appendTo(that.configBody);
        that.configInput.click(function(){                                                                                 /////////  Вкл/Выкл Инпут
            options.input = !options.input;
            that.newInput = options.input;
            that.configInputChangedSubject.notifyObservers();
        });

        this.configVerticalChangedSubject = SLIDER.makeObservableSubject();
        that.configVertical = $('<button name="vertical">Vertical</button>').appendTo(that.configBody);
        that.configVertical.click(function(){                                                                                 /////////  Вертикальный / горизонтальный вид
            options.vertical = !options.vertical;
            that.newVertical = options.vertical;
            that.configVerticalChangedSubject.notifyObservers();
        });
        
        this.configScaleChangedSubject = SLIDER.makeObservableSubject();
        that.configScale = $('<button name="scale">Scale</button>').appendTo(that.configBody);
        that.configScale.click(function(){                                                                                 /////////  Вкл/Выкл шкалу значений
            options.scale = !options.scale;
            that.newScale = options.scale;
            that.configScaleChangedSubject.notifyObservers();
        });

        this.configProgressChangedSubject = SLIDER.makeObservableSubject();
        that.configScale = $('<button name="progress">Progress Bar</button>').appendTo(that.configBody);
        that.configScale.click(function(){                                                                                 /////////  Вкл/Выкл прогресс бар
            options.progress = !options.progress;
            that.newProgress = options.progress;
            that.configProgressChangedSubject.notifyObservers();
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
        scale: true,
        progress: true,
        config: false
    };

   
})(jQuery);
