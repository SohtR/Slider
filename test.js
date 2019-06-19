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

describe("Handler position with step", function(){
    it("позиция ползунка, рассчитанная с учетом заданного шага", function(){
        assert.equal(model.getHandlerPositionWithStep(330, 50), 350);
    });
});

describe("Handler position relative to slider", function(){
    it("позиция ползунка относительно ширины слайдера, рассчитанная из старого диапазона", function(){
        assert.equal(model.getHandlerPositionToSlider(250, 0, 500, 300), 150);
    });
});