(function(d3,$){
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
      //canvas.attr("width", scope.width).attr("height", scope.height)
      main.style("height", scope.height+ "px")
      main.style("width", scope.width + "px")
      width.text(scope.width)
      height.text(scope.height)
      console.log(scope)

  }
  resize()
}(d3,jQuery))
