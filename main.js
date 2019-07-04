$(document).ready(function() {
    $(".1").MySlider(
        {
            range: true,
            startPosition: [50, 330],
            popup: true,
            input: false,
            step: 30,
            minValue: 0,
            maxValue: 330,
            progress: true,
            config: true
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
            range:true,
            progress: true,
            config: true
        });
    $(".3").MySlider(
        {
            startPosition: [50, 330],
            popup: true,
            input: false,
            step: 30,
            minValue: 0,
            maxValue: 330,
            progress: true,
            config:true
        });
});