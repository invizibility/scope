//TODO replace daslink ucsclink and washulink. add customized templates.

import addChrPrefix from "../tools/addChrPrefix"
import regionText from "../tools/regionText"
function das(db,coords,type) {
  return "http://genome.ucsc.edu/cgi-bin/das/"+db+"/features?segment="+regionText(coords).replace("chr","").replace("-",",")+";type="+type
}
function ucsc(org,db,position,width) {
  return "http://genome.ucsc.edu/cgi-bin/hgTracks?org="+org+"&db="+db+"&position="+regionText(position)+"&pix="+width
}
function washu(db,position) {
  return "http://epigenomegateway.wustl.edu/browser/?genome="+db+"&coordinate="+regionText(position)
}
var defaultConfig = {
  "color" : "#111",
  "server" : "ucsc"
}

var ml = ["ucsc","washu","das"]

export default function(layout, container, state, app) {
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
       .on("click",function(d){
         var url="#";
         switch(config.server) {
           case "ucsc":
              url = ucsc( app.species || "human", app.genome || "hg19",d,800)
              break;
           case "das":
              url = das(app.genome || "hg19",d, app.dasType || "refGene")
              break;
           case "washu":
              url = washu( app.genome || "hg19",d)
              break;
           default:
              url = "#"
         }
         var newWindow = window.open(url, "", "width=800,height=500")
         layout.eventHub.on("update",function(){
           newWindow.close();
         })
         //return url//TODO SET CONFIG STATE
       }) //TODO set other org
       //.attr("target","_blank")
       .on("mouseover",function(d){
         d3.select(this).style("color","red")
       })
       .on("mouseout",function(d){
         d3.select(this).style("color","black")
       })
       .text(function(d,i){
         return "Region "+(i+1)
       })
    }
    var config = state.config || defaultConfig
    /* render content */
    var brush = [] // instant states not store in container
    var update = state.regions || []
    container.setTitle(config.server +" links"|| "links")
    var c = cfg.append("input")
      .attr("type","color")
      .attr("value",config.color)
    var s = cfg.append("select")
    s.selectAll("option").data(ml).enter()
    .append("option").attr("value",function(d){
      return d
    }).text(function(d){return d})
    cfg.append("input")
       .attr("type","button")
       .attr("value","submit")
       .on("click",function(){
         cfg.style("display","none") //jQuery .hide()
         content.style("display","block") //jQuery .show()
         container.extendState({
           "configView":false,
           "config":{"color":c.node().value, "server": s.node().value}
         })
         config.color = c.node().value
         config.server = s.node().value
         setdiv(div1,"current",update)
         if (brush !== undefined) {
           setdiv(div2,"brushing", brush)
         }
         container.setTitle(config.server+" links")
         div1.style("color",config.color) //TODO dispatch mode.
       })

    div1.style("color",config.color) // TODO.
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
