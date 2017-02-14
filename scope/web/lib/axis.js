var snow = snow || {};
/*
 * svg axis have response rect? multi regions?
 *
 */
(function(S,d3){
  S.axis = function(){
    //var dispatcher = d3.dispatch(chart,"")
    var scale = d3.scaleLinear().domain([0,1000]).range([0,500])
    var el,rect;
    var x=0,y=0;
    var height = 50;
    var chart = function(selection){
        var axisX = d3.axisBottom(scale)
        el = selection.append("g")
             .attr("transform","translate("+x+","+y+")")
        rect = el.append("rect").attr("x",0).attr("y",0).attr("height",height).attr("width",0)
              .attr("fill","black")
              .attr("opacity",0.2)
        el.call(axisX)
    }
    var response = function(e) {
      var x0 = scale.invert(e.start) || scale.invert(e[0]) || 0
      var x1 = scale.invert(e.end) || scale.invert(e[1]) || 0
      console.log(x0,x1)
      rect.attr("x",Math.min(x0,x1)).attr("width",Math.abs(x0-x1))
    }
    chart.response = function (e) {
        response(e)
    }
   /*
    var listeners = d3.dispatch(chart, "start","brush","end","light")
    chart.on = function(){
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? chart : value;
    }
   */
    chart.scale = function(_) { return arguments.length ? (scale= _, chart) : scale; }
    chart.x = function(_) { return arguments.length ? (x= _, chart) : x; }
    chart.y = function(_) { return arguments.length ? (y= _, chart) : y; }
    return chart
  }
  S.axes = function(){
    //TODO
  }
}(snow,d3))
