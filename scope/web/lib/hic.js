var snow = snow || {};
snow.dataHic = snow.dataHic || {};
(function (H) {
    var norms = [
        "NONE",
        "VC",
        "VC_SQRT",
        "KR",
        "GW_KR",
        "INTER_KR",
        "GW_VC",
        "INTER_VC",
        "LOADED"
    ]
    var units = ["BP", "FRAG"]
    var default_range = function (length) {
        return Math.round(length * 2 / 10) + "-" + Math.round(length * 3 / 10)
    }
    var totalLength = function (regions) {
        var l = 0;
        regions.forEach(function (r, i) {
            l += (+r.end) - (+r.start)
        })
        return l
    }

    H.Get = function (URI, callback) {
        var ready = function (error, results) {
            if (error) throw error;
            var config = {}
            config.URI = URI
            config.norms = results[0]
            config.units = results[1]
            config.chrs = results[2]
            config.chr2idx = {}
            config.chrs.forEach(function (d, i) {
                config.chr2idx[d] = i
            })
            config.bpres = results[3]
            callback(config)
        }
        d3_queue.queue(2)
            .defer(d3.json, URI + "/norms")
            .defer(d3.json, URI + "/units")
            .defer(d3.json, URI + "/list")
            .defer(d3.json, URI + "/bpres")
            .awaitAll(ready);
    }
    H.chart = function () { //cfg chart
            var data
            var form
            var unitInput, normInput, color1Input, color2Input
            var chart = function (selection) {
                selection.selectAll("*").remove();
                form = selection.append("div").classed("form-group", true)
                form.append("label").text("Normalized Method")
                normInput = form.append("select").classed("form-control", true)
                normInput.selectAll("option")
                    .data(data.norms)
                    .enter()
                    .append("option")
                    .attr("value", function (d, i) {
                        return d
                    })
                    .text(function (d, i) {
                        return norms[d]
                    })
                form.append("label").text("Units")
                unitInput = form.append("select").classed("form-control", true)
                unitInput.selectAll("option")
                    .data(data.units)
                    .enter()
                    .append("option")
                    .attr("value", function (d, i) {
                        return d
                    })
                    .text(function (d, i) {
                        return units[d]
                    })
                if (data.units.length == 1) {
                    unitInput.property("disabled", true)
                }
                var colorInputDiv = form.append("div")
                colorInputDiv.append("label").text("Min")
                color1Input = colorInputDiv.append("input").attr("type", "color")
                    .attr("value", "#FFFFFF")
                colorInputDiv.append("label").text("Max")
                color2Input = colorInputDiv.append("input").attr("type", "color")
                    .attr("value", "#FF0000")
            }
            chart.state = function () {
                return {
                    "unit": unitInput.node().value,
                    "norm": normInput.node().value,
                    "color1": color1Input.node().value,
                    "color2": color2Input.node().value
                }
            }
            chart.data = function (_) {
                return arguments.length ? (data = _, chart) : data;
            }
            return chart
        }
        /* HiC Canvas Render, Parameters Regions URI and Width Height, xoffset , yoffset */
    H.canvas = function () {
        /*parameters for canvas */
        var height;
        var width;
        var xoffset;
        var yoffset;
        var URI;

        /*parameters for hic data */
        var regions;
        var scales = [null, null]
        var bpres;
        var norm;
        var unit;

        /*auto load data */
        var resIdx;
        var min;
        var max;
        var mats;
        var cellSize;
        var offsets;
        var canvas;
        var svg;
        var panel;
        var emit = function (d) {
            console.log("emit")
        }

        var regionString = function (o) {
            return o.chr + ":" + o.start + "-" + o.end
        }
        var totalLength = function (regions) {
            var l = 0;
            regions.forEach(function (r, i) {
                l += (+r.end) - (+r.start)
            })
            return l
        }
        var generateQueryUrl = function (d) {
            var a = regions[d[0]]
            var b = regions[d[1]]
            var url = "/get2dnorm/" + regionString(a) + "/" + regionString(b) + "/" + resIdx + "/" + norm + "/" + unit + "/text"
            return url
        }
        var renderMatrix = function (ctx, xoffset, yoffset, mat, cellSize, colorScale, region1, se1, region2,se2) {
            //var ctx = canvas.node().getContext("2d");
            //inner matrix
            var binsize = bpres[resIdx]
            var x0 = (se1[0] -region1.start)/binsize*cellSize
            var y0 = (se2[0] - region2.start)/binsize*cellSize
            var h0 = cellSize + y0
            var w0 = cellSize + x0
            var w1 = cellSize + (region1.end-se1[1])/binsize*cellSize
            var h1 = cellSize + (region2.end-se2[1])/binsize*cellSize
            var nx = mat.length;
            var ny = mat[0].length;
            if (nx==0 || ny==0) {return}
            ctx.fillStyle = colorScale(mat[0][0])
            ctx.fillRect(xoffset,yoffset,w0,h0)
            ctx.fillStyle = colorScale(mat[0][ny-1])
            ctx.fillRect(xoffset,yoffset + y0 + cellSize * (ny-1),w0,h1)
            ctx.fillStyle = colorScale(mat[nx-1][0])
            ctx.fillRect(xoffset + x0 + cellSize * (nx-1),yoffset,w1,h0)
            ctx.fillStyle = colorScale(mat[nx-1][ny-1])
            ctx.fillRect(xoffset + x0 + cellSize * (nx-1),yoffset + y0 + cellSize * (ny-1),w1,h1)
            for (var y=1;y<mat[0].length-1;y++){
               var l= nx-1;
                ctx.fillStyle = colorScale(mat[0][y]);
                ctx.fillRect(xoffset , yoffset + y * cellSize + y0, w0, cellSize);
                ctx.fillStyle = colorScale(mat[l][y]);
                ctx.fillRect(xoffset + l*cellSize + x0, yoffset + y * cellSize + y0, w1, cellSize);
            }
            for (var x=1;x<mat.length-1;x++){
               var l= ny-1;
               ctx.fillStyle = colorScale(mat[x][0]);
               ctx.fillRect(xoffset + x*cellSize + x0, yoffset, cellSize, h0);
               ctx.fillStyle = colorScale(mat[x][l]);
               ctx.fillRect(xoffset + x*cellSize + x0, yoffset + l * cellSize + y0, cellSize, h1);
            }
            for (var x = 1; x < mat.length-1; x++) {
                for (var y = 1; y < mat[0].length-1; y++) {
                    ctx.fillStyle = colorScale(mat[x][y]);
                    ctx.fillRect(xoffset + x * cellSize + x0, yoffset + y * cellSize + y0, cellSize, cellSize);
                }
            }
        }
        var color1
        var color2
        var color3 //for inter chromosome
        var color4 //for inter chromosome
        var background = "#FFF"
        var lineColor = "#000"
        var render = function () {
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = background
            ctx.fillRect(xoffset, yoffset, width, height)
            var color = d3.scaleLog().domain([min + 1.0, max + 1.0]).range([color1, color2]) //TODO not log scale
            var colorScale = function (d) {
                if (isNaN(d)) {
                    return "#FFF" //color(0)
                } else {
                    return color(d + 1.0)
                }
            }

            var l = regions.length;

            var k = 0;
            renderAxis(ctx)

            var se = [];
            regions.forEach(function(d,i){
              se.push(correctedPosition(d.start,d.end,resIdx))
            })
            for (var i = 1; i < l; i++) {
                renderLine(ctx, offsets[i])
            }
            for (var i = 0; i < l; i++) {
                for (var j = i; j < l; j++) {
                    var x = offsets[i];
                    var y = offsets[j];
                    renderMatrix(ctx, xoffset + x, yoffset + y, mats[k], cellSize, colorScale, regions[i] , se[i], regions[j],se[j])
                    k += 1;
                }
            }
            renderResp()
            renderBrush()
            callback({"resolution":bpres[resIdx],"max":max,"min":min}) //callback to send parameters
        }
        var renderAxis = function (ctx) {
                ctx.save()
                ctx.translate(width + xoffset, yoffset)
                ctx.fillStyle = background
                ctx.fillRect(0, 0, 200, height);
                ctx.restore()
                regions.forEach(function (d, i) {
                    var h = (offsets[i + 1] || height) - offsets[i]
                    var y = d3.scaleLinear().domain([d.start, d.end]).range([0, h])
                    yaxis(ctx, y, xoffset + width + 30, yoffset + offsets[i], h, d.chr)

                })

            }
            /** TODO THIS **/
        var cleanBrush = function () {
            //TODO svg.selectAll("svg").selectAll(".brush").remove();
        }
        var res = function (selection) {
            selection.each(function (d, i) {
                console.log(d, i)
                var x = scales[i](d.start)
                var l = scales[i](d.end) - x
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
                    .attr("y", function (d) {
                        return d.x
                    })
                    .attr("height", function (d) {
                        return d.l
                    })
                    .attr("width", function (d) {
                        return d.l
                    })
                    .attr("fill", function (d) {
                        return "#777"
                    })
                    .attr("opacity", 0.2)
            })
        }
        var response = function (e) {
            console.log(e)
            panel.selectAll(".hicResp")
                .data(e)
                .call(res)

        }
        var renderResp = function () {
            //var w = offsets[1]
            //var h = height - offsets[1]
            panel.selectAll(".hicResp").remove(); //TODO
            var svg = panel.selectAll(".hicResp").data(offsets)
                .enter()
                .append("svg")
                .attr("class", "hicResp")
            svg.style("position", "absolute")
                .style("top", function (d) {
                    return d + yoffset
                })
                .style("left", function (d) {
                    return d + xoffset
                })
                .attr("width", function (d, i) {
                    return offsets[i + 1] - offsets[i] || height - offsets[i]
                })
                .attr("height", function (d, i) {
                    return offsets[i + 1] - offsets[i] || height - offsets[i]
                })
        }
        var renderBrush = function () {
            var y = offsets[1]
            var w = offsets[1]
            var h = height - offsets[1]
            var xScale = d3.scaleLinear().domain([regions[0].start, regions[0].end]).range([0, w]);
            var yScale = d3.scaleLinear().domain([regions[1].start, regions[1].end]).range([0, h]);
            scales[0] = xScale
            scales[1] = yScale
            //console.log(xScale)
            var brushCb = function () {
                var e = d3.event.selection;
                console.log(e)
                var extent = [{
                    "chr": regions[0].chr,
                    "start": Math.round(xScale.invert(e[0][0])),
                    "end": Math.round(xScale.invert(e[1][0]))
                }, {
                    "chr": regions[1].chr,
                    "start": Math.round(yScale.invert(e[0][1])),
                    "end": Math.round(yScale.invert(e[1][1]))
                }];
                emit(extent)
                response(extent)

            }
            var brushEnd = function () {

                }
                //TODO RELATIVE POSITION 200 + 10 padding + 10 pading
            panel.selectAll(".hicBrush").remove(); //TODO
            var svg = panel.selectAll(".hicBrush").data(["0"]).enter().append("svg").attr("class", "hicBrush")
            svg.style("position", "absolute").style("left", xoffset)
                .style("top", yoffset + y)
                .attr("width", w)
                .attr("height", h)
            console.log("svg", svg)
            console.log("panel", panel)
            var brush = d3.brush().on("brush", brushCb).on("end", brushEnd)
            var b = svg.selectAll(".brush")
                .data([0])
            b.enter()
                .append("g")
                .attr("class", "brush")
                //.merge(b)
                .call(brush)
        }
        var yaxis = snow.canvasToolYAxis
        var renderLine = function (ctx, offset) {
            ctx.fillStyle = lineColor;
            ctx.fillRect(offset + xoffset, yoffset, 1, height);
            ctx.fillRect(xoffset, yoffset + offset, width, 1);
        }

        var callback = function(d) {
          console.log(d)
        }
        var dataReady = function (errors, results) {
            //console.log(results)
            callback(results)
            min = Infinity
            max = -Infinity
            mats = []
            results.forEach(function (text, i) {
                var data = d3.tsvParseRows(text).map(function (row) {
                    return row.map(function (value) {
                        var v = +value
                        if (min > v) {
                            min = v
                        }
                        if (max < v) {
                            max = v
                        }
                        return v;
                    });
                });
                //console.log(data);
                mats.push(data)

            })
            console.log("min,max", min, max)
                //TODO Call Render Function;
            render();
        }
        var regionsToResIdx = function () {
            var w = Math.min(width, height)
            var l = totalLength(regions)
            var pixel = l / w;
            var resIdx = bpres.length - 1
            for (var i = 0; i < bpres.length; i++) {
                if (bpres[i] < pixel) {
                    resIdx = i - 1;
                    break;
                }
            }
            cellSize = w / (l / bpres[resIdx])
          //  console.log(w, l, bpres[resIdx], cellSize)
            offsets = []
            var offset = 0.0;
            regions.forEach(function (d, i) {
                offsets.push(offset)
                offset += cellSize * ((+d.end - d.start) / bpres[resIdx])
            })
            return resIdx
        }
        var correctedPosition = function(start, end, resIdx) {
            var binsize = bpres[resIdx];
            return [Math.floor(start/binsize)*binsize,(Math.floor((end-1)/binsize)+1)*binsize]
        }
        var loadData = function () {
            var l = regions.length
            var pairs = []
            for (var i = 0; i < l; i++) {
                for (var j = i; j < l; j++) {
                    pairs.push([i, j])
                }
            }
            resIdx = regionsToResIdx(regions, width, height) // TODO with width and length parameters
                //console.log("smart resIdx", resIdx)
                //d3.select("#bpRes").text(bpres[resIdx]) //TODO
            var q = d3_queue.queue(2)
                // /get2dnorm/{chr}:{start}-{end}/{chr2}:{start2}-{end2}/{resIdx}/{norm}/{unit}/{format}
            pairs.forEach(function (d, i) {
                var url = generateQueryUrl(d)
                q.defer(d3.text, URI + url)
            })
            q.awaitAll(dataReady);
        }
        var chart = function (selection) { //selection is canvas itself;
                canvas = selection;
                //panel = d3.select("#main") //TODO
                cleanBrush();
                //add loading... here
                //render done.
                loadData();
            }
            /*
            chart.loadData = function(callback) {
              loadData()
              return chart;
            }
            */
        chart.panel = function (_) {
            return arguments.length ? (panel = _, chart) : panel;
        }
        chart.svg = function (_) {
            return arguments.length ? (svg = _, chart) : svg;
        }
        chart.height = function (_) {
            return arguments.length ? (height = _, chart) : height;
        }
        chart.width = function (_) {
            return arguments.length ? (width = _, chart) : width;
        }
        chart.xoffset = function (_) {
            return arguments.length ? (xoffset = _, chart) : xoffset;
        }
        chart.yoffset = function (_) {
            return arguments.length ? (yoffset = _, chart) : yoffset;
        }
        chart.regions = function (_) {
            return arguments.length ? (regions = _, chart) : regions;
        }
        chart.norm = function (_) {
            return arguments.length ? (norm = _, chart) : norm;
        }
        chart.unit = function (_) {
            return arguments.length ? (unit = _, chart) : unit;
        }
        chart.bpres = function (_) {
            return arguments.length ? (bpres = _, chart) : bpres;
        }
        chart.URI = function (_) {
            return arguments.length ? (URI = _, chart) : URI;
        }
        chart.color1 = function (_) {
            return arguments.length ? (color1 = _, chart) : color1;
        }
        chart.color2 = function (_) {
            return arguments.length ? (color2 = _, chart) : color2;
        }
        chart.background = function (_) {
            return arguments.length ? (background = _, chart) : background;
        }
        chart.emit = function (_) {
            return arguments.length ? (emit = _, chart) : emit;
        }
        chart.callback = function(_) { return arguments.length ? (callback= _, chart) : callback; }
        return chart;
    }

}(snow.dataHic));
