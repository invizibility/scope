import {
  totalLength,
  overlap
} from "./funcs"
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
      if (Object.prototype.toString.call(e) === '[object Array]') {
        e.forEach(function (d, j) {
          if (overlap(r, d)) {
            var x = scales[i](d.start) + offsets[i]
            var l = scales[i](d.end) + offsets[i] - x
            rdata.push({
              "x": x,
              "l": l
            })
          }
        })
      } else {
        if (overlap(r, e)) {
          var x = scales[i](e.start) + offsets[i]
          var l = scales[i](e.end) + offsets[i] - x
          rdata.push({
            "x": x,
            "l": l
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
