//　one or two region brushes for HiC one or two region view.
// integrate tri brush and rect brush.

var snow = snow || {};
(function (d3, S) {
    var regions = [{
        "chr": "chr1",
        "start": 0,
        "end": 100000
    },{
        "chr": "chr2",
        "start": 0,
        "end": 300000
    }


    ]
    var scales = [d3.scaleLinear().domain([0, 100000]).range([0, 300])]
    S.scopebrush = function () {
        var dispatch = d3.dispatch("new")
        var width = 300
        var chart = function (selection) {
            var renderTri = function (selection, x, y, scale) {
                var width = scale.range()[1]-scale.range()[0]
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
                regions.forEach(function(d){
                  offsets.push(offset)
                  var rWidth = eWidth * (d.end-d.start)/l
                  var g = svg.append("g").attr("transform","translate("+(offset+rWidth/2) +","+(200-rWidth/2)+")")
                  renderTri(g, 0, 0, d3.scaleLinear().domain([d.start,d.end]).range([0,rWidth/Math.SQRT2]))
                  offset += rWidth + gap

                })


            }
        }

        return chart
    }

}(d3, snow))
