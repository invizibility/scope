//var HiC = HiC || {};
//var BigWig = BigWig || {};
var snow = snow || {};
snow.dataBigwig = {};
snow.dataHic = {};

(function(B){
  B.Get = function(URI,callback) {
      var config = {}
      var ready = function(error,results){
        config.URI = URI
        config.chrs = results[0]
        config.binsizes = results[1]
        callback(config)
      }
      d3_queue.queue(2)
      .defer(d3.json, URI + "/list")
      .defer(d3.json, URI + "/binsizes")
      .awaitAll(ready);
    }
  B.chart = function(){

  }
}(snow.dataBigwig));

(function(S){
  S.regionForm = function(d) { //regionForm
  var chrs
  var regionNum
  var regions;
  var form = {"chrs":[],"ses":[]}
  var chart = function(selection) {
    var data = []
    for(var i=0;i<regionNum;i++){
      data.push(chrs)
    }
    //TODO RegionNum Selection.
    selection
      .selectAll("div")
      .data(data)
      .enter()
      .append("div")
      .call(chrOpts)
  }
  var default_range = function(length) {
      return Math.round(length * 2 / 10) + "-" + Math.round(length * 3 / 10)
  }
  var chrOpts = function(selection) {
      selection.each(function(chrs, i) {
          //d3.select(this).selectAll("div").remove()
          var div = d3.select(this)
          var id = "region" + i
          div.append("label")
              .attr("for", id)
              .text(id)
          var sel = div.append("select").classed("form-control", true).attr("id", id)
          form["chrs"].push(sel)
          form["chrs"][i].selectAll("option")
              .data(chrs)
              .enter()
              .append("option")
              .attr("value", function(d, i) {
                  return i
              })
              .attr("length", function(d, i) {
                  return d.Length
              })
              .text(function(d, i) {
                  return d.Name
              })
          var name;
          var length;
          sel.on("change", function(d) {
              lendiv.html("Name:" + chrs[this.selectedIndex].Name + " Length:" + chrs[this.selectedIndex].Length)
              name = chrs[this.selectedIndex].Name;
              length = chrs[this.selectedIndex].Length;
              form["ses"][i].node().value = default_range(length)
          })

          var lendiv = d3.select(this).append("div")
          var inputdiv = d3.select(this).append("div")
          var se = inputdiv.append("input")
              .attr("id", "region" + i + "se")
              .style("width", "160px") //TODO remove ID and get state.
          form["ses"].push(se)
      })

  }
  chart.regions = function(){ //return regions or set regions function.
    //var num = d3.select("#regionNum").node().value
    var regions = []
    for (var i = 0; i < regionNum; i++) {
        var chr = form["chrs"][i].node().value
        var se = form["ses"][i].node().value
        //console.log(chr, se)
        var x = se.split("-")
        regions.push({
            "chr": chr,
            "start": +x[0],
            "end": +x[1]
        })
    }
    return regions
  }
  chart.regionNum = function(_) { return arguments.length ? (regionNum= _, chart) : regionNum; }
  chart.chrs = function(_) { return arguments.length ? (chrs= _, chart) : chrs; }
  return chart
  }
}(snow));
(function(H){
  var norms = [
      "NONE",
      "VC",
      "VC_SQRT",
      "KR",
      "GW_KR",
      "INTER_KR",
      "GW_VC",
      "INTER_VC",
      "LOADED"
  ]
  var units = ["BP", "FRAG"]
  var default_range = function(length) {
      return Math.round(length * 2 / 10) + "-" + Math.round(length * 3 / 10)
  }
  var totalLength = function(regions) {
      var l = 0;
      regions.forEach(function(r, i) {
          l += (+r.end) - (+r.start)
      })
      return l
  }

  H.Get = function(URI,callback) {
    var ready = function(error, results) {
      if (error) throw error;
      var config = {}
      config.URI = URI
      config.norms = results[0]
      config.units = results[1]
      config.chrs = results[2]
      config.chr2idx = {}
      config.chrs.forEach(function(d, i) {
          config.chr2idx[d] = i
      })
      config.bpres = results[3]
      callback(config)
    }
    d3_queue.queue(2)
        .defer(d3.json, URI + "/norms")
        .defer(d3.json, URI + "/units")
        .defer(d3.json, URI + "/list")
        .defer(d3.json, URI + "/bpres")
        .awaitAll(ready);
  }
  H.chart = function(){ //cfg chart
    var data
    var form
    var unitInput, normInput
    var chart = function(selection){
        selection.selectAll("*").remove();
        form = selection.append("div").classed("form-group",true)
        form.append("label").text("Normalized Method")
        normInput = form.append("select").classed("form-control",true)
        normInput.selectAll("option")
                 .data(data.norms)
                 .enter()
                 .append("option")
                 .attr("value", function(d, i) {
                     return d
                 })
                 .text(function(d, i) {
                     return norms[d]
                 })
        form.append("label").text("Units")
        unitInput = form.append("select").classed("form-control",true)
        unitInput.selectAll("option")
                     .data(data.units)
                     .enter()
                     .append("option")
                     .attr("value", function(d, i) {
                         return d
                     })
                     .text(function(d, i) {
                         return units[d]
                     })
            if (data.units.length == 1) {
                     unitInput.property("disabled", true)
                 }
    }
    chart.state = function() {
      return {"unit":unitInput.node().value,"norm":  normInput.node().value}
    }
    chart.data = function(_) { return arguments.length ? (data= _, chart) : data; }
    return chart
  }
  /* HiC Canvas Render, Parameters Regions URI and Width Height, xoffset , yoffset */
  H.canvas = function() {
      /*parameters for canvas */
      var height;
      var width;
      var xoffset;
      var yoffset;
      var URI;

      /*parameters for hic data */
      var regions;
      var bpres;
      var norm;
      var unit;

      /*auto load data */
      var resIdx;
      var min;
      var max;
      var mats;
      var cellSize;
      var offsets;
      var canvas;

      var regionString = function(o) {
          return o.chr + ":" + o.start + "-" + o.end
      }
      var totalLength = function(regions) {
          var l = 0;
          regions.forEach(function(r, i) {
              l += (+r.end) - (+r.start)
          })
          return l
      }
      var generateQueryUrl = function(d) {
          var a = regions[d[0]]
          var b = regions[d[1]]
          var url = "/get2dnorm/" + regionString(a) + "/" + regionString(b) + "/" + resIdx + "/" + norm + "/" + unit + "/text"
          return url
      }
      var renderMatrix = function(canvas, xoffset, yoffset, mat, cellSize, colorScale) {
          var ctx = canvas.node().getContext("2d");
          for (var x = 0; x < mat.length; x++) {
              for (var y = 0; y < mat[0].length; y++) {
                  ctx.fillStyle = colorScale(mat[x][y]);
                  ctx.fillRect(xoffset + x * cellSize, yoffset + y * cellSize, cellSize, cellSize);
              }
          }
      }
      var render = function() {
          var color = d3.scaleLog().domain([min + 1.0, max]).range(["#FFE", "#F12"])
          var colorScale = function(d) {
              if (isNaN(d)) {
                  return color(0)
              } else {
                  return color(d)
              }
          }

          var l = regions.length;

          var k = 0;
          for (var i = 0; i < l; i++) {
              for (var j = i; j < l; j++) {
                  var x = offsets[i];
                  var y = offsets[j];
                  renderMatrix(canvas, xoffset + x, yoffset + y, mats[k], cellSize, colorScale)
                  k += 1;
              }
          }
      }
      var dataReady = function(errors, results) {
              console.log(results)
              min = Infinity
              max = -Infinity
              mats = []
              results.forEach(function(text, i) {
                  var data = d3.tsvParseRows(text).map(function(row) {
                      return row.map(function(value) {
                          var v = +value
                          if (min > v) {
                              min = v
                          }
                          if (max < v) {
                              max = v
                          }
                          return v;
                      });
                  });
                  //console.log(data);
                  mats.push(data)

              })
              console.log("min,max", min, max)
              //TODO Call Render Function;
              render();
          }
        var regionsToResIdx = function() {
              var w = Math.min(width, height)
              var l = totalLength(regions)
              var pixel = l / w;
              var resIdx = 0;
              for (var i = 0; i < bpres.length; i++) {
                  if (bpres[i] < pixel) {
                      resIdx = i - 1;
                      break;
                  }
              }
              if (resIdx < 0) {
                  resIdx = 0
              }
              cellSize = w / (l / bpres[resIdx])
              offsets = []
              var offset = 0.0;
              regions.forEach(function(d, i) {
                  offsets.push(offset)
                  offset += cellSize * ((+d.end - d.start) / bpres[resIdx])
              })
              return resIdx
          }
      var loadData = function() {
        var l = regions.length
        var pairs = []
        for (var i = 0; i < l; i++) {
            for (var j = i; j < l; j++) {
                pairs.push([i, j])
            }
        }
        resIdx = regionsToResIdx(regions, width, height) // TODO with width and length parameters
        console.log("smart resIdx", resIdx)
        //d3.select("#bpRes").text(bpres[resIdx]) //TODO
        var q = d3_queue.queue(2)
            // /get2dnorm/{chr}:{start}-{end}/{chr2}:{start2}-{end2}/{resIdx}/{norm}/{unit}/{format}
        pairs.forEach(function(d, i) {
            var url = generateQueryUrl(d)
            q.defer(d3.text, URI + url)
        })
        q.awaitAll(dataReady);
      }
      var chart = function(selection){ //selection is canvas itself;
           canvas = selection;
           loadData();
      }
      /*
      chart.loadData = function(callback) {
        loadData()
        return chart;
      }
      */
      chart.height = function(_) { return arguments.length ? (height= _, chart) : height; }
      chart.width = function(_) { return arguments.length ? (width= _, chart) : width; }
      chart.xoffset = function(_) { return arguments.length ? (xoffset= _, chart) : xoffset; }
      chart.yoffset = function(_) { return arguments.length ? (yoffset= _, chart) : yoffset; }
      chart.regions = function(_) { return arguments.length ? (regions= _, chart) : regions; }
      chart.norm = function(_) { return arguments.length ? (norm= _, chart) : norm; }
      chart.unit = function(_) { return arguments.length ? (unit= _, chart) : unit; }
      chart.bpres = function(_) { return arguments.length ? (bpres= _, chart) : bpres; }
      chart.URI = function(_) { return arguments.length ? (URI= _, chart) : URI; }
      return chart;



  }

}(snow.dataHic));


(function(d3,$,S){
  var H = S.dataHic;
  var B = S.dataBigwig;
  var body = d3.select("body")
  var scope = {}
  var top = body.append("div").attr("id","top")
    .classed("container",true)
  var main = body.append("div").attr("id","main")
    .classed("container",true)
  var left = body.append("div").attr("id","left")
    .classed("container",true)
  top.append("label").attr("for","width").text("width")
  var width = top.append("span").attr("id","width")
  top.append("label").attr("for","height").text("height")
  var height = top.append("span").attr("id","height")
  var canvas = main.append("canvas")
  $(window).resize(function() {
      resize()
  })
  var resize = function() {
      //var canvasdiv = d3.select("#canvasdiv")
      scope.width = $(window).width() - 200
      scope.height = $(window).height() - 30
      canvas.attr("width", scope.width).attr("height", scope.height)
      main.style("height", scope.height+ "px")
      main.style("width", scope.width + "px")
      width.text(scope.width)
      height.text(scope.height)
      console.log(scope)

  }
  resize()
  var URI = "/hic"
  var hicCtrl;
  var hicOpts={}
  var hicCtrlDiv = left.append("div")
  var regionCtrlDiv = left.append("div")

  /* get parameters of regions and hic , then render */
  left.append("div").append("button").attr("value","submit")
  .text("submit")
  .on("click",function(){
    console.log(hicCtrl.state())
    console.log(regionCtrl.regions())
    var hic = hicCtrl.state()
    var regions = regionCtrl.regions();
    var chart = H.canvas()
     .URI(URI)
     .norm(hic.norm)
     .unit(hic.unit)
     .bpres(hicOpts.bpres)
     .xoffset(20)
     .yoffset(20)
     .width(scope.width-40)
     .height(scope.height-40)
     .regions(regions)
    //console.log(canvas)
    //console.log(hicOpts.bpres)
    //chart.loadData(console.log)
     canvas.call(chart)
  })

  var renderHicCtrlPanel = function(data) {
    hicOpts = data;
    hicCtrl = H.chart().data(data);
    hicCtrlDiv.call(hicCtrl)
    regionCtrl = S.regionForm().chrs(data.chrs).regionNum(2)
    regionCtrlDiv.call(regionCtrl)
  }
  H.Get(URI,renderHicCtrlPanel)
  B.Get("",console.log)
}(d3,jQuery,snow));
