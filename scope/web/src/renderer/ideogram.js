
//app is global var
import regionText from "../tools/regionText"
import regionsText from "../tools/regionsText"
import randomString from "../tools/randomString"
function getTrimChrNames(a) {
  var names = [];
  a.forEach(function(d){
    names.push(d.chr.replace("chr","").replace("Chr",""))
  })
  return names
}
function getChrNames(a) {
  var names = [];
  a.forEach(function(d){
    names.push(d.chr)
  })
  return names
}
export default function(layout,container,state,app) {
  var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg",true);
  var content = d3.select(container.getElement()[0]).append("div").classed("content",true);
　var id = randomString(8)
  var div1 = content.append("div")
  var div = content.append("div").attr("id",id)
  //var svg = content.append("svg").attr("height",container.height).attr("width",container.width)
  layout.eventHub.on("brush", function(d) {
      //brush = d
      if(!container.isHidden){
        //div2.html("BRUSHING   " + regionsText(d))
      }

  })
  layout.eventHub.on("update", function(d) {
     console.log("updating",d)
     container.extendState({"regions":d});
     div.html("")
     div1.html("CURRENT   " + regionsText(d))
     if(!container.isHidden){
       //div.html("CURRENT   " + regionsText(d))
       var config = {
                container: "#"+id,
                organism: "human",
                //organism: app.species,
                chromosomes: getTrimChrNames(d),
                //chromosomes: d[0].chr.replace("chr",""),
                brush: false,
                chrHeight: 300,
                chrWidth: 10,
                rotatable: false,
                orientation: "horizontal"
                //onBrushMove: writeSelectedRange1,
                //onLoad: writeSelectedRange1
            };

      var ideogram = new Ideogram(config);
      console.log(ideogram)

     }
  })
  container.on("show",function(d) {
    //div1.html("WAKEUP "+ regionsText(update))
    //div2.html("WAKEUP BRUSHING "+ regionsText(brush))
  })
  var resize = function() {
    /*
     svg.attr("height", container.height)
        .attr("width", container.width)
    */
  }
  var TO = false
  container.on("resize", function (e) {
      if (TO !== false) clearTimeout(TO)
      TO = setTimeout(resize, 200)
  })

}
