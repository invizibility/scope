import B from "../data/bigwig"
import H from "../data/hic2"
import toolsFixRegions from "../tools/fixRegions"
//import toolsAddChrPrefix from "../tools/addChrPrefix"
import toolsTrimChrPrefix from "../tools/trimChrPrefix"
import scaleScope from "../scaleScope"
import symbolTriangle from "../symbol/triangle"
import datgui from "../datgui"
//import brush from "../scopebrush" //TODO
import {
  default as constant
} from "../data/hicvar"
const norms = constant().norms
const units = constant().units
const _barHeight = 30

export default function (layout, container, state, app) {
    //TODO RM Global Variables, make it as a renderer in Snow;
    var scope = {
        "background": "#BBB"
    }
    var init = {
        "hic": false
    }
    var hic = {}
    var server = app["server"] || ""
    var dispatch = d3.dispatch("update", "brush", "cfg", "replot", "domain", "monitor")
    var main = d3.select(container.getElement()[0])
        .append("div")
        .attr("class", "content")
        .style("position", "relative")
    var cfg = d3.select(container.getElement()[0])
        .append("div")
        .attr("class", "cfg")
    var sign = false
    //var hicCfgDiv
    var datIO = datgui().closable(false)
    dispatch.on("cfg", function (data) {
        //console.log("hic", hic)
        var opts = {
          "color2": "#ff0000",
          "color1": "#ffffff"
        }
        opts["unit"] = {}
        data.units.forEach(function (d) {
          var k = units[d]
          opts["unit"][k] = d
        })
        opts["norm"] = {}
        data.norms.forEach(function (d) {
          //opts.norms.push({norms[d]:d})
          var k = norms[d]
          opts["norm"][k] = d
        })
        hic.state = {}
        if (container.getState().hicState && sign == false) {
          hic.state = container.getState().hicState
          opts["color1"] = hic.state.color1
          opts["color2"] = hic.state.color2
          sign = true;
        } else {

          sign = true;
        }

        //hicCfgDiv = renderCfg(opts, hic.state, undefined)
        cfg.selectAll(".datgui").remove();
        cfg.selectAll(".datgui")
        .data([
          {"options":opts,"config":hic.state}
        ])
        .enter()
        .append("div")
        .classed("datgui",true)
        .call(datIO)

        container.extendState({
          "hicState": hic.state
        })
        cfg.selectAll(".submit").remove();
        cfg.append("input")
            .attr("type", "button")
            .classed("submit",true)
            .attr("value", "submit")
            .on("click", function (d) {
                container.extendState({
                    "hicState": hic.state
                })
                container.extendState({
                    "configView": false
                })
                //container.extendState({"URI":uri.node().value}
                cfg.style("display", "none")
                main.style("display", "block")
                dispatch.call("replot", this, {})
            })
        
    })

    var canvas = main.append("canvas").style("position", "absolute")
    var svg = main.append("svg").style("position", "absolute")
    var div = main.append("div").style("position", "absolute")
        .style("top", 10).style("left", 10).style("width", 50).style("height", 100)
    var div1 = main.append("div").style("position", "absolute")
    //.style("background-color","#FEF")

    var div2 = main.append("div").style("position", "absolute")
        .style("top", 10).style("left", 3 * container.width / 4).style("width", container.width / 4).style("height", container.width / 4)
        .style("background-color", "#DFD")


    var axesG = svg.append("g").attr("transform", "translate(10,0)")
    var scale = scaleScope();
    var TO = false //resize delay
    var resizePanel = function () {
        dispatch.call("replot", this, {})
    }
    container.on("resize", function (e) {
        if (TO !== false) clearTimeout(TO)
        canvas.attr("height", container.height)
            .attr("width", container.width)
        svg.attr("height", container.height)
            .attr("width", container.width)
        //TODO get a better size
        div1.style("top", 10)
            .style("left", 3 * container.width / 4)
            .style("width", container.width / 4)
            .style("height", container.width / 4)
        scope.edge = container.width - 40
        scope.width = container.width
        scope.height = container.height
        scale.range([0, scope.edge])
        TO = setTimeout(resizePanel, 200)
    })

    var URI = state.URI || server+"/hic/default" //need to set it if could.
    var testBeds = [{
            chr: "chr1",
            start: 0,
            end: 10000000
        },
        {
            chr: "chr2",
            start: 100000,
            end: 10000000
        }
    ]

    var initHic = function (data) {
        hic.opts = data;
        dispatch.call("cfg", this, data)
        init.hic = true;
        var r = state.regions || testBeds
        render(r) //TODO d3 queue ?
    }



    var hics = {
      "options":{},
      "config":{}
    };
    var resetHics = function (k, v) {
      container.extendState({
        "hicsState": hics.config
      })
      URI = server + "/hic/" + v
      H.Get(URI, initHic)
    }
    var hicIO = datgui().callback(resetHics).closable(false)
    var initHics = function(){
      d3.json(server + "/hic/list", function (d) {
        hic.hics = d;
        hics.options = {
          "hic": d
        }
        if (container.getState().hicsState) {
          hics.config = container.getState().hicsState
        } else {
          hics.config = {
            "hic": d[0]
          }
        }

        cfg.selectAll(".hicsgui").remove();
        cfg.selectAll(".hicsgui")
        .data([
          hics
        ])
        .enter()
        .append("div")
        .classed("hicsgui",true)
        .call(hicIO)
        //renderCfg(hics.opts, hics.cfg, callback)
        URI = server + "/hic/" + hics.config.hic
        H.Get(URI, initHic)
      })
    }


    //H.Get(URI, initHic)
    initHics();
    var prefixed = true;
    var renderHic = function (r) {
        var regions ;
        var pre = new RegExp("^chr*")
        var Pre = new RegExp("^Chr*")
        if (pre.test(hic.opts.chrs[1].Name) || Pre.test(hic.opts.chrs[1].Name)) {
          regions = r
        } else {
          regions = toolsTrimChrPrefix(r)
          prefixed = false;
        }
        var hicCb = function (d) {　
            dispatch.call("monitor", this, d)
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = scope.background
            ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40)
        }
        //hic.state = hic.ctrl.state();
        hic.chart = H.canvas() //just for canvas view.
            .URI(URI)
            .norm(hic.state.norm)
            .unit(hic.state.unit)
            .bpres(hic.opts.bpres)
            .xoffset(10)
            .yoffset(scope.edge * 0.5)
            .width(scope.edge)
            .height(scope.edge)
            .regions(regions)
            .panel(main)
            .gap(10)
            .color1(hic.state.color1)
            .color2(hic.state.color2)
            .callback(hicCb)
        canvas.call(hic.chart)
        //TODO Fix OverFlow.
        dispatch.on("domain", function (d) {
            hic.chart.domain(d);
            hic.chart.render(function () {
                var ctx = canvas.node().getContext("2d");
                ctx.fillStyle = scope.background
                ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40)
            });
        })
        dispatch.on("brush", function (d) {
            var data = []
            var rectData = []
            d.forEach(function (d) {
                data.push(scale(d))
            })
            //assume data is sorted.
            var r2 = svg.selectAll(".resp2")
                .data([0])
            r2.enter()
                .append("g")
                .attr("class", "resp2")
                .attr("transform", function (d) {
                    return "translate(" + (scope.edge / 2 + 10) + ",0) rotate(45)"
                })
                .merge(r2)
            if (data.length > 1) {
                var rx = data[0][0][0] / Math.SQRT2
                var rWidth = data[0][0][1] / Math.SQRT2 - rx
                var ry = data[1][0][1] / Math.SQRT2
                var rHeight = ry - data[1][0][0] / Math.SQRT2
                ry = scope.edge / Math.SQRT2 - ry
                var p2 = r2.selectAll("rect")
                    .data([0])
                p2.enter()
                    .append("rect")
                    .merge(p2)
                    .attr("x", rx)
                    .attr("y", ry)
                    .attr("width", rWidth)
                    .attr("height", rHeight)
                    .attr("opacity", 0.2)
                p2.exit().remove()
            } else {
                r2.selectAll("rect").remove()
            }

            var r = svg.selectAll(".resp")
                .data(data)

            r.enter()
                .append("g")
                .merge(r)
                .attr("class", "resp")
                .attr("transform", function (d) {
                    return "translate(" + (d[0][0] + 10) + "," + scope.edge / 2 + ")"
                })
            var p = r.selectAll("path").data(function (d) {
                return [d[0]]
            })
            p.enter()
                .append("path")
                .merge(p)
                .attr("d",
                    d3.symbol().type(symbolTriangle).size(function (d) {
                        return d[1] - d[0]
                    })
                )
                .style("opacity", 0.2)
            r.exit().remove();
        })
    }
    init.panel = false;
    var render = function (d) {
        var ctx = canvas.node().getContext("2d");
        ctx.fillStyle = scope.background
        ctx.fillRect(0, 0, scope.width, scope.height)
        svg.selectAll(".resp").remove()
        svg.selectAll(".resp2").remove()
        var regions = d
        regions = toolsFixRegions(regions)
        container.extendState({
            "regions": d
        });
        state.regions = regions; //TODO FIXed
        scale.domain(regions)
        if (init.hic) {
            renderHic(regions)
        }
    }

    dispatch.on("monitor", function (d) {
        div1.html("")
        var table = div1.append("table").classed("table", true)
            .classed("table-condensed", true)
            .classed("table-bordered", true)
        var keys = Object.keys(d);
        var tr = table.selectAll("tr").data(keys)
            .enter().append("tr")
        tr.append("td").text(function (d0) {
            return d0
        })
        tr.append("td").text(function (d0) {
            return d[d0]
        })
        var k0 = div1.append("div").style("padding-right", "20px")
        var k1 = k0.append("div") //.attr("id","slider101")
        var k2 = k0.append("div")
        var max = d.max > 30000 ? 30000 : d.max
        k2.html("0-" + max)
        $(k1.node()).slider({
            range: true,
            min: 0,
            max: max,
            values: [0, max],
            slide: function (event, ui) {
                k2.html(ui.values[0] + "-" + ui.values[1])
                dispatch.call("domain", this, [ui.values[0], ui.values[1]])
            }
        });
    })

    layout.eventHub.on("update", function (d) {
        /*
        if (fixed){
          return
        }
        */
        if (!container.isHidden) {
            render(d)
        } else {
            state.regions = toolsFixRegions(d);
        }
    })
    layout.eventHub.on("brush", function (d) {
        if (!container.isHidden) {
            dispatch.call("brush", this, d)
        }
    })
    container.on("show", function (d) {
        if (state.regions) {
            render(state.regions)
        }
        console.log("d", d)
        //render(state.regions)
    })
    dispatch.on("replot", function (d) {
        //layout.eventHub.emit("update", state.reigions || testBeds)
        render(state.regions || testBeds)
    })
}
