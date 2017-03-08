export default function (d) { //regionForm
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
        "ses": [], //start end,
        "info" : [] //lendiv;
    }
    var dispatch = d3.dispatch("update")
    var chr2idx = function(c) {
      var idx = -1
      chrs.forEach(function(d,i){
        if (c==d.Name) {
          idx = i
        }
      })
      return idx;
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
            .classed("btn",true)
            .attr("value", "submit")
            .on("click", function () {
                parseRegions()
                send(regions)
            }).text("submit")
    }
    var default_range = function (length) {
        return 0 + "-" + length
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
                //dispatch.call("update")
            })

            var lendiv = d3.select(this).append("div")
            var inputdiv = d3.select(this).append("div")
            var se = inputdiv.append("input")
                .attr("id", "region" + i + "se")
                .style("width", "160px") //TODO remove ID and get state.
            form["ses"].push(se)
            form["info"].push(lendiv)
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
            //TODO update regions? change region number?
            for (var i = 0; i < regions.length; i++) {
                 var name = regions[i].chr.replace("chr","")
                form["chrs"][i].node().value = name
                var idx = chr2idx(name)
                form["ses"][i].node().value = regions[i].start + "-" + regions[i].end //use ng solve this?
                console.log(chrs,idx)
                form["info"][i].html("Name:" + chrs[idx].Name + " Length:" + chrs[idx].Length)
                lengths[i] = chrs[idx].Length
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
