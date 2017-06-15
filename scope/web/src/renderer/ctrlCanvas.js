import B from "../data/bigwig"
import BB from "../data/bigbed"
import H from "../data/hic2"
import toolsFixRegions from "../tools/fixRegions"
import toolsTrimChrPrefix from "../tools/trimChrPrefix"
import toolsAddChrPrefix from "../tools/addChrPrefix"
import brush from "../scopebrush"
import coord from "../data/coords"

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



  var scope = {
    "background": "#BBB"
  }
  var init = {
    "bigwig": false,
    "hic": false,
    "bigbed": false
  }
  var server = app["server"] || ""
  var hic = {}
  var dispatch = d3.dispatch("update", "brush", "cfgHic", "replot", "domain", "monitor", "switchHic", "switchBw")
  var main = d3.select(container.getElement()[0])
    .append("div")
    .attr("class", "content")
    .style("position", "relative")
  var content = main
  var cfg = d3.select(container.getElement()[0])
    .append("div")
    .attr("class", "cfg")
  var sign = false
  /* MODULIZED THIS PART */

  var renderCfg = function (data, config, callback) { //TODO SOFISTIGATED OPTIONS
    var factory = function (data, config) {
      //var c = {}
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
    var gui = new dat.GUI({
      autoPlace: false
    }) //dat gui
    gui.__closeButton.style.display = "none" //TODO
    factory(data, config)
    var inputs = {}
    for (var k in data) {
      if (Object.prototype.toString.call(data[k]) === '[object Array]') {
        inputs[k] = gui.add(config, k, data[k]).listen()
      } else if (typeof data[k] === 'string' && data[k].match(/^#\S\S\S\S\S\S$/)) {
        inputs[k] = gui.addColor(config, k).listen()
      } else if (typeof data[k] === 'boolean') {
        inputs[k] = gui.add(config, k).listen()
      } else {
        inputs[k] = gui.add(config, k, data[k]).listen()
      }
    }
    if (callback) {
      for (var k in inputs) {
        inputs[k].onFinishChange(function (value) {
          callback(k, value)
        })
      }
    }

    var container0 = cfg.append("div").node();
    container0.appendChild(gui.domElement)
    //cfg.append("div").style("height", "25px") //TODO
    return container0
  }



  var hicCfgDiv;
  dispatch.on("cfgHic", function (data) { //Config HiC
    if (hicCfgDiv) {
      hicCfgDiv.remove()
    }
    console.log("hic", hic)
    var opts = {
      "color2": "#ff0000",
      "color1": "#ffffff"
    }
    opts["unit"] = {}
    data.units.forEach(function (d) {
      var k = units[d]
      opts["unit"][k] = d
    })
    opts["norm"] = {}
    data.norms.forEach(function (d) {
      //opts.norms.push({norms[d]:d})
      var k = norms[d]
      opts["norm"][k] = d
    })
    hic.state = {}
    if (container.getState().hicState && sign == false) {
      hic.state = container.getState().hicState
      //console.log("load hic STATE")
      opts["color1"] = hic.state.color1
      opts["color2"] = hic.state.color2
      sign = true; //load once.
    } else {
      /*
      container.extendState({
        "hicState": hic.state
      })
      */
      sign = true;
    }
    hicCfgDiv = renderCfg(opts, hic.state, undefined)
    container.extendState({
      "hicState": hic.state
    })

  })
  //console.log("container",container)
  var canvas = main.append("canvas").style("position", "absolute")
  var svg = main.append("svg").style("position", "absolute")
  var div = main.append("div").style("position", "absolute")
    .style("top", 10).style("left", 10).style("width", 50).style("height", 100)
  var div1 = main.append("div").style("position", "absolute")


  var state = {} // TODO canvas state for hic , bigwigs and bigbeds....

  var btnPrint = div.append("button")
    .classed("btn", true)
    .html('<small><span class="glyphicon glyphicon-print"></span></small>')
    .on('click', function () {
      div.selectAll("a").remove()
      var a = div.append("a")
        .attr("href", canvas.node().toDataURL())
        .attr("download", "scope.png")
        .text("")
      a.node().click()
      a.remove()
    })



  var btnPlay = div.append("button")
    .classed("btn", true)
    .html('<small><span class="glyphicon glyphicon-play"></span></small>')
    .on("click", function () {
      dispatch.call("replot", this, {})
    })

  var btnZoomOut = div.append("button")
    .classed("btn", true)
    .html('<small><span class="glyphicon glyphicon-zoom-out"></span></small>')
    .on("click", function () {
      //var regions = region.ctrl.regions(); //or states?
      var regions = state.regions
      regions.forEach(function (d, i) {
        d.length = getChrLength(d.chr) //TODO fix map for chromosome length;
        var l = d.end - d.start
        regions[i].start = d.start - l < 0 ? 0 : d.start - l
        regions[i].end = d.end + l > d.length ? d.length : d.end + l
      })
      regions = toolsFixRegions(regions)
      dispatch.call("update", this, regions)
      //layout.eventHub.emit("input", regions)
    })

  var btnZoomIn = div.append("button")
    .classed("btn", true)
    .html('<small><span class="glyphicon glyphicon-zoom-in"></span></small>')
    .on("click", function () {
      var regions = state.regions
      regions.forEach(function (d, i) {
        var l = Math.round((d.end - d.start) / 3)
        regions[i].start = d.start + l
        regions[i].end = d.end - l
      })
      regions = toolsFixRegions(regions)
      dispatch.call("update", this, regions)
      //layout.eventHub.emit("input", regions) //TODO

    })
  var axesG = svg.append("g").attr("transform", "translate(10,0)")

  var TO = false //resize delay
  var resizePanel = function () {
    dispatch.call("replot", this, {})
  }
  container.on("resize", function (e) {
    if (TO !== false) clearTimeout(TO)
    canvas.attr("height", container.height)
      .attr("width", container.width)
    svg.attr("height", container.height)
      .attr("width", container.width)
    //TODO get a better size
    div1.style("top", 10)
      .style("left", 3 * container.width / 4)
      .style("width", container.width / 4)
      .style("height", container.width / 4)
    scope.edge = container.width - 40
    scope.width = container.width
    scope.height = container.height
    TO = setTimeout(resizePanel, 2000)
  })
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
  var initHic = function (data) {
    hic.opts = data; //hic.opts.chrs
    dispatch.call("cfgHic", this, data)
    init.hic = true;
    var r = state.regions || testBeds
    renderHic(r) //TODO d3 queue ?
  }
  cfg.append("input")
    .attr("type", "button")
    .attr("value", "submit")
    .on("click", function (d) {
      container.extendState({
        "hicsState": hic.hics,
        "hicState": hic.state,
        "bigWigState": bw.config,
        "bigBedState": bb.config
      })
      container.extendState({
        "configView": false
      })
      cfg.style("display", "none")
      main.style("display", "block")
      dispatch.call("replot", this, {})
    })
  var getChrLength = function (chr) {
    console.log(hic.opts.chrs, hic.opts.chr2idx)
    var i;
    if (hic.opts.chr2idx[chr] !== undefined) {
      i = hic.opts.chr2idx[chr]
    } else if (hic.opts.chr2idx[chr.replace("chr", "").replace("Chr", "")] !== undefined) {
      i = hic.opts.chr2idx[chr.replace("chr", "").replace("Chr", "")]
    } else {
      return 0; //unknown chromosome.
    }
    return hic.opts.chrs[i].Length
  }

  var bigwig;
  var bw = {
    "opts": {},
    "config": {}
  }
  var initBw = function (data) {
    bigwig = data;
    if (container.getState().bigWigState) {
      console.log("getState")
      bw.config = container.getState().bigWigState
      bigwig.trackIds.forEach(function (d, i) {
        bw.opts[d] = bw.config[d];
      })
    } else {
      bigwig.trackIds.forEach(function (d, i) {
        bw.opts[d] = (i < 4);
      })
    }
    renderCfg(bw.opts, bw.config)
    init.bigwig = true;
  }


  var bb = {
    "opts": {},
    "config": {}
  }
  var bigbed;
  var initBb = function (data) {
    bigbed = data;
    if (container.getState().bigBedState) {
      console.log("getState")
      bb.config = container.getState().bigBedState
      bigbed.trackIds.forEach(function (d, i) {
        bb.opts[d] = bb.config[d];
      })
    } else {
      bigbed.trackIds.forEach(function (d, i) {
        bb.opts[d] = (i < 4);
      })
    }

    renderCfg(bb.opts, bb.config)
    init.bigbed = true;
  }

  B.Get(server + "/bw", initBw)
  BB.Get(server + "/bigbed", initBb)

  // URI is default now. change this. TODO : handle
  var URI //TODO THIS
  var hics = {
    "opts": {},
    "config": {}
  }
  d3.json(server + "/hic/list", function (d) {
    hic.hics = d;
    hics.opts = {
      "hic": d
    }
    if (container.getState().hicsState) {
      hics.cfg = container.getState().hicsState
    } else {
      hics.cfg = {
        "hic": d[0]
      }
    }

    var callback = function (k, v) {
      container.extendState({
        "hicsState": hics.cfg
      })
      URI = server + "/hic/" + v
      H.Get(URI, initHic)
    }

    renderCfg(hics.opts, hics.cfg, callback)
    URI = server + "/hic/" + hics.cfg.hic
    H.Get(URI, initHic)

  })
  var renderBigbed = function (regions) {
    //console.log("TODO render BigBed", regions)
    var dbname = "bigbed"
    var _bedHeight = 10;
    var bbs = []
    var tracks = []
    var yoffset = scope.edge / 2 + 40 + 4 * (_barHeight + 10) + 5
    //var yoffset = 300
    var coords = coord().regions(regions).width(scope.edge)
    //TODO : load localStorage configure?
    if (!bb.config) {
      bigbed.trackIds.forEach(function (b, i) {
        tracks.push(b)
      })
    } else {
      for (var k in bb.config) {
        if (bb.config[k]) {
          tracks.push(k)
        }
      }
    }
    tracks.forEach(function (id, i) {
      var chart = BB.canvas().coord(coords).regions(regions).URI(server + "/" + dbname).id(id).x(10).y(yoffset + i * _bedHeight)
      canvas.call(chart)
      //console.log("TODO Render", b, i)
    })


  }
  var renderBigwig = function (regions) {
    var bws = []
    var tracks = []
    //TODO : load localStorage configure?
    if (!bw.config) {
      bigwig.trackIds.forEach(function (b, i) {
        tracks.push(b)
      })
    } else {
      for (var k in bw.config) {
        if (bw.config[k]) {
          tracks.push(k)
        }
      }
    }
    tracks.forEach(function (b, i) {
      bws.push(
        B.canvas()
        .URI(server + "/bw") //set this?
        .id(b)
        .x(10)
        .y(scope.edge / 2 + 40 + i * (_barHeight + 10))
        .width(scope.edge)
        .barHeight(_barHeight)
        .gap(20) //TODO REMV
        .regions(toolsAddChrPrefix(regions))
        .panel(main)
        .mode(1)
        .pos(i)
      )
    })
    dispatch.on("brush.local", function (e) {
      bws.forEach(function (b, i) {
        b.response(e)
      })
    })
    bws.forEach(function (b) {
      canvas.call(b)
    })
  }
  var renderHic = function (r) {
    var regions;
    var pre = new RegExp("^chr*")
    var Pre = new RegExp("^Chr*")
    console.log(hic.opts.chrs[0].Name)
    if (pre.test(hic.opts.chrs[1].Name) || Pre.test(hic.opts.chrs[1].Name)) {
      regions = r
      console.log("pre", hic.opts.chrs[0])
    } else {
      regions = toolsTrimChrPrefix(r)
      console.log("not pre", hic.opts.chrs[1])
      //prefixed = false;
    }
    var scopebrush = brush().width(scope.edge).on("brush", function (d) {
      dispatch.call("brush", this, toolsAddChrPrefix(d))
      layout.eventHub.emit("brush", toolsAddChrPrefix(d))
    }).on("click", function (d) {
      dispatch.call("update", this, toolsAddChrPrefix(d))
    }).regions(regions)
    axesG.selectAll("*").remove()
    axesG.call(scopebrush)

    var hicCb = function (d) {
      dispatch.call("monitor", this, d)
      var ctx = canvas.node().getContext("2d");
      ctx.fillStyle = scope.background
      ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40)
    }
    //hic.state = config;
    hic.chart = H.canvas()
      .URI(URI) //TODO
      .norm(hic.state.norm)
      .unit(hic.state.unit)
      .bpres(hic.opts.bpres)
      .xoffset(10)
      .yoffset(scope.edge * 0.5)
      .width(scope.edge)
      .height(scope.edge)
      .regions(regions)
      .panel(main)
      .color1(hic.state.color1)
      .color2(hic.state.color2)
      .emit(function (d) {
        dispatch.call("brush", this, d)
      })
      .callback(hicCb)
    canvas.call(hic.chart)
    //TODO Fix OverFlow.
    dispatch.on("domain", function (d) {
      hic.chart.domain(d); //local render.
      hic.chart.render(function () {
        var ctx = canvas.node().getContext("2d");
        ctx.fillStyle = scope.background
        ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40)
      });

    })
  }
  var render = function (d) {
    var ctx = canvas.node().getContext("2d");
    ctx.fillStyle = scope.background
    ctx.fillRect(0, 0, scope.width, scope.height)
    var regions = d
    regions = toolsFixRegions(regions)
    container.extendState({
      "regions": d
    });
    state.regions = regions; //TODO FIXed
    layout.eventHub.emit("update", d)
    if (init.bigwig) {
      renderBigwig(regions)
    }
    if (init.hic) {
      console.log("Render HiC")
      renderHic(regions)
    }
    if (init.bigbed) {
      renderBigbed(regions)
    }
  }
  layout.eventHub.on("update", function (d) {
    console.log("update eventHub", d)
  })
  dispatch.on("monitor", function (d) {
    //div1.html(JSON.stringify(d, 2, 2)) //TODO renders.
    div1.html("")
    //var paratable = paraTable().data(d)
    //div1.call(paratable)
    var table = div1.append("table").classed("table", true)
      .classed("table-condensed", true)
      .classed("table-bordered", true)
    var keys = Object.keys(d);
    var tr = table.selectAll("tr").data(keys)
      .enter().append("tr")
    tr.append("td").text(function (d0) {
      return d0
    })
    tr.append("td").text(function (d0) {
      return d[d0]
    })
    var k0 = div1.append("div").style("padding-right", "20px")
    var k1 = k0.append("div") //.attr("id","slider101")
    var k2 = k0.append("div")
    var max = d.max > 30000 ? 30000 : d.max
    k2.html("0-" + max)
    $(k1.node()).slider({
      range: true,
      min: 0,
      max: max,
      values: [0, max],
      slide: function (event, ui) {
        //console.log(ui.values[0],ui.values[1])
        k2.html(ui.values[0] + "-" + ui.values[1])
        dispatch.call("domain", this, [ui.values[0], ui.values[1]])
      }
    });
  })

  dispatch.on("update.local", function (d) {
    console.log("update.local", d)
    render(toolsAddChrPrefix(d))
  })
  var fixRegions = function (d) {
    d.forEach(function (c, i) {
      if (c.start === undefined || c.start < 0) {
        c.start = 0
      }
      var l = getChrLength(c.chr)
      if (c.end === undefined || c.start > l) {
        c.end = l
      }
    })
    return d
  }
  layout.eventHub.on("input", function (d) {
    d = fixRegions(toolsAddChrPrefix(d))
    render(d)
  })
  dispatch.on("replot", function (d) {
    //layout.eventHub.emit("update", state.reigions || testBeds)
    render(state.regions || testBeds)
  })
}
