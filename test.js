var view = new SLIDER.View($('.container').appendTo($(".container")));
var model = new SLIDER.Model();
var controller = new SLIDER.Controller(model, view);


describe("getMousePosition", function(){
    it("является ли объектом", function(){
        assert.typeOf(model.mousePosition, 'object');
    });

});

describe("Mouse position relative to slider", function(){
    it("является ли объектом", function(){
        assert.typeOf(model.mousePosition, 'object');
    });

});