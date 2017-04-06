import regionText from "../tools/regionText"
import regionsText from "../tools/regionsText"
import addChrPrefix from "../tools/addChrPrefix"
var defaultConfig = {
  "color" : "#111"
}
var ucsc = function(org,db,position,width) {
  return "http://genome.ucsc.edu/cgi-bin/hgTracks?org="+org+"&db="+db+"&position="+regionText(position)+"&pix="+width
}
export default function(layout, container, state) {
    var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg",true);
    var content = d3.select(container.getElement()[0]).append("div").classed("content",true);
    var div1 = content.append("div").style("position","relative").style("overflow-y","scroll");
    console.log(container.height);
    console.log(container.width)
    var svg = content.append("svg")

      .style("position","absolute")
    //state.config parameters.
    /* render config panel and configs */
    var setiframe = function(div,  d) {
      div.selectAll("iframe").remove()
      var iframe = div.selectAll("iframe").data(d)
      iframe.enter()
       .append("iframe")
       .style("position","absolute")
       .style("top",-150)
       .style("left",-10)
       .style("border",0)
       .style("width",container.width)
       .style("height",container.height+150)
       .merge(iframe)
       .attr("src",function(d){return ucsc("human","hg19",d,container.width)}) //TODO set other org
       svg.attr("height",container.height+"px")
       .attr("width",container.width+"px")
    }
    //var config = state.config || defaultConfig
    //TODO FORM state();
    //change title form;


    //container.extendState({"config":config})

    /* render content */
    var brush = [] // instant states not store in container
    var update = state.regions || []

    //div1.style("color",config.color)
    layout.eventHub.on("brush", function(d) {
        brush = addChrPrefix(d)
        //TODO

    })
    layout.eventHub.on("update", function(d) {
       update = addChrPrefix(d);
       setiframe(div1, update)
    })

    container.on("show",function(d) {
      setiframe(div1,update)
    })
}
