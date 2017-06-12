import B from "../data/bigwig"
import toolsAddChrPrefix from "../tools/addChrPrefix"
//TODO Config Part
export default function (layout, container, state, app) {
  var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg", true);
  //cfg.html("TODO CONFIG")
  var content = d3.select(container.getElement()[0]).append("div")
    .classed("content", true)
    .style("background-color", "grey");
  var main = content.append("div")
    //.attr("id","main")
    .style("position", "relative")
  var canvas = main.append("canvas")
  var server = state["server"] || app["server"] || ""
  var bigwig;
  var init = false
  var dispatch = d3.dispatch("brush", "update","replot")
  var bwconfig = state["bwconfig"] || undefined
  var scope = {
    "edge": 500,
    "background": "#BBB"
  }
  var initBw = function (data) {
    //console.log("bigwig", data)
    bigwig = data;
    init = true;
    renderCfg(data)
  }
  var renderCfg = function (data) { // TODO make checkbox working
    var factory = function(d) {
      var a = {}
      d.forEach(function(id){
        a[id]=true
      })
      return a
    }
    var text = factory(data.trackIds)

    var gui = new dat.GUI({ autoPlace: false });
    data.trackIds.forEach(function(d){
      gui.add(text,d)
    })
    //console.log("CFG",cfg.node())
    var container0 = cfg.append("div").node();
    container0.appendChild(gui.domElement)
    cfg.append("div").style("height","25px")
    cfg.append("div").append("input")
    .attr("type","button")
    .attr("value","submit")
    .text("submit")
    .on("click",function(){
      //console.log(text)
      bwconfig = text;
      cfg.style("display", "none")
      content.style("display", "block")

      container.extendState({
          "bwconfig":bwconfig
      })
      container.extendState({
          "configView": false
      })
      dispatch.call("replot", this, {})
    })

  }
  B.Get(server + "/bw", initBw)
  var renderBigwig = function (regions) {
    var ctx = canvas.node().getContext("2d")
    ctx.fillStyle = scope.background;
    ctx.fillRect(0, 0, scope.width, scope.height);
    var bw = []
    var tracks = []
    //TODO : load localStorage configure?
    if (!bwconfig) {
      bigwig.trackIds.forEach(function (b, i) {
        tracks.push(b)
      })
    } else {
      for (var k in bwconfig) {
        if (bwconfig[k]) {
          tracks.push(k)
        }
      }
    }
    tracks.forEach(function (b, i) {
      bw.push(
        B.canvas()
        .URI(server + "/bw") //set this?
        .id(b)
        .x(10)
        .y(40 + i * 80)
        .width(scope.edge)
        .gap(20) //TODO REMV
        .regions(toolsAddChrPrefix(regions))
        .panel(main)
        .mode(1)
        .pos(i)
      )
    })
    dispatch.on("brush.local", function (e) {
      bw.forEach(function (b, i) {
        b.response(e)
      })
    })
    bw.forEach(function (b) {
      canvas.call(b)
    })
  }
  //var svg = content.append("svg").attr("height",container.height).attr("width",container.width)
  var regions = state.regions || [];
  layout.eventHub.on("brush", function (d) {
    //brush = d
    if (!container.isHidden) {
      //div2.html("BRUSHING   " + regionsText(d))
      dispatch.call("brush", this, d)
    }

  })
  layout.eventHub.on("update", function (d) {
    container.extendState({
      "regions": d
    });
    //main.html("")
    regions = d
    if (!container.isHidden && init) {
      //console.log("CALL RENDER BIGWIG",d)
      //div.html("CURRENT   " + regionsText(d))
      renderBigwig(d)
    }
  })
  dispatch.on("replot",function(){
    renderBigwig(regions)
  })
  container.on("show", function (d) {
    //div1.html("WAKEUP "+ regionsText(update))
    //div2.html("WAKEUP BRUSHING "+ regionsText(brush))
    /*
    if (init) {
      renderBigwig(d)
    }
    */
  })
  var resize = function () {
    canvas.attr("height", container.height)
      .attr("width", container.width)


    scope.edge = container.width - 40
    scope.width = container.width
    scope.height = container.height
    if (init) {
      renderBigwig(regions)
    }
  }
  var TO = false
  container.on("resize", function (e) {
    if (TO !== false) clearTimeout(TO)
    TO = setTimeout(resize, 2000)
  })

}
