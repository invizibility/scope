import addPanelTo from "./tools/addPanelTo"
/*
 * region , brush ,update monitor
 *
 */
export default function() {
  var regions;
  var brushs; // local use?
  var listeners = d3.dispatch("brush","update") //sent message out, not use in this demo now.
  var dispatch = d3.dispatch("brush","update") //communicate in chart
  var chart = function(selection) {
      var p = addPanelTo(selection)
      p.head.html("demo brush regions")
      p.body.append("label").text("brush")
      var b = p.body.append("textArea")
      p.body.append("label").text("update")
      var r = p.body.append("textArea")
      dispatch.on("brush.chart",function(d){
        b.html(JSON.stringify(d))
      })
      dispatch.on("update.chart",function(d){
        r.html(JSON.stringify(d))
      })
  }
  dispatch.on("brush.main",function(d){
    brushs = d;
  })
  dispatch.on("update.main",function(d){
    regions = d;
  })
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
  return chart
}
