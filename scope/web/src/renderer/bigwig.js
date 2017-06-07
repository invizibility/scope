import B from "../data/bigwig"
import toolsAddChrPrefix from "../tools/addChrPrefix"

export default function(layout,container,state,app) {
  var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg",true);
  var content = d3.select(container.getElement()[0]).append("div").classed("content",true);
  var main = content.append("div").attr("id","main").style("position","relative")
  var canvas = main.append("canvas")
  var server = state["server"] || app["server"] || ""
  var bigwig;
  var init = false
  var dispatch = d3.dispatch("brush","update")
  var scope = {
    "edge" : 500
  }
  var initBw = function (data) {
      console.log("bigwig", data)
      bigwig = data;
      init = true;
  }
  B.Get(server+"/bw", initBw)
  var bwconfig = state["bwconfig"] || undefined
  var renderBigwig = function (regions) {
      var bw = []
      var tracks = []
      //TODO : load localStorage configure?
      if (!bwconfig) {
          bigwig.trackIds.forEach(function (b, i) {
              tracks.push(b)

          })
      } else {
          bwconfig.data.forEach(function (d) {
              if (d.values[1] == "show") {
                  tracks.push(d.values[0])
              }
          })
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
  layout.eventHub.on("brush", function(d) {
      //brush = d
      if(!container.isHidden){
        //div2.html("BRUSHING   " + regionsText(d))
        dispatch.call("brush",this,d)
      }

  })
  layout.eventHub.on("update", function(d) {
     container.extendState({"regions":d});
     //main.html("")
     regions = d
     if(!container.isHidden && init){
       //console.log("CALL RENDER BIGWIG",d)
       //div.html("CURRENT   " + regionsText(d))
       renderBigwig(d)
     }
  })
  container.on("show",function(d) {
    //div1.html("WAKEUP "+ regionsText(update))
    //div2.html("WAKEUP BRUSHING "+ regionsText(brush))
    /*
    if (init) {
      renderBigwig(d)
    }
    */
  })
  var resize = function() {
    canvas.attr("height", container.height)
        .attr("width", container.width)
    scope.edge = container.width - 40
    scope.width = container.width
    scope.height = container.height
    if (init){
      renderBigwig(regions)
    }
  }
  var TO = false
  container.on("resize", function (e) {
      if (TO !== false) clearTimeout(TO)
      TO = setTimeout(resize, 2000)
  })

}
