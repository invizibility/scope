import {
  totalLength,
  overlap
} from "./funcs"

export default {
  Get: function (URI, callback) {
    var config = {}
    var ready = function (error, results) {
      config.URI = URI
      config.trackIds = results[0]
      callback(config)
    }
    d3_queue.queue(2)
      .defer(d3.json, URI + "/list")
      .awaitAll(ready);
  },
  canvas: function () {
    var id = "gene" //TODO
    var pos = 0 //for response rect TODO remove this limitation (change to id or get the response var)
    var height = 20
    var x = 0
    var y = 0
    var coord
    var regions
    var el
    var ctx
    var URI = ""
    var _render_ = function (error, results) {
      ctx.fillStyle = "grey"
      ctx.fillRect(0,0,coord.width(),height)
      results.forEach(function (d) {
        //onsole.log(d)
        var lines = d.split("\n")
        lines.forEach(function (d) {
          var t = d.split("\t")
          var a = {
            "chr": t[0],
            "start": parseInt(t[1]),
            "end": parseInt(t[2]),
            "name": t[3]
          }
          var xs = coord(a)
          //console.log(a,x)
          //TODO console.log(coord(a))
          ctx.fillStyle = "blue"
          xs.forEach(function(o){
            var width = o.l > 1 ? o.l : 1;
            ctx.fillRect(x + o.x, y, width, height)
          })

        })
      })
    }
    var render = function () {
      /* NOT JSON BUT BED */
      var q = d3_queue.queue(2)
      regions.forEach(function (d) {
        q.defer(d3.text, URI + "/" + id + "/get/" + d.chr + ":" + d.start + "-" + d.end)
      })
      q.awaitAll(_render_)
    }
    var chart = function (selection) {
      el = selection //canvas?
      ctx = el.node().getContext("2d")
      render();
    }
    chart.x = function (_) {
      return arguments.length ? (x = _, chart) : x;
    }
    chart.y = function (_) {
      return arguments.length ? (y = _, chart) : y;
    }
    chart.height = function (_) {
      return arguments.length ? (height = _, chart) : height;
    }
    chart.URI = function (_) {
      return arguments.length ? (URI = _, chart) : URI;
    }
    chart.coord = function (_) {
      return arguments.length ? (coord = _, chart) : coord;
    }
    chart.regions = function (_) {
      return arguments.length ? (regions = _, chart) : regions;
    }
    chart.id = function (_) {
      return arguments.length ? (id = _, chart) : id;
    }
    return chart
  }

}
