import {
  totalLength,
  overlap
} from "./funcs"
import trackManager from "./trackManager"
import shapeGene from "../shape/gene"

function parseInts(s) {
  var a = []
  s.split(",").forEach(function (d) {
    a.push(parseInt(d))
  })
  return a;
}

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
    var height = 12
    var gap = 3
    var x = 0
    var y = 10
    var coord
    var regions
    var el
    var trackM
    var ctx
    var URI = ""
    var _render_ = function (error, results) {
      ctx.fillStyle = "grey"
      //ctx.fillRect(x, y, coord.width(), height)
      results.forEach(function (d) {
        //onsole.log(d)
        var lines = d.split("\n")
        lines.forEach(function (d) {
          var t = d.split("\t")
          var a = {
            "chr": t[0],
            "start": parseInt(t[1]),
            "end": parseInt(t[2])
          }
          if (t.length >= 6) {
            a["name"] = t[3]
            a["score"] = parseInt(t[4])
            a["strand"] = t[5]
          }
          if (t.length >= 12) {
            a["thickStart"] = parseInt(t[6])
            a["thickEnd"] = parseInt(t[7])
            a["itemRgb"] = t[8]
            a["blockCount"] = parseInt(t[9])
            a["blockSizes"] = parseInts(t[10])
            a["blockStarts"] = parseInts(t[11])
          }


          var xs = coord(a)
          //console.log(a,x)
          //TODO console.log(coord(a))
          ctx.fillStyle = "blue"
          xs.forEach(function (o, i) {
            if (o.f) {
              var width = o.l > 1 ? o.l : 1;
              var yi = trackM.AssignTrack(a)
              //TODO ctx.fillRect(x + o.x, y + yi * (height+gap), width, height)

              ctx.translate(x + o.x, y + yi.i * (height + gap))
              shapeGene().width(width).label(!yi.c).context(ctx)(a)
              ctx.translate(-x - o.x, -y - yi.i * (height + gap))

            } else {
              ctx.fillStyle = "red" //TODO partial overlap problem.
              ctx.fillRect(x + o.x, y + yi * (height + gap), width, height)
            }

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
      trackM = trackManager().coord(coord)
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
