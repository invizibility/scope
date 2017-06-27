import canvasToolYAxis from "../canvastool/yaxis"
import canvasToolXAxis from "../canvastool/xaxis"
import {
  totalLength,
  overlap
} from "./funcs"

export default function () {
  var id = "default"
  var pos = 0 //for response rect TODO remove this limitation (change to id or get the response var)
  var height
  var width
  var regions
  var x
  var y
  var URI = ""
  var barHeight = 50
  var vertical = false
  var canvas
  var panel //canvas parent for add svg;
  var binsize
  var scale
  var respSvg
  var gap = 0 //TODO for gap axis
  var mode = 0 // "max" or "mean" { 0: mix (max,min,mean) , 1: mean, 2: max/min }
  var callback = function (d) {
    console.log("callback", d)
  }

  /* is this a really a static function? */
  var renderRegion = function (ctx, xoffset, yoffset, region, xscale, yscale, color, ncolor) {
    //  var ctx = canvas.node().getContext("2d");
    //console.log(mat, mat.length)
    var area = d3.area()
                 .x(function(d){return xoffset + xscale(d.x)})
                 .y1(function(d){
                   return yoffset + (barHeight - yscale(d.y))
                 })
                 .y0(  yoffset + (barHeight - yscale(0)))
                 .context(ctx)
    var values = [{

        "x": xscale.domain()[0],
        "y": 0

    }]

    ctx.fillStyle = color
    for (var i = 0; i < region.length; i++) {
      var r = xscale.range();
      if (isNaN(region[i].From) || isNaN(region[i].To)) {
        continue; //add handle large width bug
      }
      values.push({"x":(region[i].From+region[i].To)/2,"y":region[i].Sum/(region[i].Valid || region[i].Value)})
    }
    values.push(
      {
        "x":xscale.domain()[1],
        "y":0
      }
    )
    ctx.translate(x,y)
    ctx.beginPath();
    area(values)
    ctx.closePath();
    ctx.fill();
    ctx.translate(-x,-y)
  }
  //TODO get a simple rotated version.




  var xscales, xoffsets, widths;



  var response = function (e) {
    var rdata = []
    //console.log(e,regions)
    regions.forEach(function (r, i) {
      e.forEach(function (d, j) {
        if (overlap(r, d)) {
          var x = xscales[i](d.start) + xoffsets[i]
          var l = xscales[i](d.end) + xoffsets[i] - x
          rdata.push({
            "x": x,
            "l": l
          })
        }
      })
    })
    //console.log("rdata",rdata)
    var r1 = respSvg.selectAll("rect").data(rdata)
    r1.exit().remove()
    r1.enter()
      .append("rect")
      .merge(r1)

    r1.attr("x", function (d) {
        console.log("rx", d.x)
        return d.x
      })
      .attr("y", 0)
      .attr("height", barHeight)
      .attr("width", function (d) {
        return d.l
      })
      .attr("fill", function (d) {
        return "#777"
      })
      .attr("opacity", 0.2)

  }
  var _render_ = function (error, results) {
    var min = Infinity;
    var max = -Infinity;
    xscales = []
    xoffsets = []
    widths = []
    var yoffset = 0
    var offset = 0
    var totalLen = totalLength(regions)
    var effectWidth = width - (regions.length - 1) * gap
    regions.forEach(function (d) {
      var w = (+(d.end) - (+d.start)) * effectWidth / totalLen
      var scale = d3.scaleLinear().domain([+(d.start), +(d.end)]).range([0, w])
      xscales.push(scale)
      xoffsets.push(offset)
      offset += w + gap
      widths.push(w)
    })

    results.forEach(function (arr) {
      if (mode == 0 || mode == 2) {
        arr.forEach(function (d) {
          var v = d.Max || d.Value
          var vmin = d.Min || d.Value
          if (v > max) {
            max = v
          }
          if (vmin < min) {
            min = vmin
          }
        })
      } else {
        arr.forEach(function (d) {
          var v = d.Sum / d.Valid || d.Value
          if (v > max) {
            max = v
          }
          if (v < min) {
            min = v
          }
        })
      }

    })
    var yscale = d3.scaleLinear().domain([Math.min(0, min), Math.max(max, 0)]).range([0, barHeight]) //TODO?
    scale = yscale;
    var axisScale = d3.scaleLinear().domain([min, max]).range([barHeight, 0])
    var color = d3.scaleOrdinal(d3.schemeCategory10); // TODO here.
    var background = "#FFF"
    if (vertical) {
      //renderRespVertical(); //TODO
      var ctx = canvas.node().getContext("2d");
      ctx.fillStyle = background
      ctx.fillRect(x, y, barHeight, width)
      results.forEach(function (region, i) {
        renderRegionVertical(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, "#333", "#666")
      })
      canvasToolXAxis(ctx, axisScale, x, y + width, barHeight, id)
    } else {
      //renderResp(); //TODO
      var ctx = canvas.node().getContext("2d");
      ctx.fillStyle = background
      ctx.fillRect(x, y, width, barHeight)
      results.forEach(function (region, i) {
        renderRegion(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, "#333", "#666")
      })

      canvasToolYAxis(ctx, axisScale, x + width, y, barHeight, undefined)

      ctx.fillText(id, x + 10, y + 10);
    }
    callback({
      "min": min,
      "max": max
    })
  }
  var rawdata = false;
  var _render = function () {
    var q = d3_queue.queue(2)
    if (binsize != -1) {
      rawdata = false;
      if (binsize == undefined) {
        binsize = 1
      }
      regions.forEach(function (d) {
        q.defer(d3.json, URI + "/getbin/" + id + "/" + d.chr + ":" + d.start + "-" + d.end + "/" + binsize)
      })
    } else {
      rawdata = true;
      regions.forEach(function (d) {
        q.defer(d3.json, URI + "/get/" + id + "/" + d.chr + ":" + d.start + "-" + d.end)
      })
    }
    q.awaitAll(_render_)
  }
  var render = function () {
    var length = totalLength(regions)
    var url = URI + "/binsize/" + id + "/" + length + "/" + width
    console.log("URL", url)
    d3.json(url, function (d) {
      binsize = d;
      console.log("BINSIZE", binsize)
      _render();
    })
  }
  var chart = function (selection) { //selection is canvas;
    canvas = selection;
    panel.selectAll(".resp" + "_" + pos).remove(); //TODO
    if (vertical) {
      respSvg = panel.append("svg")
        .classed("resp_" + pos, true)
        .style("postion", "absolute")
        .style("top", y)
        .style("left", x)
        .attr("width", barHeight)
        .attr("height", width)
        .append("g")
        .attr("transform", "translate(" + barHeight + "," + 0 + ") rotate(90)")
    } else {
      respSvg = panel.append("svg")
        .classed("resp_" + pos, true)
        .style("postion", "absolute")
        .style("top", y)
        .style("left", x)
        .attr("width", width)
        .attr("height", barHeight)
    }


    render();
  }
  var modes = ["mix", "mean", "max"]
  chart.mode = function (_) {
    if (!arguments.length) {
      return modes[mode]
    } else {
      mode = 0
      if (_ == "max" || _ == 2) {
        mode = 2
      }
      if (_ == "mean" || _ == 1) {
        mode = 1
      }
      return chart
    }
  }
  chart.callback = function (_) {
    return arguments.length ? (callback = _, chart) : callback;
  }
  chart.panel = function (_) {
    return arguments.length ? (panel = _, chart) : panel;
  }
  chart.x = function (_) {
    return arguments.length ? (x = _, chart) : x;
  }
  chart.y = function (_) {
    return arguments.length ? (y = _, chart) : y;
  }
  chart.regions = function (_) {
    return arguments.length ? (regions = _, chart) : regions;
  }
  chart.width = function (_) {
    return arguments.length ? (width = _, chart) : width;
  }
  chart.height = function (_) {
    return arguments.length ? (height = _, chart) : height;
  }
  chart.URI = function (_) {
    return arguments.length ? (URI = _, chart) : URI;
  }
  chart.barHeight = function (_) {
    return arguments.length ? (barHeight = _, chart) : barHeight;
  }
  chart.response = function (e) {
    response(e)
  }
  chart.id = function (_) {
    return arguments.length ? (id = _, chart) : id;
  }
  chart.vertical = function (_) {
    return arguments.length ? (vertical = _, chart) : vertical;
  }
  chart.pos = function (_) {
    return arguments.length ? (pos = _, chart) : pos;
  }
  chart.scale = function (_) {
    return arguments.length ? (scale = _, chart) : scale;
  }
  chart.gap = function (_) {
    return arguments.length ? (gap = _, chart) : gap;
  }
  return chart
}
