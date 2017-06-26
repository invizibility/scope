/*　Scope Genome Browser Panel */
import B from "../data/bigwig"
import bigwigCanvas from "../data/bigwig2"
import BB from "../data/bigbed"
import H from "../data/hic2"
import toolsFixRegions from "../tools/fixRegions"
import toolsTrimChrPrefix from "../tools/trimChrPrefix"
import toolsAddChrPrefix from "../tools/addChrPrefix"
import brush from "../scopebrush"
import coord from "../data/coords"
import datgui from "../datgui"

import {
  default as constant
} from "../data/hicvar"
const norms = constant().norms
const units = constant().units
const _barHeight = 30
export default function (layout, container, state, app) {
  var trackdbs = [{
      "prefix": "hic",
      "format": "hic"
    },
    {
      "prefix": "bw",
      "format": "bigwig"
    },
    {
      "prefix": "bigbed",
      "format": "bigbed"
    }
  ]
  //$('#container').parent().css("overflow-y","scroll");
  d3.select(d3.select(container.getElement()[0]).parentNode).style("overflow-y","scroll")
  var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg", true);
  var content = d3.select(container.getElement()[0]).append("div").classed("content", true).style("overflow-y","scroll");
  var dispatch = d3.dispatch("resize")
  var gbtable = content.append("table").classed("gbtable",true).style("table-layout","fixed")
      //gbtable.merge()
  var heights = {
    "hic":container.width/2,
    "bigwig":40,
    "bigbed":30
  }

  trackdbs.forEach(function (db) {
    //content.append("div").text(JSON.stringify(d))
    d3.json("/" + db.prefix + "/list", function (d) {
      d.forEach(function(d){
        var tr = gbtable.append("tr")
        var label = tr.append("td").classed("trackLabel",true).style("width",110).style("text-align","right").style("padding-right",10).text(d)
        var view = tr.append("td")
          .classed("trackView",true)
          .style("width",container.width - 110)
          .style("height",heights[db.format])
        var viewDiv = view.append("div").style("postion","relative").style("height","100%").style("width","100%")
          .style("background-color",'#'+Math.floor(Math.random()*16777215).toString(16))

        var canvas = viewDiv.append("canvas")
          .attr("width",container.width -110)
          .attr("height",heights[db.format])
        var ctx = canvas.node().getContext("2d")
        ctx.fillStyle = "red"
        ctx.fillRect(0,0,40,10)
      })
    })
  })

  //var TO = false
  container.on("resize", function (e) {
    //if (TO !== false) clearTimeout(TO)
    heights["hic"] = (container.width-110)/2;
    content.selectAll(".trackView").style("width",container.width-110)
    content.selectAll(".trackView").selectAll("canvas").attr("width",container.width-110)

    //TO = setTimeout(resizePanel, 2000)
  })
}
