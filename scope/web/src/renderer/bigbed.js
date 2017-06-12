import B from "../data/bigbed"
import toolsAddChrPrefix from "../tools/addChrPrefix"
import regionsText from "../tools/regionsText"
//TODO Config Part
export default function (layout, container, state, app) {
  var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg", true);
  //cfg.html("TODO CONFIG")
  var content = d3.select(container.getElement()[0]).append("div")
    .classed("content", true)
  var main = content.append("div").style("position", "relative")
  var canvas = main.append("canvas")
  var server = state["server"] || app["server"] || "" //TODO
  var trackNames;
  var init = false
  var dispatch = d3.dispatch("brush", "update","replot")
  var trackConfig = state["trackConfig"] || undefined
  var scope = {
    "edge": 500,
    "background": "#BBB"
  }
  var dbname = state["dbname"] || "bigbed"

  var initTracks = function (data) {
    //console.log("bigwig", data)

    trackNames = data;
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
      trackConfig = text;
      cfg.style("display", "none")
      content.style("display", "block")

      container.extendState({
          "trackConfig":trackConfig
      })
      container.extendState({
          "configView": false
      })
      dispatch.call("replot", this, {})
    })
  }
  B.Get(server + "/"+dbname, initTracks)
  var render = function(d) {
    content.html("todo render" + regionsText(d) )
  }
  var brush = function(d) {
    content.html("todo brush " + regionsText(d))
  }

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
    regions = d
    if (!container.isHidden && init) {
      render(d)
    }
  })
  dispatch.on("replot",function(){
    render(regions)
  })
  dispatch.on("brush",function(d){
    brush(d)
  })
  var resize = function () {
    canvas.attr("height", container.height)
      .attr("width", container.width)
    scope.edge = container.width - 40
    scope.width = container.width
    scope.height = container.height
    if (init) {
      render(regions)
    }
  }
  var TO = false
  container.on("resize", function (e) {
    if (TO !== false) clearTimeout(TO)
    TO = setTimeout(resize, 2000)
  })

}
