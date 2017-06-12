export default {
  Get: function (URI, callback) {
    var config = {}
    var ready = function (error, results) {
      config.URI = URI
      config.trackIds = results[0]
      callback(config)
    }
    d3_queue.queue(2)
      .defer(d3.json, URI + "/list")
      .awaitAll(ready);
  },
  canvas: function () {
    var chart = function (selection) {
      var id = "default"
      var pos = 0 //for response rect TODO remove this limitation (change to id or get the response var)
      var height
      var width
      var regions
      var x
      var y
      var URI = ""
    }
    return chart
  }

}
