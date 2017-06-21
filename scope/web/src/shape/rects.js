export default function() {
  var color = "grey"
  var context
  var buffer
  function chart(data){
    if (context == null) buffer = context = d3.path(); //only path works.
    data.forEach(function(d){
      console.log(context)
      context.fillStyle = d.color || color
      context.rect(d.x,d.y,d.width,d.height)
      if (context.fill) {
        context.fill()
      }
      context.closePath();
    })
    if (buffer) return buffer+"";
  }
  chart.color = function(_) { return arguments.length ? (color= _, chart) : color; }
  chart.context = function(_) { return arguments.length ? (context= _, chart) : context; }
  return chart
}
