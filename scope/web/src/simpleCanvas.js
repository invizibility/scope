
export default function() {
  var regions;
  var brushs; // local use?
  var listeners = d3.dispatch("brush","update") //sent message out
  var dispatch = d3.dispatch("brush","update") //communicate in chart
  var canvas,svg,div
  var x,y,rotate,xscale,yscale
  var width,height
  var bgcolor = "#EED"

  var chart = function(selection) {
      //canvas = selection.select("canvas")
      dispatch.on("brush.chart",function(d){
        //b.html(JSON.stringify(d))
      })
      dispatch.on("update.chart",function(d){
        //r.html(JSON.stringify(d))
      })
  }
  dispatch.on("brush.main",function(d){
    brushs = d;
  })
  dispatch.on("update.main",function(d){
    regions = d;
  })
  chart.canvas = function(_) { return arguments.length ? (canvas= _, chart) : canvas; }
  chart.div = function(_) { return arguments.length ? (div= _, chart) : div; }

  chart.x = function(_) { return arguments.length ? (x= _, chart) : x; }
  chart.y = function(_) { return arguments.length ? (y= _, chart) : y; }
  chart.rotate = function(_) { return arguments.length ? (rotate= _, chart) : rotate; }
  chart.brush = function(_){        //receive brush message
    dispatch.call("brush", this, _)
  }
  chart.update = function(_) {      //receive update message
    dispatch.call("update", this , _)
  }
  chart.on = function () {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? chart : value;
  };
  chart.regions = function(_) { return arguments.length ? (regions= _, chart) : regions; }
  chart.width = function(_) { return arguments.length ? (width= _, chart) : width; }
  chart.height = function(_) { return arguments.length ? (height= _, chart) : height; }
  chart.bgcolor = function(_) { return arguments.length ? (bgcolor= _, chart) : bgcolor; }
  return chart
}
