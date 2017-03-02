//　one or two region brushes for HiC one or two region view.
// integrate tri brush and rect brush.

var snow = snow || {};
(function (d3, S) {
    var regions = [{
        "chr": "chr1",
        "start": 0,
        "end": 300000
    },{
        "chr": "chr2",
        "start": 0,
        "end": 200000
    }


    ]
    var scales = [d3.scaleLinear().domain([0, 100000]).range([0, 100]),d3.scaleLinear().domain([0, 300000]).range([0, 300])]
    S.scopebrush = function () {
        var dispatch = d3.dispatch("new")
        var width = 700
        var G=[{},{},{}]
        var Bs = [{},{},{}]
        var chart = function (selection) {
            var renderTri = function (selection, x, y, scale, id) {
                var width = scale.range()[1]-scale.range()[0]
                console.log("width",width)
                Bs[id] = S.brushTri()
                    .x(x)
                    .y(y)
                    //.theta(Math.PI / 4)
                    .on("brush", function (d) {
                        //console.log("brush", d)
                        var e = {"from":id,"d":d}
                        dispatch.call("new", this, e)
                    })
                    .on("click", function (d) {
                        console.log("click brush")
                    })
                    .scale(scale)
                    .edge(width)
                /*
                var axis1 = S.axis().x(50).y(250).scale(scales[0]) //TODO
                svg.call(axis1)
                */
                var g = selection.append("g").attr("transform", "translate(" + 0 + "," + 0 + ") rotate(45)") //TODO
                g.call(Bs[id])
            }
            var svg = selection.append("g")
            if (regions.length == 1) {
                renderTri(svg, 0, 0, scales[0]) //TODO G call
            } else if (regions.length == 2) {
                var offsets=[]
                var gap = 2
                var l = 0;
                var offsets = []

                var offset = 0
                var eWidth = width - (regions.length-1) * gap
                regions.forEach(function(d){
                  l+=(+d.end-d.start)
                })
                regions.forEach(function(d, i){
                  offsets.push(offset)
                  var rWidth = eWidth * (d.end-d.start)/l
                  G[i] = svg.append("g").attr("transform","translate("+(offset+rWidth/2) +","+(width/2-rWidth/2)+")")
                  scales[i] = d3.scaleLinear().domain([d.start,d.end]).range([0,rWidth/Math.SQRT2])
                  renderTri(G[i], 0, 0, scales[i], i)
                  offset += rWidth + gap

                })

                var yscale = d3.scaleLinear().domain([scales[1].domain()[1],scales[1].domain()[0]]).range(scales[1].range())
                Bs[2] = S.brush()
                    .x(width / 2) //TODO THIS FOR MULTI
                    .y(0)
                    .theta(Math.PI / 4)
                    .on("brush", function (d) {
                        //buffer = d;
                        //listeners.call("lbrush", this, d)
                        console.log("data2",d)
                        var e = {"from":2,"d":d}
                        dispatch.call("new", this, e)
                    })
                    .on("click", function (e) {
                        //console.log("submit",d,buffer)
                        /*
                        var d = buffer
                        regions[0].start = Math.round(d[0][0])
                        regions[0].end = Math.round(d[1][0])
                        regions[1].start = Math.round(d[0][1])
                        regions[1].end = Math.round(d[1][1])
                        */
                        //listeners.call("submit",this,regions)
                    })
                    .xscale(scales[0])
                    .yscale(yscale)
                dispatch.on("new",function(d){
                  console.log("new")
                  console.log(this)
                  console.log(d)
                  var self = this;
                  G.forEach(function(d0,i){
                    console.log(d.from,i)
                    if (d.from!=i) {
                      Bs[i].deactivate(d.d)
                    } else {
                      Bs[i].activate(d.d)
                    }
                    if (d.from==2 && i!=2) {
                      Bs[0].response(d.d)
                      Bs[1].response(d.d)
                    }
                  })
                })
                G[2] = svg.append("g").attr("transform","translate("+ 0 +","+ 0 + ")").call(Bs[2])

            }
        }
        chart.on = function () {
            var value = dispatch.on.apply(dispatch, arguments);
            return value === dispatch ? chart : value;
        };
        return chart
    }

}(d3, snow))
