var HiC = HiC || {};
var BigWig = BigWig || {};
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
      .defer(d3.json, URI + "/binsize")
      .awaitAll(ready);
    }
}(BigWig));

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
}(HiC));


(function(d3,$,H,B){
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
  H.Get(URI,console.log)
  B.Get("",console.log)
}(d3,jQuery,HiC,BigWig));
