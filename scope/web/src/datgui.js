var factory = function (data, config) {
  var c = config
  for (var k in data) {
    if (!c[k]) {
      if (Object.prototype.toString.call(data[k]) === '[object Array]') {
        c[k] = data[k][0]
      } else if (typeof data[k] === 'string') {
        c[k] = data[k]
      } else if (typeof data[k] === 　"boolean") {
        c[k] = data[k]
      } else {
        c[k] = 0 //TODO
      }
    }
  }
}

export default function() {
  var callback
  var closable = true
  var chart = function(selection) {
    selection.each(function(d){
      var el = d3.select(this)
      el.selectAll(".guidiv").remove()
      var gui = new dat.GUI({
        autoPlace: false
      })
      if (!closable) {
        gui.__closeButton.style.display = "none"
      }
      factory(d.options,d.config)
      var inputs = {}
      for (var k in d.options) {
        if (Object.prototype.toString.call(d.options[k]) === '[object Array]') {
          inputs[k] = gui.add(d.config, k, d.options[k]).listen()
        } else if (typeof d.options[k] === 'string' && d.options[k].match(/^#\S\S\S\S\S\S$/)) {
          inputs[k] = gui.addColor(d.config, k).listen()
        } else if (typeof d.options[k] === 'boolean') {
          inputs[k] = gui.add(d.config, k).listen()
        } else {
          inputs[k] = gui.add(d.config, k, d.options[k]).listen()
        }
      }
      if (callback) {
        for (var k in inputs) {
          inputs[k].onFinishChange(function (value) {
            callback(k, value)
          })
        }
      }
      var el0 = el.append("div").classed("guidiv",true).node();
      el0.appendChild(gui.domElement)
    })
  }
  chart.callback = function(_) { return arguments.length ? (callback= _, chart) : callback; }
  chart.closable = function(_) { return arguments.length ? (closable= _, chart) : closable; }
  return chart
}

/*
var renderCfg = function (data, config, callback) { //TODO SOFISTIGATED OPTIONS


  if (callback) {
    for (var k in inputs) {
      inputs[k].onFinishChange(function (value) {
        callback(k, value)
      })
    }
  }

}
*/
