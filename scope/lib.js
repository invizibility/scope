//var HiC = HiC || {};
//var BigWig = BigWig || {};
var snow = snow || {};
snow.dataBigwig = {};
snow.dataHic = {};

(function (B) {
    B.Get = function (URI, callback) {
        var config = {}
        var ready = function (error, results) {
            config.URI = URI
            config.chrs = results[0]
            config.binsizes = results[1]
            callback(config)
        }
        d3_queue.queue(2)
            .defer(d3.json, URI + "/list")
            .defer(d3.json, URI + "/binsizes")
            .awaitAll(ready);
    }
    B.canvas = function () {

        var height
        var width
        var regions
        var x
        var y
        var URI = ""
        var barHeight = 50

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
                if (isNaN(region[i].From) || isNaN(region[i].To)) {
                    continue; //add handle large width bug
                }
                var x1 = xscale(region[i].From)
                var x2 = xscale(region[i].To)
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
        var xscales,xoffsets,widths;
        var renderResp = function() {
            //add trackId TODO
            var resp = panel.selectAll(".bwResp").data(regions)
            resp.enter().append("svg")
            .classed("bwResp",true)
            .merge(resp)
            .style("position","absolute")
            .style("top", y)
            .style("left",function(d,i){return x + xoffsets[i]})
            .attr("width",function(d,i){return widths[i]})
            .attr("height",barHeight)
            resp.selectAll("rect").remove()
        }
        var res = function(selection) {
          selection.each(function(d,i){
            console.log(d,i)
            var x = xscales[i](d.start)
            var l = xscales[i](d.end)-x
            var rect = d3.select(this).selectAll("rect")
             .data([{"x":x,"l":l}])
             rect
             .enter()
             .append("rect")
             .merge(rect)
             .attr("x",function(d){return d.x})
             .attr("y",0)
             .attr("height",barHeight)
             .attr("width",function(d){return d.l})
             .attr("fill",function(d){return "#777"})
             .attr("opacity",0.2)
          })
        }
        var response = function (e) {
            //console.log(e)
              panel.selectAll(".bwResp") //need to add trackId
              .data(e)
              .call(res)

        }
        var _render_ = function (error, results) {
            var min = Infinity;
            var max = -Infinity;
            xscales = []
            xoffsets = []
            widths  = []
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
            renderResp();
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
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = background
            ctx.fillRect(x, y, width, barHeight)
            console.log(x, y, width, barHeight)
            results.forEach(function (region, i) {
                renderRegion(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, color(i))
            })

        }
        var _render = function () {
            var q = d3_queue.queue(2)
            regions.forEach(function (d) {
                q.defer(d3.json, URI + "/getbin/" + d.chr + ":" + d.start + "-" + d.end + "/" + binsize)
            })
            q.awaitAll(_render_)
        }
        var render = function () {
            var length = totalLength(regions)
            var url = URI + "/binsize/" + length + "/" + width
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
        chart.panel = function(_) { return arguments.length ? (panel= _, chart) : panel; }
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
        chart.response = function(e) {
          response(e)
        }
        return chart
    }
}(snow.dataBigwig));

(function (S) {
    S.regionForm = function (d) { //regionForm
        var chrs
        var regionNum
        var regions;
        var stacks = []; //previous regions; TODO
        var regionsSend; //committed send. TODO
        var send = function (d) {
            console.log(d)
        }
        var lengths = [0, 0]; //two regions;
        var form = {
            "chrs": [], //chrs.
            "ses": [] //start end
        }
        var chart = function (selection) {
            var data = []
            for (var i = 0; i < regionNum; i++) {
                data.push(chrs)
            }

            //TODO RegionNum Selection.
            selection
                .selectAll(".entry")
                .data(data)
                .enter()
                .append("div")
                .classed("entry", true)
                .call(chrOpts)
            selection
                .selectAll(".send")
                .data([0])
                .enter()
                .append("div")
                .classed("send", true)
                .append("button")
                .attr("value", "submit")
                .on("click", function () {
                    parseRegions()
                    send(regions)
                }).text("submit")
        }
        var default_range = function (length) {
            return Math.round(length * 2 / 10) + "-" + Math.round(length * 3 / 10)
        }
        var chrOpts = function (selection) {
            selection.each(function (chrs, i) {
                //d3.select(this).selectAll("div").remove()
                var div = d3.select(this)
                var id = "region" + i
                div.append("label")
                    .attr("for", id)
                    .text(id)
                var sel = div.append("select").classed("form-control", true).attr("id", id)
                form["chrs"].push(sel)
                form["chrs"][i].selectAll("option")
                    .data(chrs)
                    .enter()
                    .append("option")
                    .attr("value", function (d, i) {
                        return d.Name
                    })
                    .attr("length", function (d, i) {
                        return d.Length
                    })
                    .text(function (d, i) {
                        return d.Name
                    })
                var name;
                var length;
                sel.on("change", function (d) {
                    lendiv.html("Name:" + chrs[this.selectedIndex].Name + " Length:" + chrs[this.selectedIndex].Length)
                    name = chrs[this.selectedIndex].Name;
                    length = chrs[this.selectedIndex].Length;
                    form["ses"][i].node().value = default_range(length)
                    lengths[i] = length;
                })

                var lendiv = d3.select(this).append("div")
                var inputdiv = d3.select(this).append("div")
                var se = inputdiv.append("input")
                    .attr("id", "region" + i + "se")
                    .style("width", "160px") //TODO remove ID and get state.
                form["ses"].push(se)
                    //TODO Add submit button and commit sen
            })

        }
        var parseRegions = function () {
            regions = []
            for (var i = 0; i < regionNum; i++) {
                var chr = form["chrs"][i].node().value
                var se = form["ses"][i].node().value
                    //console.log(chr, se)
                var x = se.split("-")
                regions.push({
                    "chr": chr,
                    "start": +x[0],
                    "end": +x[1],
                    "length": lengths[i]
                })
            }
        }
        chart.regions = function (_) { //return regions or set regions function.
            //var num = d3.select("#regionNum").node().value
            if (!arguments.length) {
                parseRegions();
                return regions
            } else {
                regions = _;
                //TODO update regions?
                for (var i = 0; i < regionNum; i++) {
                    form["ses"][i].node().value = regions[i].start + "-" + regions[i].end //use ng solve this?
                }
                return chart;
            }

        }
        chart.regionNum = function (_) {
            return arguments.length ? (regionNum = _, chart) : regionNum;
        }
        chart.chrs = function (_) {
                return arguments.length ? (chrs = _, chart) : chrs;
            }
            //chart.lengths　＝　function(){return lengths;}
        chart.send = function (_) {
            return arguments.length ? (send = _, chart) : send;
        }
        return chart
    }
    S.colorBar = function () {
    var color1
    var color2
    //var scale = d3.scaleLinear().range(["#FFFFFF", "#FF0000"])
    var width = 50
    var height = 10
    var x = 20
    var y = 20
    var chart = function (selection) { //selection is canvas;
        var ctx = selection.node().getContext("2d");
        var grd = ctx.createLinearGradient(x, y, x+width, y);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        ctx.fillStyle = grd;
        ctx.fillRect(x, y, width, height);
    }
    chart.width = function (_) {
        return arguments.length ? (width = _, chart) : width;
    }
    chart.height = function (_) {
        return arguments.length ? (height = _, chart) : height;
    }
    chart.x = function (_) {
        return arguments.length ? (x = _, chart) : x;
    }
    chart.y = function (_) {
        return arguments.length ? (y = _, chart) : y;
    }
    chart.color1 = function(_) { return arguments.length ? (color1= _, chart) : color1; }
    chart.color2 = function(_) { return arguments.length ? (color2= _, chart) : color2; }
    return chart
}

}(snow));
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
            var unitInput, normInput , color1Input, color2Input
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
                color1Input = colorInputDiv.append("input").attr("type","color")
                    .attr("value","#FFFFFF")
                colorInputDiv.append("label").text("Max")
                color2Input = colorInputDiv.append("input").attr("type","color")
                        .attr("value","#FF0000")
            }
            chart.state = function () {
                return {
                    "unit": unitInput.node().value,
                    "norm": normInput.node().value,
                    "color1" : color1Input.node().value,
                    "color2" : color2Input.node().value
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
        var scales = [null,null]
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
        var renderMatrix = function (ctx, xoffset, yoffset, mat, cellSize, colorScale) {
            //var ctx = canvas.node().getContext("2d");
            for (var x = 0; x < mat.length; x++) {
                for (var y = 0; y < mat[0].length; y++) {
                    ctx.fillStyle = colorScale(mat[x][y]);
                    ctx.fillRect(xoffset + x * cellSize, yoffset + y * cellSize, cellSize, cellSize);
                }
            }
        }
        var color1
        var color2
        var background = "#FFF"
        var lineColor = "#000"
        var render = function () {
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = background
            ctx.fillRect(xoffset, yoffset, width, height)
            var color = d3.scaleLog().domain([min + 1.0, max+1.0]).range([color1, color2]) //TODO not log scale
            var colorScale = function (d) {
                if (isNaN(d)) {
                    return "#FFF"//color(0)
                } else {
                    return color(d+1.0)
                }
            }

            var l = regions.length;

            var k = 0;
            renderAxis(ctx)
            for (var i = 1; i < l; i++) {
                renderLine(ctx, xoffset + offsets[i])
            }
            for (var i = 0; i < l; i++) {
                for (var j = i; j < l; j++) {
                    var x = offsets[i];
                    var y = offsets[j];
                    renderMatrix(ctx, xoffset + x, yoffset + y, mats[k], cellSize, colorScale)
                    k += 1;
                }
            }
            renderResp()
            renderBrush()

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
                    yaxis(ctx, y, xoffset + width, yoffset + offsets[i], h, d.chr)

                })

            }
            /** TODO THIS **/
        var cleanBrush = function () {
            //TODO svg.selectAll("svg").selectAll(".brush").remove();
        }
        var res = function(selection) {
          selection.each(function(d,i){
            console.log(d,i)
            var x = scales[i](d.start)
            var l = scales[i](d.end)-x
            var rect = d3.select(this).selectAll("rect")
             .data([{"x":x,"l":l}])
             rect
             .enter()
             .append("rect")
             .merge(rect)
             .attr("x",function(d){return d.x})
             .attr("y",function(d){return d.x})
             .attr("height",function(d){return d.l})
             .attr("width",function(d){return d.l})
             .attr("fill",function(d){return "#777"})
             .attr("opacity",0.2)
          })
        }
        var response = function (e) {
            console.log(e)
              panel.selectAll(".hicResp")
              .data(e)
              .call(res)

        }
        var renderResp = function() {
          //var w = offsets[1]
          //var h = height - offsets[1]
          panel.selectAll(".hicResp").remove(); //TODO
          var svg = panel.selectAll(".hicResp").data(offsets)
             .enter()
             .append("svg")
             .attr("class", "hicResp")
          svg.style("position", "absolute")
              .style("top", function(d){return d+yoffset})
              .style("left", function(d){return d+xoffset})
              .attr("width", function(d,i){
                 return offsets[i+1]-offsets[i] || height - offsets[i]
              })
              .attr("height", function(d,i){
                 return offsets[i+1]-offsets[i] || height - offsets[i]
              })
        }
        var renderBrush = function () {
            var y = offsets[1]
            var w = offsets[1]
            var h = height - offsets[1]
            var xScale = d3.scaleLinear().domain([regions[0].start, regions[0].end]).range([0, w]);
            var yScale = d3.scaleLinear().domain([regions[1].start, regions[1].end]).range([0, h]);
            scales[0]=xScale
            scales[1]=yScale
            console.log(xScale)
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
        var yaxis = function (context, scale, x, y, height, label) {
            context.translate(x, y)
            var tickCount = 5,
                tickSize = 6,
                tickPadding = 3,
                ticks = scale.ticks(tickCount),
                tickFormat = scale.tickFormat(tickCount, "s");

            context.beginPath();
            ticks.forEach(function (d) {
                context.moveTo(0, scale(d));
                context.lineTo(6, scale(d));
            });
            context.strokeStyle = "black";
            context.stroke();

            context.beginPath();
            context.moveTo(tickSize, 0);
            context.lineTo(0.5, 0);
            context.lineTo(0.5, height);
            context.lineTo(tickSize, height);
            context.strokeStyle = "black";
            context.stroke();

            context.textAlign = "left";
            context.textBaseline = "middle";
            context.fillStyle = "black"
            ticks.forEach(function (d) {
                context.fillText(tickFormat(d), tickSize + tickPadding, scale(d));
            });

            context.save();
            context.rotate(-Math.PI / 2);
            context.textAlign = "right";
            context.textBaseline = "top";
            context.font = "bold 10px sans-serif";
            context.fillText(label, -10, -10);
            context.restore();
            context.translate(-x, -y)

        }
        var renderLine = function (ctx, offset) {
            ctx.fillStyle = lineColor;
            ctx.fillRect(offset, yoffset, 1, height);
            ctx.fillRect(xoffset, offset, width, 1);
        }
        var dataReady = function (errors, results) {
            console.log(results)
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
            console.log(w, l, bpres[resIdx], cellSize)
            offsets = []
            var offset = 0.0;
            regions.forEach(function (d, i) {
                offsets.push(offset)
                offset += cellSize * ((+d.end - d.start) / bpres[resIdx])
            })
            return resIdx
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
        return chart;
    }

}(snow.dataHic));
