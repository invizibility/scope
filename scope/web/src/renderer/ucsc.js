import addChrPrefix from "../tools/addChrPrefix"
import scaleScope from "../scaleScope"
import ucsc from "../tools/ucsclink"

var defaultConfig = {
  "color" : "#111"
}
var labelLength = 105;

export default function(layout, container, state, app) {
    var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg",true);
    var content = d3.select(container.getElement()[0]).append("div").classed("content",true);
    var div1 = content.append("div").style("position","relative")
    var svg = content.append("svg")
      .style("position","absolute")
      .style("pointer-events","none")
    var scale = scaleScope().gap(10+labelLength)

    //state.config parameters.
    /* render config panel and configs */
    var setiframe = function(div,  d) {
      scale.domain(d).range([10+labelLength,container.width-10]) //padding = 10
      var gbdiv = div.selectAll(".gbdiv")
        .data(d)
      svg.selectAll("rect").remove();
      gbdiv.selectAll("iframe").remove();
      gbdiv.enter().append("div")
        .classed("gbdiv",true)
        .merge(gbdiv)
        .style("position","absolute")
        .style("top",0)
        .style("left",function(d,i){
          var p = scale(d)
          return p[0][0] - labelLength
        })
        .style("width",function(d,i){
          var p = scale(d)
          return p[0][1]-p[0][0] + labelLength
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
          return p[0][1]-p[0][0] + labelLength
        })
        .style("height",container.height+200)
        .attr("src",function(d){
          var p = scale(d)
          var w = p[0][1]-p[0][0] + labelLength
          return ucsc(app.species ||  "human", app.genome || "hg19",d,w)
        }
        )
      gbdiv.exit().remove();

       svg.attr("height",container.height+"px")
       .attr("width",container.width+"px")
    }
    var brush = [] // instant states not store in container
    var update = state.regions || []

    layout.eventHub.on("brush", function(d) {
      if(!container.isHidden){
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
      }

    })
    layout.eventHub.on("update", function(d) {
       update = addChrPrefix(d);
       if (!container.isHidden) {
         setiframe(div1, update)
       }
    })

    container.on("show",function(d) {
      setiframe(div1,update)
    })
}
