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
                var x1 = xscale(region[i].From)
                var x2 = xscale(region[i].To)
                var barwidth = x2 - x1
                var barheight = yscale(region[i].Max)
                var y1 = barHeight - barheight
                ctx.fillRect(x + xoffset + x1, y + yoffset + y1, barwidth, barheight);
            }
        }
        var _render_ = function (error, results) {
            var min = Infinity;
            var max = -Infinity;
            var xscales = []
            var xoffsets = []
            var yoffset = 0
            var offset = 0
            var totalLen = totalLength(regions)
            regions.forEach(function (d) {
                var w = (+(d.end) - (+d.start)) * width / totalLen
                var scale = d3.scaleLinear().domain([+(d.start), +(d.end)]).range([0, w])
                xscales.push(scale)
                xoffsets.push(offset)
                offset += w
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
        return chart
    }
}(snow.dataBigwig));

(function (S) {
    S.regionForm = function (d) { //regionForm
        var chrs
        var regionNum
        var regions;
        var lengths = [0, 0]; //two regions;
        var form = {
            "chrs": [],
            "ses": []
        }
        var chart = function (selection) {
            var data = []
            for (var i = 0; i < regionNum; i++) {
                data.push(chrs)
            }
            //TODO RegionNum Selection.
            selection
                .selectAll("div")
                .data(data)
                .enter()
                .append("div")
                .call(chrOpts)
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
            })

        }
        chart.regions = function (_) { //return regions or set regions function.
            //var num = d3.select("#regionNum").node().value
            if (!arguments.length) {
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
            var unitInput, normInput
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
            }
            chart.state = function () {
                return {
                    "unit": unitInput.node().value,
                    "norm": normInput.node().value
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
        var color1 = "#FFE"
        var color2 = "#F12"
        var background = "#FFF"
        var lineColor = "#000"
        var render = function () {
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = background
            ctx.fillRect(xoffset, yoffset, width, height)
            var color = d3.scaleLog().domain([min + 1.0, max]).range([color1, color2]) //TODO not log scale
            var colorScale = function (d) {
                if (isNaN(d)) {
                    return color(0)
                } else {
                    return color(d)
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
        }
        var renderAxis = function(ctx) {
            ctx.save()
            ctx.translate(width+xoffset,yoffset)
            ctx.fillStyle = background
            ctx.fillRect(0, 0, 200, height);
            ctx.restore()
            regions.forEach(function(d,i){
              var h = (offsets[i+1]||height) - offsets[i]
              var y = d3.scaleLinear().domain([d.start,d.end]).range([0,h])
              yaxis(ctx,y,xoffset+width,yoffset+offsets[i],h,d.chr)

            })

        }
        var yaxis = function(context, scale, x, y, height, label) {
            context.translate(x,y)
            var tickCount = 10,
                tickSize = 6,
                tickPadding = 3,
                ticks = scale.ticks(tickCount),
                tickFormat = scale.tickFormat(tickCount);

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
            context.translate(-x,-y)

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
            var resIdx = 0;
            for (var i = 0; i < bpres.length; i++) {
                if (bpres[i] < pixel) {
                    resIdx = i - 1;
                    break;
                }
            }
            if (resIdx < 0) {
                resIdx = 0
            }
            cellSize = w / (l / bpres[resIdx])
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
                loadData();
            }
            /*
            chart.loadData = function(callback) {
              loadData()
              return chart;
            }
            */
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

        return chart;



    }

}(snow.dataHic));


(function (d3, $, S) {
    var H = S.dataHic;
    var B = S.dataBigwig;
    var body = d3.select("body")
    var scope = {}
    var top = body.append("div").attr("id", "top")
        .classed("container", true)
    var main = body.append("div").attr("id", "main")
        .classed("container", true)
    var left = body.append("div").attr("id", "left")
        .classed("container", true)
    top.append("label").attr("for", "width").text("width")
    var width = top.append("span").attr("id", "width")
    top.append("label").attr("for", "height").text("height")
    var height = top.append("span").attr("id", "height")
    var canvas = main.append("canvas")
    $(window).resize(function () {
        resize()
    })
    var resize = function () {
        //var canvasdiv = d3.select("#canvasdiv")
        scope.width = $(window).width() - 200
        scope.height = $(window).height() - 30
        canvas.attr("width", scope.width).attr("height", scope.height)
        main.style("height", scope.height + "px")
        main.style("width", scope.width + "px")
        width.text(scope.width)
        height.text(scope.height)
        console.log(scope)

    }
    resize()
    var URI = "/hic"
    var hicCtrl, regionCtrl;
    var hicOpts = {}
    var hicCtrlDiv = left.append("div")
    var regionCtrlDiv = left.append("div")

    var addChrPrefix = function (r) { //TODO fix using idx , XY bug
            var s = []
            r.forEach(function (d) {
                s.push({
                    "start": d.start,
                    "end": d.end,
                    "chr": "chr" + d.chr
                })
            })
            console.log(s)
            return s
        }
        /* get parameters of regions and hic , then render */
    var plot = function () {
            console.log(hicCtrl.state())
            console.log(regionCtrl.regions())
            var hic = hicCtrl.state()
            var regions = regionCtrl.regions();
            var edge = Math.min(scope.height - 100, scope.width - 40)
            var chart = H.canvas()
                .URI(URI)
                .norm(hic.norm)
                .unit(hic.unit)
                .bpres(hicOpts.bpres)
                .xoffset(20)
                .yoffset(20)
                .width(edge)
                .height(edge)
                .regions(regions)
                //console.log(canvas)
                //console.log(hicOpts.bpres)
                //chart.loadData(console.log)
                //TODO Canvas Call BigWig Too;
            var bw = B.canvas().URI("").x(20).y(scope.height - 60).width(edge).regions(addChrPrefix(regions))
            canvas.call(chart)
            canvas.call(bw)
        }
        /*
        left.append("div").append("button").attr("value","submit")
        .text("submit")
        .on("click",function(){
          plot()
        })
        */
    var btns = left.append("div").classed("btn-group", true)
    var btns2 = left.append("div").classed("btn-group", true)
    btns.append("button")
        .classed("btn", true)
        .html('<small><span class="glyphicon glyphicon-backward"></span></small>')
        .on("click", function () {
            var regions = regionCtrl.regions();
            var l = Math.round((regions[0].end - regions[0].start) / 2)
            var d = regions[0]
            regions[0].start = d.start - l < 0 ? 0 : d.start - l
            regions[0].end = d.end - l < 0 ? d.end : d.end - l
            regionCtrl.regions(regions)
            regionCtrlDiv.call(regionCtrl)
            plot();
        })
    btns2.append("button")
        .classed("btn", true)
        .html('<small><span class="glyphicon glyphicon-zoom-in"></span></small>')
        .on("click", function () {
            var regions = regionCtrl.regions();
            regions.forEach(function (d, i) {
                var l = Math.round((d.end - d.start) / 3)
                regions[i].start = d.start + l
                regions[i].end = d.end - l
            })
            regionCtrl.regions(regions)
            regionCtrlDiv.call(regionCtrl)
            plot();
        })
    btns.append("button")
        .classed("btn", true)
        .html('<small><span class="glyphicon glyphicon-play"></span></small>')
        .on("click", function () {
            var regions = regionCtrl.regions();
            plot();
        })
    btns2.append("button")
        .classed("btn", true)
        .html('<small><span class="glyphicon glyphicon-zoom-out"></span></small>')
        .on("click", function () {
            var regions = regionCtrl.regions();
            regions.forEach(function (d, i) {
                var l = d.end - d.start
                regions[i].start = d.start - l < 0 ? 0 : d.start - l
                regions[i].end = d.end + l > d.length ? d.length : d.end + l
            })
            regionCtrl.regions(regions)
            regionCtrlDiv.call(regionCtrl)
            plot();
        })
    btns.append("button")
        .classed("btn", true)
        .html('<small><span class="glyphicon glyphicon-forward"></span></small>')
        .on("click", function () {
            var regions = regionCtrl.regions();
            var d = regions[0]
            var l = Math.round((regions[0].end - regions[0].start) / 2)
            regions[0].start = d.start + l > d.length ? d.start : d.start + l
            regions[0].end = d.end + l > d.length ? d.length : d.end + l
            regionCtrl.regions(regions)
            regionCtrlDiv.call(regionCtrl)
            plot();
        })
    var btns3 = left.append("div").classed("btn-group", true)
    btns3.append("button")
        .classed("btn", true)
        .html('<small><span class="glyphicon glyphicon-triangle-top"></span></small>')
        .on("click", function () {
            var regions = regionCtrl.regions();
            var l = Math.round((regions[1].end - regions[1].start) / 2)
            var d = regions[1]
            regions[1].start = d.start - l < 0 ? 0 : d.start - l
            regions[1].end = d.end - l < 0 ? d.end : d.end - l
            regionCtrl.regions(regions)
            regionCtrlDiv.call(regionCtrl)
            plot();
        })
    btns3.append("button")
        .classed("btn", true)
        .html('<small><span class="glyphicon glyphicon-triangle-bottom"></span></small>')
        .on("click", function () {
            var regions = regionCtrl.regions();
            var d = regions[1]
            var l = Math.round((regions[1].end - regions[1].start) / 2)
            regions[1].start = d.start + l > d.length ? d.start : d.start + l
            regions[1].end = d.end + l > d.length ? d.length : d.end + l
            regionCtrl.regions(regions)
            regionCtrlDiv.call(regionCtrl)
            plot();
        })
    var renderHicCtrlPanel = function (data) {
        hicOpts = data;
        console.log("hic", data)
        hicCtrl = H.chart().data(data);
        hicCtrlDiv.call(hicCtrl)
        regionCtrl = S.regionForm().chrs(data.chrs).regionNum(2)
        regionCtrlDiv.call(regionCtrl)
    }
    H.Get(URI, renderHicCtrlPanel)
    B.Get("", console.log)
}(d3, jQuery, snow));
