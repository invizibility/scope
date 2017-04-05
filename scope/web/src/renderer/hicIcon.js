import B from "../data/bigwig"
import H from "../data/hic2"
import toolsFixRegions from "../tools/fixRegions"
import toolsAddChrPrefix from "../tools/addChrPrefix"
import scaleScope from "../scaleScope"
import symbolTriangle from "../symbol/triangle"
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
              console.log("hic state", state.state)
              cfg.call(hic.ctrl)

              if (state.state && sign == false) {
                  hic.ctrl.state(container.getState().state)
                  sign = true; //load once.
              } else {
                  container.extendState({"state":hic.ctrl.state()})
              }
              var uri = cfg.append("input")
                .attr("type","text")
                .attr("value",state.URI || "/hic")

              cfg.append("input")
                .attr("type","button")
                .attr("value","submit")
                .on("click", function(d){
                  container.extendState({"state":hic.ctrl.state()})
                  container.extendState({"configView":false})
                  container.extendState({"URI":uri.node().value})
                  if (uri.node().value != URI) {
                      URI=uri.node().value;
                      H.Get(URI,initHic)
                  }

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
    var scale = scaleScope();

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

        scale.range([0,scope.edge])

        dispatch.call("replot",this,{})
    })

    var URI = state.URI || "/hic" //need to set it if could.
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

        var hicCb = function(d) {　
            dispatch.call("monitor", this, d)
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = scope.background
            ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40)
        }
        hic.state = hic.ctrl.state();
        hic.chart = H.canvas()  //just for canvas view.
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
        dispatch.on("domain",function(d){
          hic.chart.domain(d);
          hic.chart.render();
        })
        dispatch.on("brush",function(d){
          console.log("icon brush",d)
          var data =[]
          var rectData = []
          d.forEach(function(d){
            data.push(scale(d))
          })
          //assume data is sorted.
          console.log("icon convert to data",data)
          var r2 = svg.selectAll(".resp2")
            .data([0])
          r2.enter()
          .append("g")
          .attr("class","resp2")
          .attr("transform",function(d){
            return "translate(" + (scope.edge/2+10) +",0) rotate(45)"
          })
          .merge(r2)
          if (data.length > 1) {
            var rx = data[0][0][0]/Math.SQRT2
            var rWidth = data[0][0][1]/Math.SQRT2 - rx
            var ry = data[1][0][1]/Math.SQRT2
            var rHeight = ry - data[1][0][0]/Math.SQRT2
            ry = scope.edge/Math.SQRT2 - ry
            var p2 = r2.selectAll("rect")
            .data([0])
            console.log(rx,ry,rWidth,rHeight,"xywh")
            p2.enter()
              .append("rect")
              .merge(p2)
              .attr("x",rx )
              .attr("y",ry)
              .attr("width",rWidth)
              .attr("height",rHeight)
              .attr("opacity",0.2)
            p2.exit().remove()
          } else {
            r2.selectAll("rect").remove()
          }

          var r = svg.selectAll(".resp")
             .data(data)

            r.enter()
            .append("g")
            .merge(r)
            .attr("class","resp")
            .attr("transform",function(d){
              return "translate("+(d[0][0]+10)+","+scope.edge/2+")"
            })
            var p = r.selectAll("path").data(function(d){return [d[0]]})
            p.enter()
            .append("path")
            .merge(p)
            .attr("d",
              d3.symbol().type(symbolTriangle).size(function(d){
                console.log("d",d)
                return d[1]-d[0]
              })
            )
            .style("opacity", 0.5)
            r.exit().remove();
        })
    }
    var chromosome = function(d) {
      var r ={}
      d.forEach(function(d){
        if (!r[d.chr]) {
          r[d.chr]=1
        }
      })
      var v=[]
      Object.keys(r).forEach(function(d){
        v.push({"chr":d,"start":1,"end":200000000})
      })
      return v;
    }
    var render = function(d) {
        var ctx = canvas.node().getContext("2d");
        ctx.fillStyle = scope.background
        ctx.fillRect(0, 0, scope.width, scope.height)
        //svg.selectAll(".resp").remove()
        //svg.selectAll(".resp2").remove()
        var regions = toolsFixRegions(d)
        var chrs = chromosome(regions)
        container.extendState({
            "regions": chrs
        });
        state.regions = chrs; //TODO FIXed
        scale.domain(chrs)
        if (init.hic) {
            renderHic(chrs)
        }
       dispatch.call("brush",this,regions)
    }

    dispatch.on("monitor", function(d){
      div1.html(JSON.stringify(d,2,2))//TODO renders.
    })

    layout.eventHub.on("update", function(d) {
        render(d)
    })
    layout.eventHub.on("brush", function(d) {
    })
    dispatch.on("replot", function(d) {
        //layout.eventHub.emit("update", state.reigions || testBeds)
        render(state.regions || testBeds)
    })
}
