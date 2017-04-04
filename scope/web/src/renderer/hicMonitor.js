import B from "../data/bigwig"
import H from "../data/hic2"
import toolsFixRegions from "../tools/fixRegions"
import toolsAddChrPrefix from "../tools/addChrPrefix"
//import brush from "../scopebrush" //TODO

export default function(layout, container, state) {
    //TODO RM Global Variables, make it as a renderer in Snow;
    var scope = {
      "background":"#BBB"
    }
    var init = {
      "bigwig":false,
      "hic":false
    }
    var hic = {
    }
    var dispatch = d3.dispatch("update","brush","cfg","replot","domain","monitor")
    var main = d3.select(container.getElement()[0])
          .append("div")
          .attr("class","content")
          .style("position", "relative")
    var cfg = d3.select(container.getElement()[0])
          .append("div")
          .attr("class","cfg")
    var sign = false
    dispatch.on("cfg", function(data) {
              hic.ctrl = H.chart().data(data)
              console.log("hic state", container.getState().state)
              cfg.call(hic.ctrl)
              if (container.getState().state && sign == false) {
                  hic.ctrl.state(container.getState().state)
                  sign = true; //load once.
              } else {
                  container.extendState({"state":hic.ctrl.state()})
              }
              cfg.append("input")
                .attr("type","button")
                .attr("value","submit")
                .on("click", function(d){
                  container.extendState({"state":hic.ctrl.state()})
                  container.extendState({"configView":false})
                  cfg.style("display","none")
                  main.style("display","block")
                  dispatch.call("replot",this,{})
                })
          })

    var canvas = main.append("canvas").style("position","absolute")
    var svg = main.append("svg").style("position","absolute")
    var div = main.append("div").style("position", "absolute")
        .style("top", 10).style("left", 10).style("width", 50).style("height", 100)
    var div1 = main.append("div").style("position", "absolute")
        //.style("background-color","#FEF")

    var div2 =  main.append("div").style("position", "absolute")
        .style("top", 10).style("left", 3*container.width/4).style("width", container.width / 4).style("height", container.width/4)
        .style("background-color","#DFD")


    var axesG = svg.append("g").attr("transform", "translate(10,0)")
    container.on("resize", function(e) {
        canvas.attr("height", container.height)
            .attr("width", container.width)
        svg.attr("height", container.height)
            .attr("width", container.width)
        div1.style("top",10)
            .style("left",3*container.width/4)
            .style("width",container.width/4)
            .style("height",container.width/4)
        scope.edge = container.width - 40
        scope.width = container.width
        scope.height = container.height
        dispatch.call("replot",this,{})
    })

    var URI = "/hic" //need to set it if could.
    var testBeds = [{
            chr: "1",
            start: 0,
            end: 10000000
        },
        {
            chr: "2",
            start: 100000,
            end: 10000000
        }
    ]
    var initHic = function(data) {
        hic.opts = data;
        dispatch.call("cfg", this , data)
        init.hic = true;
        var r = state.regions || testBeds
        render(r) //TODO d3 queue ?
    }


    H.Get(URI, initHic)
    var renderHic = function(regions) {

        var hicPara = function(d) {
            dispatch.call("monitor", this, d)
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = scope.background
            ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40)
        }
        hic.state = hic.ctrl.state();
        hic.chart = H.canvas()
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
            .color1(hic.state.color1)
            .color2(hic.state.color2)
            .callback(hicPara)
        canvas.call(hic.chart)
        //TODO Fix OverFlow.
        dispatch.on("domain",function(d){
          hic.chart.domain(d);
          hic.chart.render();
        })
    }
    var render = function(d) {
        var ctx = canvas.node().getContext("2d");
        ctx.fillStyle = scope.background
        ctx.fillRect(0, 0, scope.width, scope.height)
        var regions = d
        regions = toolsFixRegions(regions)
        container.extendState({
            "regions": d
        });
        state.regions = regions; //TODO FIXed
        if (init.hic) {
            renderHic(regions)
        }
    }

    dispatch.on("monitor", function(d){
      div1.html(JSON.stringify(d,2,2))//TODO renders.
    })

    layout.eventHub.on("update", function(d) {
        render(d)
    })
    layout.eventHub.on("brush", function(d) {
       dispatch.call("brush",this,d)
    })
    dispatch.on("replot", function(d) {
        //layout.eventHub.emit("update", state.reigions || testBeds)
        render(state.regions || testBeds)
    })
}
