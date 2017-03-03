//　one or two region brushes for HiC one or two region view.
// integrate tri brush and rect brush.

var snow = snow || {};
(function (d3, S) {
    S.scopebrush = function () {
        function nearby(a,b) {
            if (a.chr!=b.chr) {return false}
            var l = Math.max(a.end,b.end) - Math.min(a.start,b.start)
            if (((a.end-a.start)+(b.end-b.start))/ l > 0.95) {
              return true
            }
            return false
        }
        function merge(a,b) {
            console.log("a",a)
            console.log("b",b)
            return {"chr":a.chr,"start":Math.min(a.start,b.start),"end":Math.max(a.end,b.end)}
        }
        var dispatch = d3.dispatch("brush", "click")
        var listeners = d3.dispatch("brush", "click")
        var width = 700
        var G = [{}, {}, {}]
        var Bs = [{}, {}, {}]
        var regions = [{
            "chr": "chr1",
            "start": 0,
            "end": 300000
        }, {
            "chr": "chr2",
            "start": 0,
            "end": 200000
        }]
        var scales = [d3.scaleLinear().domain([0, 100000]).range([0, 100]), d3.scaleLinear().domain([0, 300000]).range([0, 300])]

        var chart = function (selection) {
            var renderTri = function (selection, x, y, scale, id) {
                var width = scale.range()[1] - scale.range()[0]
                Bs[id] = S.brushTri()
                    .x(x)
                    .y(y)
                    .on("brush", function (d) {
                        var e = {
                            "from": id,
                            "d": d
                        }
                        dispatch.call("brush", this, e)
                    })
                    .on("click", function (d) {
                        var e = {
                            "from": id,
                            "d": d
                        }
                        dispatch.call("click", this, e)
                    })
                    .scale(scale)
                    .edge(width)
                var l = scale.range()[1]-scale.range()[0]
                var axisScale = d3.scaleLinear().domain(scale.domain()).range([scale.range()[0]/Math.SQRT2*2,scale.range()[1]/Math.SQRT2*2])
                var axis1 = S.axis().x(-l/Math.SQRT2).y(l/Math.SQRT2).scale(axisScale) //TODO
                selection.call(axis1)

                var g = selection.append("g").attr("transform", "translate(" + 0 + "," + 0 + ") rotate(45)") //TODO
                g.call(Bs[id])
            }
            var render1 = function(svg) {
              console.log("render",1)
              var d = regions[0]
              console.log("render1",d)
              G[0].attr("transform", "translate(" + (0 + width / 2) + "," + (width / 2 - width / 2) + ")")
              scales[0] = d3.scaleLinear().domain([d.start, d.end]).range([0, width / Math.SQRT2])
              renderTri(G[0], 0, 0, scales[0], 0)
            }
            var render2 = function (svg) {
                var offsets = []
                var gap = 10
                var l = 0;
                var offsets = []

                var offset = 0
                var eWidth = width - (regions.length - 1) * gap
                regions.forEach(function (d) {
                    l += (+d.end - d.start)
                })
                regions.forEach(function (d, i) {
                    offsets.push(offset)
                    var rWidth = eWidth * (d.end - d.start) / l
                    G[i].attr("transform", "translate(" + (offset + rWidth / 2) + "," + (width / 2 - rWidth / 2) + ")")
                    scales[i] = d3.scaleLinear().domain([d.start, d.end]).range([0, rWidth / Math.SQRT2])
                    renderTri(G[i], 0, 0, scales[i], i)
                    offset += rWidth + gap

                })

                var yscale = d3.scaleLinear().domain([scales[1].domain()[1], scales[1].domain()[0]]).range(scales[1].range())
                Bs[2] = S.brush()
                    .x(width / 2) //TODO THIS FOR MULTI
                    .y(0)
                    .theta(Math.PI / 4)
                    .on("brush", function (d) {
                        var e = {
                            "from": 2,
                            "d": d
                        }
                        dispatch.call("brush", this, e)
                    })
                    .on("click", function (d) {
                        var e = {
                            "from": 2,
                            "d": d
                        }
                        dispatch.call("click", this, e)
                    })
                    .xscale(scales[0])
                    .yscale(yscale)
                G[2].call(Bs[2])
            }
            var render = function() {
              G[0].selectAll("*").remove()
              G[1].selectAll("*").remove()
              G[2].selectAll("*").remove()
              console.log(regions)
              if (regions.length == 1) {
                  console.log("region1")
                  render1(svg)
              } else if (regions.length == 2) {
                  render2(svg)
              }
            }
            var translate = function(d) {
              var chr0,chr1
              if (d.from==0 || d.from==1) {
                chr0 = regions[d.from].chr
                chr1 = regions[d.from].chr
              } else {
                console.log(d,regions)
                chr0 = regions[0].chr
                chr1 = regions[1].chr
              }
              var brushRegions = [{
                  "chr": chr0,
                  "start": Math.round(d.d[0][0]),
                  "end": Math.round(d.d[1][0])

              }, {
                  "chr": chr1,
                  "start": Math.round(d.d[0][1]),
                  "end": Math.round(d.d[1][1])
              }]
              if (nearby(brushRegions[0],brushRegions[1])) {
                brushRegions=[merge(brushRegions[0],brushRegions[1])]
              }
              return brushRegions;
            }
            dispatch.on("brush.local", function (d) {
                G.forEach(function (d0, i) {
                    if (d.from != i) {
                        Bs[i].deactivate(d.d)
                    } else {
                        Bs[i].activate(d.d)
                    }
                    if (d.from == 2 && i != 2) {
                        Bs[0].process("brush", [d.d[0][0], d.d[1][0]])
                        Bs[1].process("brush", [d.d[0][1], d.d[1][1]])
                    }
                })
                listeners.call("brush",this,translate(d))
            })

            dispatch.on("click.local", function (d) {
                regions = translate(d)
                console.log(regions)
                render()
                listeners.call("click",this,regions)
                //render()
            })
            var svg = selection.append("g")
            G[0] = svg.append("g")
            G[1] = svg.append("g")
            G[2] = svg.append("g").attr("transform", "translate(" + 0 + "," + 0 + ")")
            render()
        }
        chart.on = function () {
            var value = listeners.on.apply(listeners, arguments);
            return value === listeners ? chart : value;
        };
        chart.regions = function(_) { return arguments.length ? (regions= _, chart) : regions; }
        chart.width = function(_) { return arguments.length ? (width= _, chart) : width; }
        return chart
    }

}(d3, snow))
