import B from "../data/bigbed"
import toolsAddChrPrefix from "../tools/addChrPrefix"
import regionsText from "../tools/regionsText"
import coord from "../data/coords"
//TODO Config Part
export default function (layout, container, state, app) {
  var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg", true);
  //cfg.html("TODO CONFIG")
  var content = d3.select(container.getElement()[0]).append("div")
    .classed("content", true)
  var main = content.append("div").style("position", "relative")
  var canvas = content.append("canvas")
  var svg = content.append("svg")
  var server = state["server"] || app["server"] || "" //TODO
  var trackNames;
  var init = false
  var dispatch = d3.dispatch("brush", "update", "replot")
  var trackConfig = state["trackConfig"] || undefined
  var scope = {
    "edge": 500,
    "background": "#BBB"
  }
  var dbname = state["dbname"] || "bigbed"
  var coords

  var initTracks = function (data) {
    //console.log("bigwig", data)

    trackNames = data;
    init = true;
    renderCfg(data)
  }
  var renderCfg = function (data) { // TODO make checkbox working
    var factory = function (d) {
      var a = {}
      d.forEach(function (id) {
        a[id] = true
      })
      return a
    }
    var text = factory(data.trackIds)
    var gui = new dat.GUI({
      autoPlace: false
    });
    data.trackIds.forEach(function (d) {
      gui.add(text, d)
    })
    //console.log("CFG",cfg.node())
    var container0 = cfg.append("div").node();
    container0.appendChild(gui.domElement)
    cfg.append("div").style("height", "25px")
    cfg.append("div").append("input")
      .attr("type", "button")
      .attr("value", "submit")
      .text("submit")
      .on("click", function () {
        //console.log(text)
        trackConfig = text;
        cfg.style("display", "none")
        content.style("display", "block")

        container.extendState({
          "trackConfig": trackConfig
        })
        container.extendState({
          "configView": false
        })
        dispatch.call("replot", this, {})
      })
  }
  B.Get(server + "/" + dbname, initTracks)
  var regions = state.regions || [];
  var render = function (d) {
    main.html("todo render" + regionsText(d))
    svg.selectAll(".resp").remove();
    coords = coord().regions(regions).width(scope.width)
    var ctx = canvas.node().getContext("2d")
    ctx.fillStyle = scope.background
    ctx.fillRect(0,0,scope.width,scope.height)
    //TODO Add Ids
    var i = 0;
    var height = 25;
    for (var id in trackConfig) {
      if(trackConfig[id]) {
        var chart = B.canvas().coord(coords).regions(regions).URI(server + "/" + dbname).id(id).y(i*height)
        canvas.call(chart)
        i+=1
      }
    }
  }
  var brush = function (d) {
    main.html("todo brush " + regionsText(d))
    var r = coords(d)
    var resp = svg.selectAll(".resp")
      .data(r)
    resp.exit().remove()
    resp.enter()
      .append("g")
      .attr("class", "resp")

      .merge(resp)
      .attr("transform",function(d){
        return "translate("+d.x+",0)"
      })
   var rect = resp.selectAll("rect")
      .data(function(d){
        return [d]
      })
      rect.enter()
      .append("rect")
      .merge(rect)
      .attr("height", scope.height)
      .attr("width", function (d) {
        return d.l > 1 ? d.l : 1
      })
      .attr("fill", "black")
      .attr("opacity", 0.2)

  }

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
  dispatch.on("replot", function () {
    render(regions)
  })
  dispatch.on("brush", function (d) {
    brush(d)
  })
  var resize = function () {
    canvas.attr("height", container.height)
      .attr("width", container.width)
    svg.attr("height", container.height)
        .attr("width", container.width)
    scope.edge = container.width - 40
    scope.width = container.width
    scope.height = container.height
    if (init) {
      coords.regions(regions).width(scope.width)
      render(regions)
    }
  }
  var TO = false
  container.on("resize", function (e) {
    if (TO !== false) clearTimeout(TO)
    TO = setTimeout(resize, 2000)
  })

}
