var view = new SLIDER.View($('.container').appendTo($(".container")));
var model = new SLIDER.Model();
var controller = new SLIDER.Controller(model, view);


describe("getMousePosition", function(){
    it("является ли объектом", function(){
        assert.typeOf(model.getMousePosition(), 'object');
    });

});

describe("Mouse position relative to slider", function(){
    it("является ли объектом", function(){
        assert.typeOf(model.getMousePositionRelativeToSlider(), 'object');
    });
});

describe("Mouse position in percent of entire slider", function(){
    it("сколько процентов", function(){
        assert.equal(model.getPercentOfSlider(50, 100), 50);
    });
});

describe("Handler position with min and max values", function(){
    it("позиция ползунка относительно нового диапазона, рассчитанная из процента", function(){
        assert.equal(model.getHandlerPositionWithRange(0, 200, 50), 100);
    });

});