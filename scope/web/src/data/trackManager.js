import coords from "./coords"
export default function () {
  var callback
  var width = 800;
  //var scale = d3.scale.linear().range([0, width]);
  var coord;
  var labelSize = 110; //TODO.
  var color = function (d) {
    return "blue";
  };
  //var rectClass = "bed6"
  var trackHeight = 5;
  var trackSize = 40;
  var trackNumber = 0;
  var trackAvailableArray = Array.apply(null, Array(trackSize)).map(Number.prototype.valueOf, -labelSize);

  var minTrackId = function () {
    var i = 0;
    var x = trackAvailableArray[0];
    trackAvailableArray.forEach(function (d, j) {
      if (d < x) {
        x = d;
        i = j
      }
    })
    return i;
  }

  var _trackAvailable = function (d) {
    var start_pos = d.x;
    for (var i = 0; i < trackSize; i++) {
      if (trackAvailableArray[i] + labelSize <= start_pos) {
        // trackAvailableArray[i] = d.x + d.l //commit to update.
        /*
        if (trackNumber < i) {
          trackNumber = i
        };
        */
        return {"i":i,"c":false};
      }
    }
    return {"i":minTrackId(),"c":true};
  }
  var _putToTrack = function (d, i) {
    d.forEach(function (d) {
      if (trackAvailableArray[i] < d.x + d.l) {
        trackAvailableArray[i] = d.x + d.l
      }
    })
    if (trackNumber < i) {
      trackNumber = i
    };
  }
  var trackAssign = function(d) {
    var r = {i:0,c:false};
    d.forEach(function (d0) {
      var x = _trackAvailable(d0)
      if (r.i <= x.i) {
         r.i = x.i;
         r.c = x.c;
      }
    })
    _putToTrack(d, r.i)
    return r
  }

  var chart = function (selection) {
    /*
    selection.each(function (d, i) {
      var r = coord(d)
      var iTrack = trackAssign(r)

    })
    */
  }
  chart.AssignTrack = function(d) {
    var r = coord(d);
    return trackAssign(r)
  }
  /*
  chart.color = function (x) {
    if (!arguments.length == 0) {
      color = x;
      return chart
    } else {
      return color;
    }
  }
  */
  chart.trackSize = function (x) {
    if (!arguments.length == 0) {
      trackSize = x;
      trackAvailableArray = Array.apply(null, Array(trackSize)).map(Number.prototype.valueOf, 0);
      trackNumber = 0; //reset track index;
      return chart
    } else {
      return trackSize;
    }
  }
  chart.trackHeight = function (x) {
    if (!arguments.length == 0) {
      trackHeight = x;
      return chart
    } else {
      return trackHeight;
    }
  }

  chart.coord = function (_) {
    return arguments.length ? (coord = _, chart) : coord;
  }
  chart.regions = function (_) {
    return arguments.length ? (regions = _, chart) : regions;
  }
  chart.callback = function (_) {
    return arguments.length ? (callback = _, chart) : callback;
  }
  return chart;
}
