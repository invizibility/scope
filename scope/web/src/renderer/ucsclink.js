import regionText from "../tools/regionText"
import regionsText from "../tools/regionsText"
import addChrPrefix from "../tools/addChrPrefix"
var defaultConfig = {
  "color" : "#111"
}
var ucsc = function(org,db,position) {
  return "http://genome.ucsc.edu/cgi-bin/hgTracks?org="+org+"&db="+db+"&position="+regionText(position)
}
export default function(layout, container, state) {
    var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg",true);
    var content = d3.select(container.getElement()[0]).append("div").classed("content",true);
    var div1 = content.append("div");
    var div2 = content.append("div");
    //state.config parameters.
    /* render config panel and configs */
    var setdiv = function(div, title, d) {
      div.selectAll("*").remove()
      div.append("span").text(title)
      var ul = div.append("ul")
      var li = ul.selectAll("li").data(d)
      li.enter()
       .append("li")
       .merge(li)
       .append("a")
       .attr("href",function(d){return ucsc("human","hg19",d)}) //TODO set other org
       .attr("target","_blank")
       .text(function(d,i){
         return "Region "+(i+1)
       })
    }
    var config = state.config || defaultConfig
    //TODO FORM state();
    //change title form;


    //container.extendState({"config":config})

    /* render content */
    var brush = [] // instant states not store in container
    var update = state.regions || []

    div1.style("color",config.color)
    layout.eventHub.on("brush", function(d) {
        brush = addChrPrefix(d)
        setdiv(div2,"brushing",brush)

    })
    layout.eventHub.on("update", function(d) {
       update = addChrPrefix(d);
       setdiv(div1,"current", update)
       div2.selectAll("*").remove();
    })

    container.on("show",function(d) {
      setdiv(div1,"current",update)
      setdiv(div2,"brushing", brush)
    })
}
