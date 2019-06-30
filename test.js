

var mousePosition ={};
var getMousePosition = {};
var sliderLeft,
    sliderTop;

var assert = require('chai').assert;

getMousePosition = function(){
    return mousePosition;
};
getMousePositionRelativeToSlider = function(){
    newMousePositionX = mousePosition.x - sliderLeft;
    newMousePositionY = mousePosition.y - sliderTop;
    return {x: newMousePositionX, y: newMousePositionY};
};

getPercentOfSlider = function(newMousePosition, sliderWidth){
    getMousePosition();
    getMousePositionRelativeToSlider();
    if(sliderWidth){
        newMousePosition = Math.min(Math.max(0, newMousePosition), sliderWidth);
        return Math.round((newMousePosition/sliderWidth)*100);
    }
    else {
        throw new Error("slider width shouldn't be 0");
    }
};

getHandlerPositionWithRange = function(minValue, maxValue, percentOfSlider){
    return ((maxValue-minValue)*(percentOfSlider/100))+minValue;
};

getHandlerPositionWithStep = function(handlerPosition, step){
    return (Math.round(handlerPosition/step))*step;
};

getHandlerPositionToSlider = function(HandlerPositionWithStep, minValue, maxValue, sliderWidth){
    handlerPositionToSlider = sliderWidth*((HandlerPositionWithStep - minValue) / (maxValue - minValue)); 
    return  handlerPositionToSlider;
};


describe("getMousePosition", function(){

    it("является ли объектом", function(){
        assert.typeOf(getMousePosition(), 'object');
    });

});

describe("Mouse position relative to slider", function(){
    it("является ли объектом", function(){
        assert.typeOf(getMousePositionRelativeToSlider(), 'object');
    });
});

describe("Mouse position in percent of entire slider", function(){
    it("сколько процентов", function(){
        assert.equal(getPercentOfSlider(50, 100), 50);
    });
});

describe("Handler position with min and max values", function(){
    it("позиция ползунка относительно нового диапазона, рассчитанная из процента", function(){
        assert.equal(getHandlerPositionWithRange(0, 200, 50), 100);
    });
});

describe("Handler position with step", function(){
    it("позиция ползунка, рассчитанная с учетом заданного шага", function(){
        assert.equal(getHandlerPositionWithStep(330, 50), 350);
    });
});

describe("Handler position relative to slider", function(){
    it("позиция ползунка относительно ширины слайдера, рассчитанная из старого диапазона", function(){
        assert.equal(getHandlerPositionToSlider(250, 0, 500, 300), 150);
    });
});

