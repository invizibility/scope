var snow = snow || {};
/*
 * svg axes have response rect and multi regions
 *    dependent : axis.js and brush.js
 */
(function (S, d3) {
    S.symbolTriangle = {
        draw: function (context, size) {
            context.moveTo(0, 0)
            context.lineTo(size, 0);
            context.lineTo(size / 2, -size / 2);
            context.closePath();
        }
    }
    S.triangleAxis = function() {
      var width
      var scale
      var x
      var y
      var color = "aliceblue"
      var G
      var R


      var chart = function(selection){
         G = selection.append("g").attr("transform", "translate(" + x + "," + y + ")") //TODO for select and merge
         G.append("path")
            .attr("d", d3.symbol().type(S.symbolTriangle).size(width))
            .style("fill", color )
            .style("opacity", 0.5)
         R = G.append("g")
      }
      chart.response = function(e) {
        var x0 = scale(e.start) || scale(e[0]) || 0
        var x1 = scale(e.end) || scale(e[1]) || 0
        console.log(x0,x1)
        R.attr("transform","translate("+(x0-x)+","+0+")"); //TODO.
        var h = R.selectAll("path").data([{"x":x0,"width":x1-x0}])
        h.enter().append("path")
        .merge(h)
        .attr("d",d3.symbol().type(S.symbolTriangle).size(function(d){return d.width}))
        .style("fill","black")
        .style("opacity",0.2)
      }
      chart.color = function(_) { return arguments.length ? (color= _, chart) : color; }
      chart.width = function(_) { return arguments.length ? (width= _, chart) : width; }
      chart.scale = function(_) { return arguments.length ? (scale= _, chart) : scale; }
      chart.x = function(_) { return arguments.length ? (x= _, chart) : x; }
      chart.y = function(_) { return arguments.length ? (y= _, chart) : y; }
      return chart
    }
    S.axes = function () {
        var height = 1000
        var width = 800
        var gap = 20
        var regions = [{
            "chr": "chr1",
            "start": 100,
            "end": 10000
        }, {
            "chr": "chr2",
            "start": 10000,
            "end": 30000
        }]
        var render = function(regions) {

        }

        var chart = function (selection) {
            var svg = selection
            var buttonG = selection.append("g")

            var btns = buttonG.selectAll(".btn").data([d3.symbolCross,d3.symbolCross])
            btns.enter().append("g").classed("btn",true)
            .merge(buttonG)
            .attr("transform",function(d,i){
              console.log(d)
              return "translate("+(i*10+10)+",10)"
            })
              .append("path")
              .attr("d",d3.symbol().type(d3.symbolCross))
              .style("fill", "black")
              .style("opacity", 0.7)
              .on("click",function(d){
                console.log("TODO zoom in")
               })

            var self = this;
            var length = 0;
            regions.forEach(function (d) {
                length += d.end - d.start || d[1] - d[0]
            })
            var rangeWidth = width - gap * (regions.length - 1)
            var offset = 0;
            var scales = []
            var axes = []
            var tAxes =[]
            var buffer = [];
            regions.forEach(function (d, i) {
                console.log(i)
                var l = (d.end - d.start) || (d[1] - d[0])
                var w = l * rangeWidth / length
                var scale = d3.scaleLinear().domain([d.start || d[0], d.end || d[1]]).range([offset, offset + w])
                scales.push(scale)
                tAxes.push(S.triangleAxis().x(offset).y(width/2).width(w).scale(scale))
                svg.call(tAxes[i])
                offset += (w + gap)
                axes.push(S.axis().x(0).y(width / 2).scale(scale))
                svg.call(axes[i])

                ;
            })
            for (var i = 0; i < regions.length; i++) {
                for (var j = i + 1; j < regions.length; j++) {
                    //shoulde be called in a function
                    var xdomain = scales[i].domain()
                    var xrange = [0, scales[i].range()[1] / Math.SQRT2 - scales[i].range()[0] / Math.SQRT2] //TODO FIX more than two regions
                    var ydomain = [scales[j].domain()[1], scales[j].domain()[0]]
                    var yrange = [0, scales[j].range()[1] / Math.SQRT2 - scales[j].range()[0] / Math.SQRT2]
                    var xscale = d3.scaleLinear().domain(xdomain).range(xrange)
                    var yscale = d3.scaleLinear().domain(ydomain).range(yrange)
                    var b = S.brush()
                        .x(width / 2) //TODO THIS FOR MULTI
                        .y(0)
                        .theta(Math.PI / 4)
                        .on("brush", function (d) {
                            buffer = d;
                            listeners.call("lbrush", this, d)
                        })
                        .on("click", function (e) {
                            //console.log("submit",d,buffer)
                            var d = buffer
                            regions[0].start = Math.round(d[0][0])
                            regions[0].end = Math.round(d[1][0])
                            regions[1].start = Math.round(d[0][1])
                            regions[1].end = Math.round(d[1][1])

                            listeners.call("submit",this,regions)
                        })
                        .xscale(xscale)
                        .yscale(yscale)
                    selection.call(b)
                }
            }
            listeners.on("lbrush", function (d) {
                axes[1].response({
                    "start": d[0][1],
                    "end": d[1][1]
                })
                tAxes[1].response({
                    "start": d[0][1],
                    "end": d[1][1]
                })
                axes[0].response({
                    "start": d[0][0],
                    "end": d[1][0]
                })
                tAxes[0].response({
                    "start": d[0][0],
                    "end": d[1][0]
                })
                var r = [
                  {"chr":regions[0].chr,"start":Math.round(d[0][0]),"end":Math.round(d[1][0])},
                  {"chr":regions[1].chr,"start":Math.round(d[0][1]),"end":Math.round(d[1][1])}
                ]
                console.log("calling brush",r)
                listeners.call("brush",this,r)
            })
        }
        var listeners = d3.dispatch(chart,"brush","submit","lbrush")

        chart.regions = function (_) {
            return arguments.length ? (regions = _, chart) : regions;
        }
        chart.width = function (_) {
            return arguments.length ? (width = _, chart) : width;
        }
        chart.height = function (_) {
            return arguments.length ? (height = _, chart) : height;
        }
        chart.on = function() {
         var value = listeners.on.apply(listeners, arguments);
         return value === listeners ? chart : value;
        };
        return chart
    }
}(snow, d3))
