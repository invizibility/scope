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
var testBeds = [{
    chr: "chr1",
    start: 0,
    end: 10000000
  },
  {
    chr: "chr2",
    start: 100000,
    end: 10000000
  }
]
var regions = testBeds
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
  d3.select(d3.select(container.getElement()[0]).parentNode).style("overflow-y", "scroll")
  var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg", true);
  var content = d3.select(container.getElement()[0]).append("div").classed("content", true).style("overflow-y", "scroll");
  var dispatch = d3.dispatch("resize", "update", "brush")
  content.style("padding-left", "10px")
  var gbtable = content.append("table").classed("gbtable", true).style("table-layout", "fixed")
  var gbtbody = gbtable.append("tbody")
  var tracks = [];
  var trackViews = [];
  //gbtable.merge()

  var heights = {
    "hic": container.width / 2,
    "bigwig": 40,
    "bigbed": 30
  }
  var q = d3.queue();
  var render = function () {
    gbtbody.selectAll("tr").remove();
    var bw = [];
    trackViews.forEach(function (d, i) {
      var tr = gbtbody.append("tr").attr("id", d.prefix + ":" + d.format + ":" + d.id)
      var handle = tr.append("td").classed("dragHandle", true).style("width", 10).style("background-color", '#' + Math.floor(Math.random() * 16777215).toString(16))
      var label = tr.append("td").classed("trackLabel", true).style("width", 80).style("text-align", "right").style("padding-right", 10).text(d.id)
      var view = tr.append("td")
        .classed("trackView", true)
        .style("width", container.width - 120)
        .style("height", heights[d.format])
      var viewDiv = view.append("div").style("position", "relative").style("height", "100%").style("width", "100%").style("padding-right", "0px")
        .style("background-color", '#' + Math.floor(Math.random() * 16777215).toString(16))
      var canvas = viewDiv.append("canvas")
        .attr("width", container.width - 120)
        .attr("height", heights[d.format])
      var ctx = canvas.node().getContext("2d")
      ctx.fillStyle = "grey"
      ctx.fillRect(0, 0, container.width - 120, heights[d.format])
      if (d.format == "bigwig") {
        var b = bigwigCanvas()
          .URI("/" + d.prefix) //set this?
          .id(d.id)
          .x(0)
          .y(0)
          .width(container.width - 120)
          .barHeight(_barHeight)
          .gap(10) //TODO REMV
          .regions(toolsAddChrPrefix(regions))
          .panel(viewDiv)
          .mode(1)
        bw.push(b)
        canvas.call(b)
      }
      dispatch.on("brush.local", function (e) {
        bw.forEach(function (b, i) {
          b.response(e)
        })
      })

    })
    $(gbtable.node()).tableDnD({
      onDrop: function (table, row) {
        var rows = table.tBodies[0].rows;
        trackViews = []
        var debugStr = "Row dropped was " + row.id + ". New order: ";
        for (var i = 0; i < rows.length; i++) {
          debugStr += rows[i].id + " ";
          var x=rows[i].id.split(":")
          trackViews.push({
            "prefix": x[0],
            "format": x[1],
            "id": x[2]
          })
        }
        console.log(debugStr)
      },
      dragHandle: ".dragHandle"
    })
  }
  var initTracks = function () {
    tracks.forEach(function (d, i) {
      d.forEach(function (d, j) {
        trackViews.push({
          "prefix": trackdbs[i].prefix,
          "format": trackdbs[i].format,
          "id": d
        })
      })
    })
    render()
  }
  trackdbs.forEach(function (db) {
    q.defer(d3.json, "/" + db.prefix + "/list")
  })
  q.awaitAll(function (error, results) {
    tracks = results;
    initTracks();

  })

  container.on("resize", function (e) {
    heights["hic"] = (container.width - 110) / 2;
    render();
    content.selectAll(".trackView").style("width", container.width - 110)
    content.selectAll(".trackView").selectAll("canvas").attr("width", container.width - 110)
  })
  layout.eventHub.on("update", function (d) {
    container.extendState({
      "regions": d
    });
    regions = d
    if (!container.isHidden) {
      render(d)
    }
  })
  layout.eventHub.on("brush", function (d) {
    if (!container.isHidden) {
      dispatch.call("brush", this, d)
    }

  })
}
