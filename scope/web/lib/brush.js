var snow = snow || {};
(function(d3,S){
S.brush = function() {
   var border  =[[0,0],[500,500]]//[x,y]
   var x0, y0, x1, y1, xf, yf,width,height
   var xi = 0, yi = 0
   var x=0,y=0; //x,y is the coord system start point?
   var theta = Math.PI / 4
   var xscale = d3.scaleLinear().range([0,500]).domain([0,500])
   var yscale = d3.scaleLinear().range([0,500]).domain([0,500])
   var brush = function(selection) {

     selection.call(
       d3.drag()
       .on("start", dragstarted)
       .on("drag", dragged)
       .on("end", dragended)
     )
     var G = selection.append("g").attr("transform", "translate("+x+","+y+") rotate(" + theta / Math.PI * 180 + ")")
     if (border!=undefined) {
       G.append("rect")
             .attr("x",border[0][0])
             .attr("y",border[0][1])
             .attr("width",border[1][0]-border[0][0])
             .attr("height",border[1][1]-border[0][1])
             .attr("fill","aliceblue")


     }
      var g = G.append("g")

     var rect = g.append("rect").classed("brush",true).attr("opacity",0.2)
     rect.call(d3.drag().on("drag", move).on("start", start)
       .on("end", end))
     rect.on("click",function(e){
       listeners.call("click")
     })
     var fix = function(x,y){
       var r = rotate([x, y], theta)
       r[0] = Math.max(border[0][0],Math.min(border[1][0]-width,r[0]))
       r[1] = Math.max(border[0][1],Math.min(border[1][1]-height,r[1]))
       var retv = rotate(r,-theta)
       return retv //TODO
     }
     function invert(d) {
      var lx1 = xscale.invert(d[0][0])
      var lx2 = xscale.invert(d[1][0])
      var ly1 = yscale.invert(d[0][1])
      var ly2 = yscale.invert(d[1][1])
      return [[Math.min(lx1,lx2),Math.min(ly1,ly2)],[Math.max(lx1,lx2),Math.max(ly1,ly2)]]
     }
     function start(d) {
       console.log("start move")
       d3.select(this).attr("stroke", "blue").attr("stroke-width", 2)
       xf = d3.event.x
       yf = d3.event.y
     }

     function move(d) {
       xi = d3.event.x + xi - xf
       yi = d3.event.y + yi - yf
       if (border!=undefined) {
         var r = fix(xi,yi)
         xi=r[0]
         yi=r[1]
       }
       var r = rotate([xi,yi],theta)
       //TODO fit the border for xi,yi???
       g.attr("transform", "translate(" + r[0] + "," + r[1] + ")")
       console.log(r,width,height,"start x,y")

       listeners.call("brush", this, invert([[r[0],r[1]],[r[0]+width,r[1]+height]]));
     }

     function end(d) {
       d3.select(this).attr("stroke-width", 0)
     }

     function rotate(d, theta) {
       return [Math.cos(theta) * d[0] + Math.sin(theta) * d[1], -Math.sin(theta) * d[0] + Math.cos(theta) * d[1]]
     }


     function dragstarted(d) {
       if (d3.event.defaultPrevented) return;
       x0 = d3.event.x - x
       y0 = d3.event.y - y
         //attr("transform","translate("+x0+","+y0+") rotate(45)")
       listeners.call("start", this, [x0,y0]);
     }

     function dragged(d) {
       if (d3.event.defaultPrevented) return;
       x1 = d3.event.x - x
       y1 = d3.event.y - y
       r0 = rotate([x0, y0], theta)
       r1 = rotate([x1, y1], theta)
       if (border != undefined) {
         r0[0] = Math.max(border[0][0],Math.min(r0[0],border[1][0]))
         r0[1] = Math.max(border[0][1],Math.min(r0[1],border[1][1]))
         r1[0] = Math.max(border[0][0],Math.min(r1[0],border[1][0]))
         r1[1] = Math.max(border[0][1],Math.min(r1[1],border[1][1]))
       }
       var p = [Math.min(r0[0], r1[0]), Math.min(r1[1], r0[1])]
       console.log("p",p)
       var a = rotate(p, -theta)
       xi = a[0]
       yi = a[1]
       width = Math.abs(r0[0] - r1[0])
       height = Math.abs(r0[1] - r1[1])
       g.attr("transform", "translate(" + p[0] + "," + p[1] + ")")
       rect.attr("height", height).attr("width", width)
       listeners.call("brush", this, invert([[p[0],p[1]],[p[0]+width,p[1]+height]]));
     }
     function dragended(d) {
       if (d3.event.defaultPrevented) return;
       //listeners.call("end", this, [[p[0],yi],[xi+width,yi+height]]);
     }
   }
   var listeners = d3.dispatch(brush, "start","brush","end","click")
   /* TO FIX
   brush.extent = function() {
     return [[xi,yi],[xi+width,yi+height]]
   }
   */
   brush.theta = function(_) { return arguments.length ? (theta= _, brush) : theta; }
   brush.border = function(_) { return arguments.length ? (border= _, xscale.range([border[0][0],border[1][0]]),yscale.range([border[1][0],border[1][1]]),brush) : border; }
   brush.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? brush : value;
   };
   brush.x = function(_) { return arguments.length ? (x= _, brush) : x; }
   brush.y = function(_) { return arguments.length ? (y= _, brush) : y; }
   brush.xdomain = function(_) {
     return arguments.length? (xscale.domain(_),brush):xscale.domain();
   }
   brush.ydomain = function(_) {
     return arguments.length? (yscale.domain(_),brush):yscale.domain();
   }
   brush.xscale = function(_) { return arguments.length ? (xscale= _, border[0][0]=xscale.range()[0],border[1][0]=xscale.range()[1],brush) : xscale; }
   brush.yscale = function(_) { return arguments.length ? (yscale= _, border[0][1]=yscale.range()[0],border[1][1]=yscale.range()[1],brush) : yscale; }
   return brush
 }

}(d3,snow))
