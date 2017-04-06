import regionText from "../tools/regionText"
import regionsText from "../tools/regionsText"
import addChrPrefix from "../tools/addChrPrefix"
import scaleScope from "../scaleScope"
var defaultConfig = {
  "color" : "#111"
}
var ucsc = function(org,db,position,width) {
  return "http://genome.ucsc.edu/cgi-bin/hgTracks?org="+org+"&db="+db+"&position="+regionText(position)+"&pix="+width
}
export default function(layout, container, state) {
    var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg",true);
    var content = d3.select(container.getElement()[0]).append("div").classed("content",true);
    var div1 = content.append("div").style("position","relative")
    var svg = content.append("svg")
      .style("position","absolute")
    var scale = scaleScope()

    //state.config parameters.
    /* render config panel and configs */
    var setiframe = function(div,  d) {
      scale.domain(d).range([10,container.width-10]) //padding = 10
      var gbdiv = div.selectAll(".gbdiv")
        .data(d)
      gbdiv.selectAll("iframe").remove();
      gbdiv.enter().append("div")
        .classed("gbdiv",true)
        .merge(gbdiv)
        .style("position","absolute")
        .style("top",0)
        .style("left",function(d,i){
          var p = scale(d)
          return p[0][0]
        })
        .style("width",function(d,i){
          var p = scale(d)
          return p[0][1]-p[0][0]
        })
        .style("height",container.height)
        .style("background-color","#FFF")
        .append("iframe") //TODO
        .style("position","absolute")
        .style("top",-200)
        .style("left",-12)
        .style("border",0)
        .style("width",function(d){
          var p = scale(d)
          return p[0][1]-p[0][0]
        })
        .style("height",container.height+200)
        .attr("src",function(d){
          var p = scale(d)
          var w = p[0][1]-p[0][0]
          return ucsc("human","hg19",d,w)
        }
        )
      gbdiv.exit().remove();
      /*
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
       */
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
        var pos=[]
        brush.forEach(function(d){
          var p = scale(d)
          var p0 = p[0]
          pos.push(p0)
          console.log("p0",p0)
        })
        var rect = svg.selectAll("rect").data(pos)

        rect.enter().append("rect")
        .merge(rect)
        .attr("x",function(d){return d[0]})
        .attr("y", 0)
        .attr("width",function(d){return d[1]-d[0]})
        .attr("height",container.height)
        .attr("opacity",0.2)
        rect.exit().remove()

    })
    layout.eventHub.on("update", function(d) {
       update = addChrPrefix(d);
       setiframe(div1, update)
    })

    container.on("show",function(d) {
      setiframe(div1,update)
    })
}
