(function(d3,$){
  var main;
  main = d3.select("#main")
  var scope = {};
  $(window).resize(function() {
      resize()
  });
  var resize = function() {
      //var canvasdiv = d3.select("#canvasdiv")
      scope.canvas = d3.select("#main").append("canvas")
      main.style("height", $(window).height() + "px")
      main.style("width", ($(window).width() - 200) + "px")
      scope.width = $(window).width() - 200
      scope.height = $(window).height()
      d3.select("#width").text(scope.width)
      d3.select("#height").text(scope.height)
      console.log(scope)
      scope.canvas.attr("width", scope.width).attr("height", scope.height)
  }
  resize()
}(d3,jQuery))
