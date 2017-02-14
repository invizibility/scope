var snow = snow || {};
/*
 * svg axes have response rect and multi regions
 *    dependent : axis.js and brush.js
 */
(function(S,d3){
  S.axes = function() {
    var height = 1000
    var width = 800
    var gap = 20
    var regions = [{"chr":"chr1","start":100,"end":10000},{"chr":"chr2","start":10000,"end":30000}]
    var chart = function(selection){
      var svg = selection
      var dispatch = d3.dispatch("new")
      var length = 0;
      regions.forEach(function(d){
        length += d.end-d.start || d[1] - d[0]
      })
      var rangeWidth = width - gap * (regions.length - 1)
      var offset = 0;
      var scales = []
      var axes = []
      regions.forEach(function(d,i){
        console.log(i)
        var l = (d.end-d.start) || (d[1]-d[0])
        var w = l*rangeWidth/length
        var scale = d3.scaleLinear().domain([d.start||d[0],d.end||d[1]]).range([offset,offset+w])
        scales.push(scale)
        offset += (w+gap)
        axes.push(S.axis().x(0).y(width/2).scale(scale))
        svg.call(axes[i])
      })
    for (var i=0;i<regions.length;i++) {
      for(var j=i+1;j<regions.length;j++) {
        //shoulde be called in a function
        var xdomain = scales[i].domain()
        var xrange = [ 0 , scales[i].range()[1]/Math.SQRT2 - scales[i].range()[0]/Math.SQRT2 ] //TODO FIX more than two regions
        var ydomain = [scales[j].domain()[1],scales[j].domain()[0]]
        var yrange = [0, scales[j].range()[1]/Math.SQRT2 - scales[j].range()[0]/Math.SQRT2]
        var xscale = d3.scaleLinear().domain(xdomain).range(xrange)
        var yscale = d3.scaleLinear().domain(ydomain).range(yrange)
        var b = S.brush()
            .x(width/2) //TODO THIS FOR MULTI
            .y(0)
            .theta(Math.PI / 4)
            .on("brush", function(d) {
                console.log("brush", d)
                dispatch.call("new", this, d)
            })
            .on("click", function(d) {
                console.log("click brush")
            })
            .xscale(xscale)
            .yscale(yscale)
        selection.call(b)
      }
    }

      /*
      var scale1 = d3.scaleLinear().domain([]).range([0, 200])
      var xscale = d3.scaleLinear().domain([0, 200]).range([0, 200 / Math.SQRT2])
      var scale2 = d3.scaleLinear().domain([100, 400]).range([0, 300])
      var yscale = d3.scaleLinear().domain([400, 100]).range([0, 300 / Math.SQRT2])
      var b = S.brush()
          .x(250)
          .y(0)
          .theta(Math.PI / 4)
          .on("brush", function(d) {
              console.log("brush", d)
              dispatch.call("new", this, d)
          })
          .on("click", function(d) {
              console.log("click brush")
          })
          .xscale(xscale)
          .yscale(yscale)

      var svg = selection
      var axis1 = S.axis().x(0).y(250).scale(scale1)
      var axis2 = S.axis().x(200).y(250).scale(scale2)
      svg.call(axis1)
      svg.call(axis2)
      svg.call(b)
      */
      dispatch.on("new", function(d) {
          console.log("axes length",axes.length)
          console.log(d)
          axes[1].response({
              "start": d[0][1],
              "end": d[1][1]
          })
          axes[0].response({
              "start": d[0][0],
              "end": d[1][0]
          })
      })
    }


    chart.regions = function(_) { return arguments.length ? (regions= _, chart) : regions; }
    chart.width = function(_) { return arguments.length ? (width= _, chart) : width; }
    chart.height = function(_) { return arguments.length ? (height= _, chart) : height; }
    return chart
  }
}(snow,d3))
