var snow = snow || {};
snow.dataBigwig = snow.dataBigwig || {};
(function (B) {
    B.Get = function (URI, callback) {
        var config = {}
        var ready = function (error, results) {
            config.URI = URI
            config.trackIds = results[0]
            callback(config)
        }
        d3_queue.queue(2)
            .defer(d3.json, URI + "/list")
            .awaitAll(ready);
    }
    B.canvas = function () {
        var id = "default"
        var pos = 0 //for response rect
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


        var totalLength = function (regions) {
            var l = 0;
            regions.forEach(function (r, i) {
                l += (+r.end) - (+r.start)
            })
            return l
        }


        var renderRegion = function (ctx, xoffset, yoffset, region, xscale, yscale, color) {
            //  var ctx = canvas.node().getContext("2d");
            //console.log(mat, mat.length)

            for (var i = 0; i < region.length; i++) {
                ctx.fillStyle = color
                var r = xscale.range();
                if (isNaN(region[i].From) || isNaN(region[i].To)) {
                    continue; //add handle large width bug
                }
                var x1 = xscale(region[i].From)
                var x2 = xscale(region[i].To)
                if (x1<r[0]) {
                  x1=r[0]
                }
                if (x2 > r[1]) {
                  x2 = r[1]
                }
                var width = x2 - x1
                if (width > 100) {
                    console.log("debug region", region[i])
                } //debug
                var y1 = yscale(region[i].Max) //TODO
                var ym = yscale(region[i].Sum / region[i].Valid)
                var y0 = yscale(0);
                //var y1 = barHeight - height
                if (y0 < 0) {
                    ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - y1), width, y1 - 0);
                } else {
                    if (y1 > y0) {
                        ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - y1), width, y1 - y0);
                    } else {
                        ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - y0), width, y0 - y1);
                    }
                }
                ctx.fillStyle = "#111"
                ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - ym), width, 1)
            }
        }

        var renderRegionVertical = function (ctx, yoffset, xoffset, region, xscale, yscale, color) {
            for (var i = 0; i < region.length; i++) {
                ctx.fillStyle = color
                var r = xscale.range();
                if (isNaN(region[i].From) || isNaN(region[i].To)) {
                    continue; //add handle large width bug
                }
                var x1 = xscale(region[i].From)
                var x2 = xscale(region[i].To)
                if (x1<r[0]) {
                  x1=r[0]
                }
                if (x2 > r[1]) {
                  x2 = r[1]
                }
                var width = x2 - x1
                if (width > 100) {
                    console.log("debug region", region[i])
                } //debug
                var y1 = yscale(region[i].Max) //TODO
                var ym = yscale(region[i].Sum / region[i].Valid)
                var y0 = yscale(0);
                //var y1 = barHeight - height
                if (y0 < 0) {
                    ctx.fillRect( x + xoffset ,y + yoffset + x1, y1 -0 , width);
                } else {
                    if (y1 > y0) {
                        ctx.fillRect(x + xoffset + y0, y + yoffset + x1, y1- y0, width);
                    } else {
                        ctx.fillRect(x + xoffset + y1, y + yoffset + x1,  y0 - y1, width);
                    }
                }
                ctx.fillStyle = "#111"
                ctx.fillRect(x + xoffset + ym, y + yoffset + x1, 1,width)
            }
        }
        var xscales, xoffsets, widths;
        var renderResp = function () {
            //add trackId TODO
            var resp = panel.selectAll(".bwResp"+"_"+pos).data(regions)
            resp.enter().append("svg")
                .classed("bwResp"+"_"+pos, true)
                .merge(resp)
                .style("position", "absolute")
                .style("top", y)
                .style("left", function (d, i) {
                    return x + xoffsets[i]
                })
                .attr("width", function (d, i) {
                    return widths[i]
                })
                .attr("height", barHeight)
            resp.selectAll("rect").remove()
        }
        var renderRespVertical = function () { //TODO merge function to renderRes
            var resp = panel.selectAll(".bwResp"+"_"+pos).data(regions)
            resp.enter().append("svg")
                .classed("bwResp"+"_"+pos, true)
                .merge(resp)
                .style("position", "absolute")
                .style("left", x)
                .style("top", function (d, i) {
                    return y + xoffsets[i]
                })
                .attr("height", function (d, i) {
                    return widths[i]
                })
                .attr("width", barHeight)
            resp.selectAll("rect").remove()
        }
        var res = function (selection) {
            if (vertical) {
              selection.each(function (d, i) {
                  //console.log(d, i)
                  var x = xscales[i](d.start)
                  var l = xscales[i](d.end) - x
                  var rect = d3.select(this).selectAll("rect")
                      .data([{
                          "x": x,
                          "l": l
                      }])
                  rect
                      .enter()
                      .append("rect")
                      .merge(rect)
                      .attr("y", function (d) {
                          return d.x
                      })
                      .attr("x", 0)
                      .attr("width", barHeight)
                      .attr("height", function (d) {
                          return d.l
                      })
                      .attr("fill", function (d) {
                          return "#777"
                      })
                      .attr("opacity", 0.2)
              })

            }  else {
            selection.each(function (d, i) {
                console.log(d, i)
                var x = xscales[i](d.start)
                var l = xscales[i](d.end) - x
                var rect = d3.select(this).selectAll("rect")
                    .data([{
                        "x": x,
                        "l": l
                    }])
                rect
                    .enter()
                    .append("rect")
                    .merge(rect)
                    .attr("x", function (d) {
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
            })
          }
        }
        var response = function (e) {
            //console.log(e)
            panel.selectAll(".bwResp"+"_"+pos) //need to add trackId
                .data(e)
                .call(res)

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
            regions.forEach(function (d) {
                var w = (+(d.end) - (+d.start)) * width / totalLen
                var scale = d3.scaleLinear().domain([+(d.start), +(d.end)]).range([0, w])
                xscales.push(scale)
                xoffsets.push(offset)
                offset += w
                widths.push(w)
            })

            results.forEach(function (arr) {
                arr.forEach(function (d) {
                    if (d.Max > max) {
                        max = d.Max
                    }
                    if (d.Max < min) {
                        min = d.Max
                    }
                })
            })
            var yscale = d3.scaleLinear().domain([min, max]).range([0, barHeight])
            var color = d3.scaleOrdinal(d3.schemeCategory10);
            var background = "#EFE"
            if (vertical) {
              renderRespVertical();//TODO
              var ctx = canvas.node().getContext("2d");
              ctx.fillStyle = background
              ctx.fillRect(x, y, barHeight, width)
              results.forEach(function (region, i) {
                  renderRegionVertical(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, color(i))
              })
            } else {
              renderResp();
              var ctx = canvas.node().getContext("2d");
              ctx.fillStyle = background
              ctx.fillRect(x, y, width, barHeight)
              results.forEach(function (region, i) {
                  renderRegion(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, color(i))
              })
            }


        }
        var _render = function () {
            var q = d3_queue.queue(2)
            regions.forEach(function (d) {
                q.defer(d3.json, URI + "/getbin/" + id + "/" + d.chr + ":" + d.start + "-" + d.end + "/" + binsize)
            })
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
        chart = function (selection) { //selection is canvas;
            canvas = selection;
            render();
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
        chart.id = function(_) { return arguments.length ? (id= _, chart) : id; }
        chart.vertical = function(_) { return arguments.length ? (vertical= _, chart) : vertical; }
        chart.pos = function(_) { return arguments.length ? (pos= _, chart) : pos; }
        return chart
    }
    B.form = function() {
      var data
      var number = 1
      var trackInputs = []
      var chart = function(selection){
        selection.selectAll("*").remove();
        form = selection.append("div").classed("form-group", true)
        form.append("label").text("Track")
        for (var i=0;i<number;i++){
        trackInputs.push(form.append("select").classed("form-control", true))
        trackInputs[i].selectAll("option")
            .data(data.trackIds)
            .enter()
            .append("option")
            .attr("value", function (d, i) {
                return d
            })
            .text(function (d, i) {
                return d
            })
          }
      }
      chart.state = function () {
          if (number==1) {
              return {
              "track": trackInputs[0].node().value
              }
          } else {
            var v=[];
            trackInputs.forEach(function(d){
              v.push({"track":d.node().value})
            })
            return v;
          }
      }
      chart.number  = function(_) { return arguments.length ? (number = _, chart) : number ; }
      chart.data = function(_) { return arguments.length ? (data= _, chart) : data; }
      return chart
    }
}(snow.dataBigwig));
