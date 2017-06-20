import {
  totalLength,
  overlap
} from "./funcs"
/* coord API

 */
export default function () {
  var regions
  var width = 500
  var gap = 10
  var inited = false
  var scales, offsets, widths
  /* x.chr x.start x.end */
  /* TODO add overflow fix */
  var chart = function (e) {
    if (!inited) {
      init();
    }
    var rdata = []
    //console.log(e,regions)

    regions.forEach(function (r, i) {
      var domain = scales[i].domain();
      if (Object.prototype.toString.call(e) === '[object Array]') {
        e.forEach(function (d, j) {
          if (overlap(r, d)) {
            var start = d.start
            var end = d.end
            var full = true;
            if (d.start < domain[0]) {
              start = domain[0]
              full = false
            }
            if (d.end > domain[1]) {
              end = domain[1]
              full = false
            }
            var x = scales[i](start) + offsets[i]
            var full = true;
            var l = scales[i](end) + offsets[i] - x

            rdata.push({
              "x": x,
              "l": l,
              "f":full
            })
          }
        })
      } else {
        if (overlap(r, e)) {
          var start = e.start
          var end = e.end
          var full = true;
          if (e.start < domain[0]) {
            start = domain[0]
            full = false
          }
          if (e.end > domain[1]) {
            end = domain[1]
            full = false
          }
          var x = scales[i](start) + offsets[i]
          var full = true;
          var l = scales[i](end) + offsets[i] - x
          rdata.push({
            "x": x,
            "l": l,
            "f":full
          })
        }
      }
    })

    return rdata
  }
  var init = function () {
    inited = true
    scales = []
    offsets = []
    widths = []
    var offset = 0
    var totalLen = totalLength(regions)
    var effectWidth = width - (regions.length - 1) * gap
    regions.forEach(function (d) {
      var w = (+(d.end) - (+d.start)) * effectWidth / totalLen
      var scale = d3.scaleLinear().domain([+(d.start), +(d.end)]).range([0, w])
      scales.push(scale)
      offsets.push(offset)
      offset += w + gap
      widths.push(w)
    })
  }
  chart.width = function (_) {
    return arguments.length ? (width = _, inited = false, chart) : width;
  }
  chart.regions = function (_) {
    return arguments.length ? (regions = _, inited = false, chart) : regions;
    e
  }
  chart.gap = function (_) {
    return arguments.length ? (gap = _, inited = false, chart) : gap;
  }
  return chart
}
