var snow = snow || {};
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
            var grd = ctx.createLinearGradient(x, y, x + width, y);
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
        chart.color1 = function (_) {
            return arguments.length ? (color1 = _, chart) : color1;
        }
        chart.color2 = function (_) {
            return arguments.length ? (color2 = _, chart) : color2;
        }
        return chart
    }
    S.paraTable = function () {
        var data = {}
        var chart = function (selection) {
                //var keys = Object.keys(data)
                var table = selection.selectAll("table").data([data])
                table.enter().append("table")
                table.merge(table)
                    .classed("table", true)
                table.selectAll("*").remove();
                var thead = table.append("thead")
                var tbody = table.append("tbody")
                var keys = Object.keys(data)
                var rows = tbody.selectAll("tr")
                    .data(keys)
                    .enter()
                    .append("tr")
                rows.append("td").text(function(d){return d})
                rows.append("td").text(function(d){return data[d]})

            }
        chart.data = function (_) {
            return arguments.length ? (data = _, chart) : data;
        }
        return chart;
    }
    S.canvasToolXAxis = function(ctx,scale,x,y,height,label) {
      ctx.save()
      ctx.translate(x+height,y)
      ctx.rotate(Math.PI/2)
      S.canvasToolYAxis(ctx,scale,0,0,height,label)
      ctx.restore()
    }
    S.canvasToolYAxis = function (context, scale, x, y, height, label) {
        context.save()
        context.translate(x,y)
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
        context.restore();

    }

}(snow));
