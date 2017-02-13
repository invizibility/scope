var snow = snow || {};
(function(d3,S){
S.brush = function() {

   var x0, y0, x1, y1, xf, yf,width,height
   var xi = 0, yi = 0
   var x=0,y=0;
   var theta = Math.PI / 4
   var brush = function(selection) {
     selection.call(
       d3.drag()
       .on("start", dragstarted)
       .on("drag", dragged)
       .on("end", dragended)
     )
     var g = selection.append("g")
     var rect = g.append("rect").classed("brush",true).attr("opacity",0.2)
     rect.call(d3.drag().on("drag", move).on("start", start).on("end", end))
     function start(d) {
       d3.select(this).attr("stroke", "blue").attr("stroke-width", 2)
       xf = d3.event.x
       yf = d3.event.y
     }

     function move(d) {
       xi = d3.event.x + xi - xf
       yi = d3.event.y + yi - yf
       g.attr("transform", "translate(" + xi + "," + yi + ") rotate(" + theta / Math.PI * 180 + ")")
       listeners.call("brush", this, [[xi,yi],[xi+width,yi+height]]);
     }

     function end(d) {
       d3.select(this).attr("stroke-width", 0)
     }

     function rotate(d, theta) {
       return [Math.cos(theta) * d[0] + Math.sin(theta) * d[1], -Math.sin(theta) * d[0] + Math.cos(theta) * d[1]]
     }


     function dragstarted(d) {
       if (d3.event.defaultPrevented) return;
       x0 = d3.event.x
       y0 = d3.event.y
         //attr("transform","translate("+x0+","+y0+") rotate(45)")
       listeners.call("start", this, [x0,y0]);
     }

     function dragged(d) {
       if (d3.event.defaultPrevented) return;
       x1 = d3.event.x
       y1 = d3.event.y
       r0 = rotate([x0, y0], theta)
       r1 = rotate([x1, y1], theta)
       var p = [Math.min(r0[0], r1[0]), Math.min(r1[1], r0[1])]
       var a = rotate(p, -theta)
       xi = a[0]
       yi = a[1]
       width = Math.abs(r0[0] - r1[0])
       height = Math.abs(r0[1] - r1[1])
       g.attr("transform", "translate(" + a[0] + "," + a[1] + ") rotate(" + theta / Math.PI * 180 + ")")
       rect.attr("height", height).attr("width", width)
       listeners.call("brush", this, [[xi,yi],[xi+width,yi+height]]);
     }
     function dragended(d) {
       if (d3.event.defaultPrevented) return;
       listeners.call("end", this, [[xi,yi],[xi+width,yi+height]]);
     }
   }
   var listeners = d3.dispatch(brush, "start","brush","end")
   brush.extent = function() {
     return [[xi,yi],[xi+width,yi+height]]
   }
   brush.theta = function(_) { return arguments.length ? (theta= _, brush) : theta; }
   brush.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? brush : value;
   };
   return brush
 }

}(d3,snow))
