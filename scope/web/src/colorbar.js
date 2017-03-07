export default function() {
    var color1 = "#FFF"
    var color2 = "#F00"
    var width = 50
    var height = 10
    var x = 20
    var y = 20
    var chart = function (selection) { //selection is canvas;
        var ctx = selection.node().getContext("2d");
        var grd = ctx.createLinearGradient(x, y, x + width, y);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        ctx.fillStyle = grd;
        ctx.fillRect(x, y, width, height);
    }
    chart.width = function (_) {
        return arguments.length ? (width = _, chart) : width;
    }
    chart.height = function (_) {
        return arguments.length ? (height = _, chart) : height;
    }
    chart.x = function (_) {
        return arguments.length ? (x = _, chart) : x;
    }
    chart.y = function (_) {
        return arguments.length ? (y = _, chart) : y;
    }
    chart.color1 = function (_) {
        return arguments.length ? (color1 = _, chart) : color1;
    }
    chart.color2 = function (_) {
        return arguments.length ? (color2 = _, chart) : color2;
    }
    return chart
}
