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
        var width = 400
        var chart = function (selection) {
            var renderTri = function (selection, x, y, scale) {
                var width = scale.range()[1]-scale.range()[0]
                console.log("width",width)
                var b = S.brushTri()
                    .x(x)
                    .y(y)
                    //.theta(Math.PI / 4)
                    .on("brush", function (d) {
                        console.log("brush", d)
                        dispatch.call("new", this, d)
                    })
                    .on("click", function (d) {
                        console.log("click brush")
                    })
                    .scale(scale)
                    .edge(width)
                console.log(b)
                /*
                var axis1 = S.axis().x(50).y(250).scale(scales[0]) //TODO
                svg.call(axis1)
                */
                var g = selection.append("g").attr("transform", "translate(" + 0 + "," + 0 + ") rotate(45)") //TODO
                g.call(b)
            }
            var svg = selection.append("g")
            if (regions.length == 1) {
                renderTri(svg, 0, 0, scales[0])
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
                  var g = svg.append("g").attr("transform","translate("+(offset+rWidth/2) +","+(width/2-rWidth/2)+")")
                  scales[i] = d3.scaleLinear().domain([d.start,d.end]).range([0,rWidth/Math.SQRT2])
                  renderTri(g, 0, 0, scales[i])
                  offset += rWidth + gap

                })


                var b = S.brush()
                    .x(width / 2) //TODO THIS FOR MULTI
                    .y(0)
                    .theta(Math.PI / 4)
                    .on("brush", function (d) {
                        buffer = d;
                        listeners.call("lbrush", this, d)
                    })
                    .on("click", function (e) {
                        //console.log("submit",d,buffer)
                        var d = buffer
                        regions[0].start = Math.round(d[0][0])
                        regions[0].end = Math.round(d[1][0])
                        regions[1].start = Math.round(d[0][1])
                        regions[1].end = Math.round(d[1][1])

                        //listeners.call("submit",this,regions)
                    })
                    .xscale(scales[0])
                    .yscale(scales[1])
                svg.append("g").attr("transform","translate("+ 0 +","+ 0 + ")").call(b)

            }
        }

        return chart
    }

}(d3, snow))
