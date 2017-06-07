import canvasToolYAxis from "../canvastool/yaxis"
import canvasToolXAxis from "../canvastool/xaxis"
import {totalLength,overlap} from "./funcs"

export default {
  　Get : function (URI, callback) {
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
    ,
    canvas : function () {
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

            for (var i = 0; i < region.length; i++) {
                ctx.fillStyle = color
                var r = xscale.range();
                if (isNaN(region[i].From) || isNaN(region[i].To)) {
                    continue; //add handle large width bug
                }
                var x1 = xscale(region[i].From)
                var x2 = xscale(region[i].To)
                if (x1 < r[0]) {
                    x1 = r[0]
                }
                if (x2 > r[1]) {
                    x2 = r[1]
                }
                var width = x2 - x1
                if (width > 100) {
                    console.log("debug region", region[i])
                }
                var ymax = region[i].Max || region[i].Value
                var ymin = region[i].Min || region[i].Value
                var yv = region[i].Sum / region[i].Valid || region[i].Value
                var y1 = yscale(yv)
                var ym = yv < 0 ? yscale(ymin) : yscale(ymax)
                var y0 = yscale(0);
                if (yv<0){
                  ctx.fillStyle = ncolor
                } else {
                  ctx.fillStyle = color
                }
                //var y1 = barHeight - height
                if (mode == 0 || mode == 1) {
                    if (y0 < 0) {
                        ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - y1), width, y1 - 0);
                        //ctx.fillRect(x + xoffset + x1, y + yoffset , width, y1);
                    } else {

                        if (y1 > y0) {
                            ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - y1), width, y1 - y0);
                        } else {
                            ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - y0), width, y0 - y1);
                        }
                    }
                }
                if (mode == 0) {
                    ctx.fillStyle = "#111"
                    ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - ym), width, 1)
                }
                if (mode == 2) {
                    if (y0 < 0) {
                        ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - ym), width, ym - 0);
                    } else {
                        if (y1 > y0) {
                            ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - ym), width, ym - y0);
                        } else {
                            ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - y0), width, y0 - ym);
                        }
                    }
                }

            }
        }
        //TODO get a simple rotated version.
        var renderRegionVertical = function (ctx, yoffset, xoffset, region, xscale, yscale, color, ncolor) {
            for (var i = 0; i < region.length; i++) {
                ctx.fillStyle = color
                var r = xscale.range();
                if (isNaN(region[i].From) || isNaN(region[i].To)) {
                    continue; //add handle large width bug
                }
                var x1 = xscale(region[i].From)
                var x2 = xscale(region[i].To)
                if (x1 < r[0]) {
                    x1 = r[0]
                }
                if (x2 > r[1]) {
                    x2 = r[1]
                }
                var width = x2 - x1
                if (width > 100) {
                    console.log("debug region", region[i])
                } //debug
                var ymax = region[i].Max || region[i].Value
                var ymin = region[i].Min || region[i].Value
                var yv = region[i].Sum / region[i].Valid || region[i].Value
                if (yv<0){
                  ctx.fillStyle = ncolor
                } else {
                  ctx.fillStyle = color
                }
                var y1 = yscale(yv)
                var ym = yv < 0 ? yscale(ymin) : yscale(ymax)

                var y0 = yscale(0);
                //var y1 = barHeight - height
                if (mode == 1 || mode == 2) {
                    if (y0 < 0) {
                        ctx.fillRect(x + xoffset, y + yoffset + x1, y1 - 0, width);
                    } else {
                        if (y1 > y0) {
                            ctx.fillRect(x + xoffset + y0, y + yoffset + x1, y1 - y0, width);
                        } else {
                            ctx.fillRect(x + xoffset + y1, y + yoffset + x1, y0 - y1, width);
                        }
                    }
                }
                if (mode == 0) {
                    ctx.fillStyle = "#111"
                    ctx.fillRect(x + xoffset + ym, y + yoffset + x1, 1, width)
                }
                if (mode == 2) {
                    if (y0 < 0) {
                        ctx.fillRect(x + xoffset, y + yoffset + x1, ym - 0, width);
                    } else {
                        if (y1 > y0) {
                            ctx.fillRect(x + xoffset + y0, y + yoffset + x1, ym - y0, width);
                        } else {
                            ctx.fillRect(x + xoffset + ym, y + yoffset + x1, y0 - ym, width); //TODO TEST
                        }
                    }
                }


            }
        }
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
            var color = d3.scaleOrdinal(d3.schemeCategory10);// TODO here.
            var background = "#FFF"
            if (vertical) {
                //renderRespVertical(); //TODO
                var ctx = canvas.node().getContext("2d");
                ctx.fillStyle = background
                ctx.fillRect(x, y, barHeight, width)
                results.forEach(function (region, i) {
                    renderRegionVertical(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, "#333","#666")
                })
                canvasToolXAxis(ctx, axisScale, x, y + width, barHeight, id)
            } else {
                //renderResp(); //TODO
                var ctx = canvas.node().getContext("2d");
                ctx.fillStyle = background
                ctx.fillRect(x, y, width, barHeight)
                results.forEach(function (region, i) {
                    renderRegion(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, "#333","#666")
                })

                canvasToolYAxis(ctx, axisScale, x + width, y, barHeight, undefined)

                ctx.fillText(id, x+10, y+10);
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
            panel.selectAll(".resp"+"_"+pos).remove();
            if (vertical) {
              respSvg = panel.append("svg")
                  .classed("resp_"+pos, true)
                  .style("postion", "absolute")
                  .style("top", y)
                  .style("left", x)
                  .attr("width", barHeight)
                  .attr("height", width)
                  .append("g")
                  .attr("transform","translate("+barHeight+","+0+") rotate(90)")
            } else {
              respSvg = panel.append("svg")
                  .classed("resp_"+pos, true)
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
    },

    form : function () {
        var data
        var number = 1
        var trackInputs = []
        var chart = function (selection) {
            selection.selectAll("*").remove();
            var form = selection.append("div").classed("form-group", true)
            form.append("label").text("Track")
            for (var i = 0; i < number; i++) {
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
            if (number == 1) {
                return {
                    "track": trackInputs[0].node().value
                }
            } else {
                var v = [];
                trackInputs.forEach(function (d) {
                    v.push({
                        "track": d.node().value
                    })
                })
                return v;
            }
        }
        chart.number = function (_) {
            return arguments.length ? (number = _, chart) : number;
        }
        chart.data = function (_) {
            return arguments.length ? (data = _, chart) : data;
        }
        return chart
    }
}
