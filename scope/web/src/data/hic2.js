/*triangle hic */
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
var regionString = function (o) {
    return o.chr + ":" + o.start + "-" + o.end
}


export default {
    Get: function (URI, callback) {
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
    },
    chart: function () { //cfg chart
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
    },
    /* HiC Canvas Render, Parameters Regions URI and Width Height, xoffset , yoffset */
    canvas: function () {
        /*parameters for canvas */
        var height;
        var width;
        var xoffset;
        var yoffset;
        var rotate = 0;
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
        var gap = 20 / Math.SQRT2
        var emit = function (d) {
            console.log("emit")
        }


        var generateQueryUrl = function (d) {
            var a = regions[d[0]]
            var b = regions[d[1]]
            var url = "/get2dnorm/" + regionString(a) + "/" + regionString(b) + "/" + resIdx + "/" + norm + "/" + unit + "/text"
            return url
        }
        /*TODO TO Triangle  x, y change? which should be region 1. after 3/4 rotate*/
        var renderTriangle = function (ctx, xoffset, yoffset, mat, cellSize, colorScale, region1, se1) {
            ctx.save()
            ctx.translate(xoffset, yoffset)
            ctx.rotate(-Math.PI / 4)
            var binsize = bpres[resIdx]
            var x0 = (se1[0] - region1.start) / binsize * cellSize
            var y0 = (se1[0] - region1.start) / binsize * cellSize
            var h0 = cellSize + y0
            var w0 = cellSize + x0
            var w1 = cellSize + (region1.end - se1[1]) / binsize * cellSize
            var h1 = w1
            var nx = mat.length;
            var ny = mat[0].length;
            if (nx == 0 || ny == 0) {
                return
            }

            /* NOT IN Flank First */
            for (var x = 1; x < mat.length - 1; x++) {
                for (var y = x; y < mat[0].length - 1; y++) {
                    ctx.fillStyle = colorScale(mat[x][y]); //mat[x][y] mirror
                    ctx.fillRect(y * cellSize + y0, x * cellSize + x0, cellSize, cellSize);
                }
            }

            //TODO REMOVE ONE
            ctx.fillStyle = colorScale(mat[0][0])
            ctx.fillRect(0, 0, h0, w0)

            ctx.fillStyle = colorScale(mat[0][ny - 1])
            ctx.fillRect(y0 + cellSize * (ny - 1), 0, h1, w0)
            /*
            ctx.fillStyle = colorScale(mat[nx - 1][0])
            ctx.fillRect(0, x0 + cellSize * (nx - 1),  h0, w1)
            */
            ctx.fillStyle = colorScale(mat[nx - 1][ny - 1])
            ctx.fillRect(y0 + cellSize * (ny - 1), x0 + cellSize * (nx - 1), h1, w1)

            for (var y = 1; y < mat[0].length - 1; y++) {
                var l = nx - 1;
                ctx.fillStyle = colorScale(mat[0][y]);
                ctx.fillRect(y * cellSize + y0, 0, cellSize, w0); //TODO fix size?
                /*
                ctx.fillStyle = colorScale(mat[l][y]);
                ctx.fillRect( y * cellSize + y0,l * cellSize + x0,  w1, cellSize);
                */
            }
            for (var x = 1; x < mat.length - 1; x++) {
                var l = ny - 1;
                /*
                ctx.fillStyle = colorScale(mat[x][0]);
                ctx.fillRect( 0,x * cellSize + x0, cellSize, h0);
                */
                ctx.fillStyle = colorScale(mat[x][l]);
                ctx.fillRect(l * cellSize + y0, x * cellSize + x0, h1, cellSize);

            }
            ctx.restore()
        }
        var renderMatrix = function (ctx, xoffset, yoffset, mat, cellSize, colorScale, region1, se1, region2, se2) {
            //var ctx = canvas.node().getContext("2d");
            //inner matrix
            //TODO FIX render mirror.
            ctx.save()
            ctx.rotate(-Math.PI / 4)
            ctx.translate(xoffset, yoffset)

            var binsize = bpres[resIdx]
            var x0 = (se1[0] - region1.start) / binsize * cellSize
            var y0 = (se2[0] - region2.start) / binsize * cellSize
            var h0 = cellSize + y0
            var w0 = cellSize + x0
            var w1 = cellSize + (region1.end - se1[1]) / binsize * cellSize
            var h1 = cellSize + (region2.end - se2[1]) / binsize * cellSize
            var nx = mat.length;
            var ny = mat[0].length;
            if (nx == 0 || ny == 0) {
                return
            }
            ctx.fillStyle = colorScale(mat[0][0])
            ctx.fillRect(0, 0, h0, w0)

            ctx.fillStyle = colorScale(mat[0][ny - 1])
            ctx.fillRect(y0 + cellSize * (ny - 1), 0, h1, w0)

            ctx.fillStyle = colorScale(mat[nx - 1][0])
            ctx.fillRect(0, x0 + cellSize * (nx - 1), h0, w1)

            ctx.fillStyle = colorScale(mat[nx - 1][ny - 1])
            ctx.fillRect(y0 + cellSize * (ny - 1), x0 + cellSize * (nx - 1), h1, w1)

            for (var y = 1; y < mat[0].length - 1; y++) {
                var l = nx - 1;
                ctx.fillStyle = colorScale(mat[0][y]);
                ctx.fillRect(y * cellSize + y0, 0, cellSize, w0); //TODO fix size?
                ctx.fillStyle = colorScale(mat[l][y]);
                ctx.fillRect(y * cellSize + y0, l * cellSize + x0, cellSize, w1);
            }
            for (var x = 1; x < mat.length - 1; x++) {
                var l = ny - 1;
                ctx.fillStyle = colorScale(mat[x][0]);
                ctx.fillRect(0, x * cellSize + x0, h0, cellSize);
                ctx.fillStyle = colorScale(mat[x][l]);
                ctx.fillRect(l * cellSize + y0, x * cellSize + x0, h1, cellSize);
            }

            for (var x = 1; x < mat.length - 1; x++) {
                for (var y = 1; y < mat[0].length - 1; y++) {
                    ctx.fillStyle = colorScale(mat[x][y]);
                    ctx.fillRect(y * cellSize + y0, x * cellSize + x0, cellSize, cellSize);
                }
            }
            ctx.restore()
        }
        var color1
        var color2
        var color3 //for inter chromosome
        var color4 //for inter chromosome
        var background = "#FFF"
        var lineColor = "#FF0"
        var domain = undefined;
        var render = function (_) {
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = background
            ctx.save()
            ctx.translate(xoffset, yoffset)
            //ctx.rotate(rotate)
            //ctx.fillRect(0, 0, width, height)

            var color
            if (domain) {
                color = d3.scaleLog().domain([domain[0] + 1.0, domain[1] + 1.0]).range([color1, color2]) //TODO set scale.
            } else {
                color = d3.scaleLog().domain([min + 1.0, max + 1.0]).range([color1, color2]) //TODO set scale.
            }

            var colorScale = function (d) {
                if (isNaN(d)) {
                    return "#FFF" //color(0)
                } else {
                    return color(d + 1.0)
                }
            }

            var l = regions.length;

            var k = 0;
            //renderAxis(ctx)

            var se = [];
            regions.forEach(function (d, i) {
                se.push(correctedPosition(d.start, d.end, resIdx))
            })

            for (var i = 0; i < l; i++) {
                for (var j = i; j < l; j++) {
                    var x = offsets[i];
                    var y = offsets[j];
                    //renderMatrix(ctx, xoffset + x, yoffset + y, mats[k], cellSize, colorScale, regions[i] , se[i], regions[j],se[j])
                    //TODO. without rotation. upper triangle.
                    //TODO renderMatrix(ctx, x, y, mats[k], cellSize, colorScale, regions[i], se[i], regions[j], se[j])
                    if (i == j) {
                        renderTriangle(ctx, x, 0, mats[k], cellSize / Math.SQRT2, colorScale, regions[i], se[i])
                    } else {
                        renderMatrix(ctx, y / Math.SQRT2, x / Math.SQRT2, mats[k], cellSize / Math.SQRT2, colorScale, regions[i], se[i], regions[j], se[j])
                    }
                    k += 1;
                }
            }
            ctx.restore()
            if (!arguments.length) { 
              callback({
                  "resolution": bpres[resIdx],
                  "max": max,
                  "min": min
              }) //callback to send parameters

            }

        }



        var callback = function (d) {
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
            var eW = w - gap * (regions.length - 1)
            var l = totalLength(regions)
            var pixel = l / eW;
            var resIdx = bpres.length - 1
            for (var i = 0; i < bpres.length; i++) {
                if (bpres[i] < pixel) {
                    resIdx = i - 1;
                    break;
                }
            }
            cellSize = eW / (l / bpres[resIdx])
            //  console.log(w, l, bpres[resIdx], cellSize)
            offsets = []
            var offset = 0.0;
            regions.forEach(function (d, i) {
                offsets.push(offset)
                offset += cellSize * ((+d.end - d.start) / bpres[resIdx]) + gap
            })
            return resIdx
        }
        var correctedPosition = function (start, end, resIdx) {
            var binsize = bpres[resIdx];
            return [Math.floor(start / binsize) * binsize, (Math.floor((end - 1) / binsize) + 1) * binsize]
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
            //cleanBrush();
            //add loading... here
            //render done.
            loadData();
        }
        chart.render = render; //TODO change name later.
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
        chart.domain = function(_) { return arguments.length ? (domain= _, chart) : domain; }

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
        chart.callback = function (_) {
            return arguments.length ? (callback = _, chart) : callback;
        }
        chart.rotate = function (_) {
            return arguments.length ? (rotate = _, chart) : rotate;
        }
        chart.gap = function (_) {
            return arguments.length ? (gap = _, chart) : gap;
        }

        return chart;
    }

}
