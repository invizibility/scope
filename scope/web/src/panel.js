export default function () {
    var width
    var height
    var panel, svg, canvas
    var listeners = d3.dispatch()
    var dispatch = d3.dispatch("update", "brush", "resize")
    var chart = function (main) {
        panel = main.append("div")
            .style("position", "relative")
            .style("width", width + "px")
            .style("height", height + "px")
        canvas = panel.append("canvas")
            .style("postion", "absolute")
            .attr("height", height)
            .attr("width", width)
        svg = panel.append("svg")
            .style("position", "absolute")
            .attr("height", height)
            .attr("width", width)
    }
    chare.resize = function (d) {
        panel.style("width", d.width + "px")
            .style("height", d.height + "px")
        canvas.attr("height", d.height)
            .attr("width", d.width)
        svg.attr("height", d.height)
            .attr("width", d.width)
        dispatch.call("resize", this, d)
    }
    chart.on = function () {
        var value = listeners.on.apply(listeners, arguments);
        return value === listeners ? chart : value;
    };
    chart.panel = function (_) {
        return arguments.length ? (panel = _, chart) : panel;
    }
    chart.svg = function (_) {
        return arguments.length ? (svg = _, chart) : svg;
    }
    chart.canvas = function (_) {
        return arguments.length ? (canvas = _, chart) : canvas;
    }
    chart.width = function (_) {
        return arguments.length ? (width = _, chart) : width;
    }
    chart.height = function (_) {
        return arguments.length ? (height = _, chart) : height;
    }
    return chart
}
