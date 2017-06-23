(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
   typeof define === 'function' && define.amd ? define(['exports'], factory) :
   (factory((global.snow = global.snow || {})));
}(this, (function (exports) { 'use strict';

var symbolTriangle = {
    draw: function (context, size) {
        context.moveTo(0, 0);
        context.lineTo(size, 0);
        context.lineTo(size / 2, -size / 2);
        context.closePath();
    }
};

var brush = function() {
   var border  =[[0,0],[500,500]];//[x,y]
   var x0, y0, x1, y1, xf, yf,width,height;
   var xi = 0, yi = 0;
   var x=0,y=0; //x,y is the coord system start point?
   var theta = Math.PI / 4;
   var status = {};
   var xscale = d3.scaleLinear().range([0,500]).domain([0,500]);
   var yscale = d3.scaleLinear().range([0,500]).domain([0,500]);
   var brush = function(selection) {
     var G = selection.append("g").attr("transform", "translate("+x+","+y+") rotate(" + theta / Math.PI * 180 + ")");
     if (border!=undefined) {
       var bg = G.append("rect")
             .attr("x",border[0][0])
             .attr("y",border[0][1])
             .attr("width",border[1][0]-border[0][0])
             .attr("height",border[1][1]-border[0][1])
             .attr("fill","aliceblue")
             .attr("opacity",0.2);

        bg.call(
          d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
        );


     }
     var g = G.append("g");
     var rect = g.append("rect").classed("brush",true).attr("opacity",0.2);
     rect.call(d3.drag().on("drag", move).on("start", start)
       .on("end", end));
     rect.on("click",function(e){
       console.log("click rect",e);
       listeners.call("click",this,status);
     });
     listeners.on("activate",function(d){
       rect.attr("opacity",0.2);
     });
     listeners.on("deactivate",function(d){
       rect.attr("opacity",0.0);
     });
     listeners.on("brush.local", function(d){
       status = d;
     });
     var fix = function(x,y){
       var r = [x,y];
       r[0] = Math.max(border[0][0],Math.min(border[1][0]-width,r[0]));
       r[1] = Math.max(border[0][1],Math.min(border[1][1]-height,r[1]));
       return r
     };
     function invert(d) {
      var lx1 = xscale.invert(d[0][0]);
      var lx2 = xscale.invert(d[1][0]);
      var ly1 = yscale.invert(d[0][1]);
      var ly2 = yscale.invert(d[1][1]);
      return [[Math.min(lx1,lx2),Math.min(ly1,ly2)],[Math.max(lx1,lx2),Math.max(ly1,ly2)]]
     }
     function start(d) {
       console.log("start move");
       d3.select(this).attr("stroke", "blue").attr("stroke-width", 2);
       xf = d3.event.x;
       yf = d3.event.y;
     }

     function move(d) {
       xi = d3.event.x + xi - xf;
       yi = d3.event.y + yi - yf;

       var r = fix(xi,yi);
       xi = r[0];
       yi = r[1];
       //TODO fit the border for xi,yi???
       g.attr("transform", "translate(" + r[0] + "," + r[1] + ")");

       listeners.call("brush", this, invert([[r[0],r[1]],[r[0]+width,r[1]+height]]));
     }

     function end(d) {
       d3.select(this).attr("stroke-width", 0);
     }

     function rotate(d, theta) {
       return [Math.cos(theta) * d[0] + Math.sin(theta) * d[1], -Math.sin(theta) * d[0] + Math.cos(theta) * d[1]]
     }


     function dragstarted(d) {
       if (d3.event.defaultPrevented) return;
       x0 = d3.event.x;
       y0 = d3.event.y;
       listeners.call("start", this, [x0,y0]);
     }

     function dragged(d) {
       if (d3.event.defaultPrevented) return;
       x1 = d3.event.x;
       y1 = d3.event.y;
       var r0 = [x0, y0];
       var r1 = [x1, y1];
       if (border != undefined) {
         r0[0] = Math.max(border[0][0],Math.min(r0[0],border[1][0]));
         r0[1] = Math.max(border[0][1],Math.min(r0[1],border[1][1]));
         r1[0] = Math.max(border[0][0],Math.min(r1[0],border[1][0]));
         r1[1] = Math.max(border[0][1],Math.min(r1[1],border[1][1]));
       }
       var p = [Math.min(r0[0], r1[0]), Math.min(r1[1], r0[1])];
       xi = p[0];
       yi = p[1];
       width = Math.abs(r0[0] - r1[0]);
       height = Math.abs(r0[1] - r1[1]);
       g.attr("transform", "translate(" + p[0] + "," + p[1] + ")");
       rect.attr("height", height).attr("width", width);
       listeners.call("brush", this, invert([[p[0],p[1]],[p[0]+width,p[1]+height]]));
     }
     function dragended(d) {
       if (d3.event.defaultPrevented) return;
       //listeners.call("end", this, [[p[0],yi],[xi+width,yi+height]]);
     }
   };
   var listeners = d3.dispatch(brush, "start","brush","end","click","activate","deactivate");
   /* TO FIX
   brush.extent = function() {
     return [[xi,yi],[xi+width,yi+height]]
   }
   */
   brush.activate = function(_) {
     listeners.call("activate",this,_);
   };
   brush.deactivate = function(_) {
     listeners.call("deactivate",this,_);
   };
   brush.theta = function(_) { return arguments.length ? (theta= _, brush) : theta; };
   brush.border = function(_) { return arguments.length ? (border= _, xscale.range([border[0][0],border[1][0]]),yscale.range([border[1][0],border[1][1]]),brush) : border; };
   brush.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? brush : value;
   };
   brush.x = function(_) { return arguments.length ? (x= _, brush) : x; };
   brush.y = function(_) { return arguments.length ? (y= _, brush) : y; };
   brush.xdomain = function(_) {
     return arguments.length? (xscale.domain(_),brush):xscale.domain();
   };
   brush.ydomain = function(_) {
     return arguments.length? (yscale.domain(_),brush):yscale.domain();
   };
   brush.xscale = function(_) { return arguments.length ? (xscale= _, border[0][0]=xscale.range()[0],border[1][0]=xscale.range()[1],brush) : xscale; };
   brush.yscale = function(_) { return arguments.length ? (yscale= _, border[0][1]=yscale.range()[0],border[1][1]=yscale.range()[1],brush) : yscale; };
   return brush
 };

var axis = function () {
        //var dispatcher = d3.dispatch(chart,"")
        var scale = d3.scaleLinear().domain([0, 1000]).range([0, 500]);
        var el, rect;
        var x = 0,
            y = 0;
        var height = 50;
        var chart = function (selection) {
            var tickCount = 5;
            var tickFormat = d3.formatPrefix(".2",1e6);
            var axisX = d3.axisBottom(scale).ticks(tickCount).tickFormat(tickFormat);
            el = selection.append("g")
                .attr("transform", "translate(" + x + "," + y + ")");
            el.call(axisX);
        };
        var response = function (d) {
            if (!arguments.length) {
                el.selectAll("rect").remove();

            } else {

                if (d.constructor !== Array) {
                    d = [d];
                }
                var rects = el.selectAll("rect").data(d);
                rects.enter()
                    .append("rect")
                    .attr("height", height)
                    .attr("fill", "black")
                    .attr("opacity", 0.2)
                    .merge(rects)
                    .attr("x", function (e) {
                        var x0 = scale(e.start) || scale(e[0]) || 0;
                        var x1 = scale(e.end) || scale(e[1]) || 0;
                        return Math.min(x0, x1)
                    })
                    .attr("width", function (e) {
                        var x0 = scale(e.start) || scale(e[0]) || 0;
                        var x1 = scale(e.end) || scale(e[1]) || 0;
                        return Math.abs(x0 - x1)
                    });
                rects.exit().remove();
            }
        };
        chart.response = function (e) {
            response(e);
        };
        chart.scale = function (_) {
            return arguments.length ? (scale = _, chart) : scale;
        };
        chart.x = function (_) {
            return arguments.length ? (x = _, chart) : x;
        };
        chart.y = function (_) {
            return arguments.length ? (y = _, chart) : y;
        };
        return chart
    };

var symbolFlag = {
    draw: function (context, size) {
        context.moveTo(0, 0);
        context.lineTo(0, size);
        context.lineTo(size, 0);
        context.closePath();
    }
};

/*Brush Snow Triangle /\ */
    var brushTri = function () {
        var edge = 500; // 直角边　edge length. scale.range() = scale.range() = [0,edge]
        var x0, y0, x1, y1, xf, yf, width, height;
        var xi = 0,
            yi = 0;
        var x = 0,
            y = 0; //x,y is the coord system start point?
        var theta = 0;
        var status = {};
        var scale = d3.scaleLinear().range([0, 500]).domain([0, 500]);
        var yscale = d3.scaleLinear().range([0, 500]).domain([500, 0]); //domain reverse.

        var G;
        var flag = function (selection) {
            selection.each(function (d) {
                d3.select(this)
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")"
                    });
                var path = d3.select(this).selectAll(".flag")
                    .data([d]);
                path.enter().append("path").classed("flag", true)
                    .merge(path)
                    .attr("d", d3.symbol().type(symbolFlag).size(d.size))
                    .style("fill", "black")
                    .style("opacity", 0.2);
            });
        };
        var listeners = d3.dispatch(brush, "start", "brush", "end", "click", "activate", "deactivate","brush.local");
        var brush = function (selection) {
            G = selection.append("g").attr("transform", "translate(" + x + "," + y + ") rotate(" + theta / Math.PI * 180 + ")");
            var tri = G.append("path")
                .attr("d", d3.symbol().type(symbolFlag).size(edge))
                .style("fill", "white")
                .style("opacity", 0.05); //for debug

            tri.call(
                d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            );
            var g = G.append("g");
            var rect = g.append("rect").classed("brush", true).attr("opacity", 0.2);
            rect.call(d3.drag().on("drag", move).on("start", start)
                .on("end", end));
            rect.on("click", function (e) {
                listeners.call("click",this,status);
            });
            listeners.on("deactivate", function (d) {
                rect.attr("opacity", 0.0);
            });
            listeners.on("activate", function (d) {
                rect.attr("opacity", 0.2);
            });
            var fix = function (x, y) {
                if (x + y + width + height > edge) {
                    x = edge - width - height - y;
                }
                var newx = Math.max(0, Math.min(edge - width - height, x));
                var newy = Math.max(0, Math.min(edge - height - width, y));
                return [newx, newy]
            };

            function invert(d) {
                var lx1 = scale.invert(d[0][0]);
                var lx2 = scale.invert(d[1][0]);
                var ly1 = yscale.invert(d[0][1]);
                var ly2 = yscale.invert(d[1][1]);
                return [
                    [Math.min(lx1, lx2), Math.min(ly1, ly2)],
                    [Math.max(lx1, lx2), Math.max(ly1, ly2)]
                ]
            }

            function start(d) {
                console.log("start move");
                rect.attr("opacity", 0.2);
                d3.select(this).attr("stroke", "blue").attr("stroke-width", 2);
                xf = d3.event.x;
                yf = d3.event.y;
            }

            function move(d) {
                xi = d3.event.x + xi - xf;
                yi = d3.event.y + yi - yf;
                var r = fix(xi, yi);
                xi = r[0];
                yi = r[1];
                g.attr("transform", "translate(" + r[0] + "," + r[1] + ")");
                listeners.call("brush", this, invert([
                    [r[0], r[1]],
                    [r[0] + width, r[1] + height]
                ]));
            }

            function end(d) {
                d3.select(this).attr("stroke-width", 0);
            }

            function rotate(d, theta) {
                return [Math.cos(theta) * d[0] + Math.sin(theta) * d[1], -Math.sin(theta) * d[0] + Math.cos(theta) * d[1]]
            }


            function dragstarted(d) {
                if (d3.event.defaultPrevented) return;
                x0 = d3.event.x;
                y0 = d3.event.y;
                listeners.call("start", this, [x0, y0]);
            }

            function dragged(d) {
                if (d3.event.defaultPrevented) return;
                x1 = Math.max(0, d3.event.x);
                y1 = Math.max(0, d3.event.y);
                if (x1 + y1 >= edge) {
                    x1 = Math.max(0, edge - y1);
                    y1 = Math.max(0, edge - x1);
                }
                if (x1 + y0 > edge) {
                    x1 = Math.max(0, edge - y0);
                }
                if (y1 + x0 > edge) {
                    y1 = Math.max(0, edge - x0);
                }
                width = Math.abs(x1 - x0);
                height = Math.abs(y1 - y0);
                g.attr("transform", "translate(" + Math.min(x0, x1) + "," + Math.min(y0, y1) + ")");
                rect.attr("height", height).attr("width", width);
                listeners.call("brush", this, invert([
                    [Math.min(x0, x1), Math.min(y0, y1)],
                    [Math.min(x0, x1) + width, Math.min(y0, y1) + height]
                ]));
            }

            function dragended(d) {
                if (d3.event.defaultPrevented) return;
                //listeners.call("end", this, [[p[0],yi],[xi+width,yi+height]]);
            }
        };
        var highlight=function(d) {
            var data;
            if (typeof d[0] == "number") {
                data = [{
                        "x": scale(d[0]),
                        "y": yscale(d[1]),
                        "size": scale(d[1]) - scale(d[0])
                    },
                    //{"x":scale(d[0][1]),"y":yscale(d[1][1]),"size":scale(d[1][1])-scale(d[0][1])}
                ];
            } else {
                data = [{
                        "x": scale(d[0][0]),
                        "y": yscale(d[1][0]),
                        "size": scale(d[1][0]) - scale(d[0][0])
                    },
                    {
                        "x": scale(d[0][1]),
                        "y": yscale(d[1][1]),
                        "size": scale(d[1][1]) - scale(d[0][1])
                    }
                ];
            }
            var b = G.selectAll(".hLite").data(data);
            //b.exit().remove()
            b.enter().append("g").classed("hLite", true)
            .merge(b)
            .call(flag);
        };

        listeners.on("deactivate.local", function (d) {
            G.selectAll(".hLite").remove();
        });
        listeners.on("brush.local", function(d){
          status = d;
          highlight(d);
        });
        brush.theta = function (_) {
            return arguments.length ? (theta = _, brush) : theta;
        };
        brush.on = function () {
            var value = listeners.on.apply(listeners, arguments);
            return value === listeners ? brush : value;
        };
        brush.x = function (_) {
            return arguments.length ? (x = _, brush) : x;
        };
        brush.y = function (_) {
            return arguments.length ? (y = _, brush) : y;
        };
        brush.domain = function (_) {
            return arguments.length ? (scale.domain(_), yscale.domain([_[1], _[0]]), brush) : scale.domain();
        };
        brush.activate = function (_) {
            listeners.call("activate", this, _);
        };
        brush.deactivate = function (d) {
            listeners.call("deactivate", this, d);
            /** TO FIX THIS **/

        };
        brush.process = function(code,data) {
            if (code == "brush") {
                highlight(data);
            }
        };
        brush.scale = function (_) {
            return arguments.length ? (scale = _, edge = scale.range()[1] - scale.range()[0], yscale.domain([scale.domain()[1], scale.domain()[0]]).range(scale.range()), brush) : scale;
        };

        brush.edge = function (_) {
            return arguments.length ? (edge = _, scale.range([0, edge]), yscale.range([0, edge]), brush) : edge;
        };
        return brush
    };

function nearby(a,b) {
    if (a.chr!=b.chr) {return false}
    var l = Math.max(a.end,b.end) - Math.min(a.start,b.start);
    if (((a.end-a.start)+(b.end-b.start))/ l > 0.95) {
      return true
    }
    return false
}
function merge(a,b) {
    return {"chr":a.chr,"start":Math.min(a.start,b.start),"end":Math.max(a.end,b.end)}
}
var brush$1 = function () {
    var dispatch = d3.dispatch("brush", "click");
    var listeners = d3.dispatch("brush", "click");
    var width = 700;
    var G = [{}, {}, {}];
    var Bs = [{}, {}, {}];
    var regions = [{
        "chr": "chr1",
        "start": 0,
        "end": 300000
    }, {
        "chr": "chr2",
        "start": 0,
        "end": 200000
    }];
    var scales = [d3.scaleLinear().domain([0, 100000]).range([0, 100]), d3.scaleLinear().domain([0, 300000]).range([0, 300])];

    var chart = function (selection) {
        var renderTri = function (selection, x, y, scale, id) {
            var width = scale.range()[1] - scale.range()[0];
            Bs[id] = brushTri()
                .x(x)
                .y(y)
                .on("brush", function (d) {
                    var e = {
                        "from": id,
                        "d": d
                    };
                    dispatch.call("brush", this, e);
                })
                .on("click", function (d) {
                    var e = {
                        "from": id,
                        "d": d
                    };
                    dispatch.call("click", this, e);
                })
                .scale(scale)
                .edge(width);
            var l = scale.range()[1]-scale.range()[0];
            var axisScale = d3.scaleLinear().domain(scale.domain()).range([scale.range()[0]/Math.SQRT2*2,scale.range()[1]/Math.SQRT2*2]);
            var axis1 = axis().x(-l/Math.SQRT2).y(l/Math.SQRT2).scale(axisScale); //TODO
            selection.call(axis1);
            var g = selection.append("g").attr("transform", "translate(" + 0 + "," + 0 + ") rotate(45)"); //TODO
            g.call(Bs[id]);
        };
        var render1 = function(svg) {
          var d = regions[0];
          G[0].attr("transform", "translate(" + (0 + width / 2) + "," + (width / 2 - width / 2) + ")");
          scales[0] = d3.scaleLinear().domain([d.start, d.end]).range([0, width / Math.SQRT2]);
          renderTri(G[0], 0, 0, scales[0], 0);
        };
        var render2 = function (svg) {
            var offsets = [];
            var gap = 10;
            var l = 0;
            var offsets = [];

            var offset = 0;
            var eWidth = width - (regions.length - 1) * gap;
            regions.forEach(function (d) {
                l += (+d.end - d.start);
            });
            regions.forEach(function (d, i) {
                offsets.push(offset);
                var rWidth = eWidth * (d.end - d.start) / l;
                G[i].attr("transform", "translate(" + (offset + rWidth / 2) + "," + (width / 2 - rWidth / 2) + ")");
                scales[i] = d3.scaleLinear().domain([d.start, d.end]).range([0, rWidth / Math.SQRT2]);
                renderTri(G[i], 0, 0, scales[i], i);
                offset += rWidth + gap;

            });

            var yscale = d3.scaleLinear().domain([scales[1].domain()[1], scales[1].domain()[0]]).range(scales[1].range());
            Bs[2] = brush()
                .x(width / 2) //TODO THIS FOR MULTI
                .y(0)
                .theta(Math.PI / 4)
                .on("brush", function (d) {
                    var e = {
                        "from": 2,
                        "d": d
                    };
                    dispatch.call("brush", this, e);
                })
                .on("click", function (d) {
                    var e = {
                        "from": 2,
                        "d": d
                    };
                    dispatch.call("click", this, e);
                })
                .xscale(scales[0])
                .yscale(yscale);
            G[2].call(Bs[2]);
        };
        var render = function() {
          G[0].selectAll("*").remove();
          G[1].selectAll("*").remove();
          G[2].selectAll("*").remove();
          console.log(regions);
          if (regions.length == 1) {
              console.log("region1");
              render1(svg);
          } else if (regions.length == 2) {
              render2(svg);
          }
        };
        var translate = function(d) {
          var chr0,chr1;
          if (d.from==0 || d.from==1) {
            chr0 = regions[d.from].chr;
            chr1 = regions[d.from].chr;
          } else {
            console.log(d,regions);
            chr0 = regions[0].chr;
            chr1 = regions[1].chr;
          }
          var brushRegions = [{
              "chr": chr0,
              "start": Math.round(d.d[0][0]),
              "end": Math.round(d.d[1][0])

          }, {
              "chr": chr1,
              "start": Math.round(d.d[0][1]),
              "end": Math.round(d.d[1][1])
          }];
          if (nearby(brushRegions[0],brushRegions[1])) {
            brushRegions=[merge(brushRegions[0],brushRegions[1])];
          }
          return brushRegions;
        };
        dispatch.on("brush.local", function (d) {
            G.forEach(function (d0, i) {
                if (d.from != i) {
                    if (Bs[i].deactivate) {
                    Bs[i].deactivate(d.d);
                  }
                } else {
                  if (Bs[i].activate) {
                    Bs[i].activate(d.d);
                  }
                }
                if (d.from == 2 && i != 2) {
                    Bs[0].process("brush", [d.d[0][0], d.d[1][0]]);
                    Bs[1].process("brush", [d.d[0][1], d.d[1][1]]);
                }
            });
            listeners.call("brush",this,translate(d));
        });

        dispatch.on("click.local", function (d) {
            regions = translate(d);
            console.log(regions);
            render();
            listeners.call("click",this,regions);
            //render()
        });
        var svg = selection.append("g");
        G[0] = svg.append("g");
        G[1] = svg.append("g");
        G[2] = svg.append("g").attr("transform", "translate(" + 0 + "," + 0 + ")");
        render();
    };
    chart.on = function () {
        var value = listeners.on.apply(listeners, arguments);
        return value === listeners ? chart : value;
    };
    chart.regions = function(_) { return arguments.length ? (regions= _, chart) : regions; };
    chart.width = function(_) { return arguments.length ? (width= _, chart) : width; };
    return chart
};

var region = function (d) { //regionForm
    var chrs;
    var regionNum;
    var regions;
    var stacks = []; //previous regions; TODO
    var regionsSend; //committed send. TODO
    var send = function (d) {
        console.log(d);
    };
    var lengths = [0, 0]; //two regions;
    var form = {
        "chrs": [], //chrs.
        "ses": [], //start end,
        "info" : [] //lendiv;
    };
    var dispatch = d3.dispatch("update");
    var chr2idx = function(c) {
      var idx = -1;
      chrs.forEach(function(d,i){
        if (c==d.Name) {
          idx = i;
        }
      });
      return idx;
    };
    var chart = function (selection) {
        var data = [];
        for (var i = 0; i < regionNum; i++) {
            data.push(chrs);
        }

        //TODO RegionNum Selection.
        selection
            .selectAll(".entry")
            .data(data)
            .enter()
            .append("div")
            .classed("entry", true)
            .call(chrOpts);
        selection
            .selectAll(".send")
            .data([0])
            .enter()
            .append("div")
            .classed("send", true)
            .append("button")
            .classed("btn",true)
            .attr("value", "submit")
            .on("click", function () {
                parseRegions();
                send(regions);
            }).text("submit");
    };
    var default_range = function (length) {
        return 0 + "-" + length
    };
    var chrOpts = function (selection) {
        selection.each(function (chrs, i) {
            //d3.select(this).selectAll("div").remove()
            var div = d3.select(this);
            var id = "region" + i;
            div.append("label")
                .attr("for", id)
                .text(id);
            var sel = div.append("select").classed("form-control", true).attr("id", id);
            form["chrs"].push(sel);
            form["chrs"][i].selectAll("option")
                .data(chrs)
                .enter()
                .append("option")
                .attr("value", function (d, i) {
                    return d.Name
                })
                .attr("length", function (d, i) {
                    return d.Length
                })
                .text(function (d, i) {
                    return d.Name
                });
            var name;
            var length;
            sel.on("change", function (d) {
                lendiv.html("Name:" + chrs[this.selectedIndex].Name + " Length:" + chrs[this.selectedIndex].Length);
                name = chrs[this.selectedIndex].Name;
                length = chrs[this.selectedIndex].Length;
                form["ses"][i].node().value = default_range(length);
                lengths[i] = length;
                //dispatch.call("update")
            });

            var lendiv = d3.select(this).append("div");
            var inputdiv = d3.select(this).append("div");
            var se = inputdiv.append("input")
                .attr("id", "region" + i + "se")
                .style("width", "160px"); //TODO remove ID and get state.
            form["ses"].push(se);
            form["info"].push(lendiv);
                //TODO Add submit button and commit sen
        });

    };
    var parseRegions = function () {
        regions = [];
        for (var i = 0; i < regionNum; i++) {
            var chr = form["chrs"][i].node().value;
            var se = form["ses"][i].node().value;
                //console.log(chr, se)
            var x = se.split("-");
            regions.push({
                "chr": chr,
                "start": +x[0],
                "end": +x[1],
                "length": lengths[i]
            });
        }
    };
    chart.regions = function (_) { //return regions or set regions function.
        //var num = d3.select("#regionNum").node().value
        if (!arguments.length) {
            parseRegions();
            return regions
        } else {
            regions = _;
            //TODO update regions? change region number?
            for (var i = 0; i < regions.length; i++) {
                 var name = regions[i].chr.replace("chr","");
                form["chrs"][i].node().value = name;
                var idx = chr2idx(name);
                form["ses"][i].node().value = regions[i].start + "-" + regions[i].end; //use ng solve this?
                console.log(chrs,idx);
                form["info"][i].html("Name:" + chrs[idx].Name + " Length:" + chrs[idx].Length);
                lengths[i] = chrs[idx].Length;
            }
            return chart;
        }

    };
    chart.regionNum = function (_) {
        return arguments.length ? (regionNum = _, chart) : regionNum;
    };
    chart.chrs = function (_) {
            return arguments.length ? (chrs = _, chart) : chrs;
        };
        //chart.lengths　＝　function(){return lengths;}
    chart.send = function (_) {
        return arguments.length ? (send = _, chart) : send;
    };
    return chart
};

var parameter = function () {
    var data = {};
    var chart = function (selection) {
            selection.selectAll(".paraTable").remove();
            var table = selection.selectAll(".paraTable").data([data]);
            table.enter().append("table")
                .classed("paraTable",true)
                .merge(table)
                .classed("table", true);
            //table.selectAll("*").remove();
            var thead = table.append("thead");
            var tbody = table.append("tbody");
            var keys = Object.keys(data);
            var rows = tbody.selectAll("tr")
                .data(keys)
                .enter()
                .append("tr");
            rows.append("td").text(function(d){return d});
            rows.append("td").text(function(d){return data[d]});

        };
    chart.data = function (_) {
        return arguments.length ? (data = _, chart) : data;
    };
    return chart;
};

var colorbar = function() {
    var color1 = "#FFF";
    var color2 = "#F00";
    var width = 50;
    var height = 10;
    var x = 20;
    var y = 20;
    var chart = function (selection) { //selection is canvas;
        var ctx = selection.node().getContext("2d");
        var grd = ctx.createLinearGradient(x, y, x + width, y);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        ctx.fillStyle = grd;
        ctx.fillRect(x, y, width, height);
    };
    chart.width = function (_) {
        return arguments.length ? (width = _, chart) : width;
    };
    chart.height = function (_) {
        return arguments.length ? (height = _, chart) : height;
    };
    chart.x = function (_) {
        return arguments.length ? (x = _, chart) : x;
    };
    chart.y = function (_) {
        return arguments.length ? (y = _, chart) : y;
    };
    chart.color1 = function (_) {
        return arguments.length ? (color1 = _, chart) : color1;
    };
    chart.color2 = function (_) {
        return arguments.length ? (color2 = _, chart) : color2;
    };
    return chart
};

var canvasToolYAxis = function (context, scale, x, y, height, label) {
    context.save();
    context.translate(x,y);
    var tickCount = 5,
        tickSize = 6,
        tickPadding = 3,
        ticks = scale.ticks(tickCount),
        tickFormat = scale.tickFormat(tickCount, "s");

    context.beginPath();
    ticks.forEach(function (d) {
        context.moveTo(0, scale(d));
        context.lineTo(6, scale(d));
    });
    context.strokeStyle = "black";
    context.stroke();

    context.beginPath();
    context.moveTo(tickSize, 0);
    context.lineTo(0.5, 0);
    context.lineTo(0.5, height);
    context.lineTo(tickSize, height);
    context.strokeStyle = "black";
    context.stroke();

    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillStyle = "black";
    ticks.forEach(function (d) {
        context.fillText(tickFormat(d), tickSize + tickPadding, scale(d));
    });

    context.save();
    context.rotate(-Math.PI / 2);
    context.textAlign = "right";
    context.textBaseline = "top";
    context.font = "bold 10px sans-serif";
    if (label !== undefined) {
        context.fillText(label, -10, -10);
    }
    context.restore();
    context.restore();

};

var canvasToolXAxis = function(ctx,scale,x,y,height,label) {
  ctx.save();
  ctx.translate(x+height,y);
  ctx.rotate(Math.PI/2);
  canvasToolYAxis(ctx,scale,0,0,height,label);
  ctx.restore();
};

function totalLength(regions) {
    var l = 0;
    regions.forEach(function (r, i) {
        l += (+r.end) - (+r.start);
    });
    return l
}
function regionString(o) {
    return o.chr + ":" + o.start + "-" + o.end
}


function overlap(a, b) {
    var chrA = a.chr.replace("chr","").replace("Chr","");
    var chrB = b.chr.replace("chr","").replace("Chr","");
    if (chrA != chrB) {
        return false
    }
    if (b.end < a.start) {
        return false
    }
    if (a.end < b.start) {
        return false
    }
    return true
}
/*
export function default_range(length) {
    return Math.round(length * 2 / 10) + "-" + Math.round(length * 3 / 10)
}
*/

var B = {
  　Get : function (URI, callback) {
        var config = {};
        var ready = function (error, results) {
            config.URI = URI;
            config.trackIds = results[0];
            callback(config);
        };
        d3_queue.queue(2)
            .defer(d3.json, URI + "/list")
            .awaitAll(ready);
    }
    ,
    canvas : function () {
        var id = "default";
        var pos = 0; //for response rect TODO remove this limitation (change to id or get the response var)
        var height;
        var width;
        var regions;
        var x;
        var y;
        var URI = "";
        var barHeight = 50;
        var vertical = false;
        var canvas;
        var panel; //canvas parent for add svg;
        var binsize;
        var scale;
        var respSvg;
        var gap = 0; //TODO for gap axis
        var mode = 0; // "max" or "mean" { 0: mix (max,min,mean) , 1: mean, 2: max/min }
        var callback = function (d) {
            console.log("callback", d);
        };

        /* is this a really a static function? */
        var renderRegion = function (ctx, xoffset, yoffset, region, xscale, yscale, color, ncolor) {
            //  var ctx = canvas.node().getContext("2d");
            //console.log(mat, mat.length)

            for (var i = 0; i < region.length; i++) {
                ctx.fillStyle = color;
                var r = xscale.range();
                if (isNaN(region[i].From) || isNaN(region[i].To)) {
                    continue; //add handle large width bug
                }
                var x1 = xscale(region[i].From);
                var x2 = xscale(region[i].To);
                if (x1 < r[0]) {
                    x1 = r[0];
                }
                if (x2 > r[1]) {
                    x2 = r[1];
                }
                var width = x2 - x1;
                if (width > 100) {
                    console.log("debug region", region[i]);
                }
                var ymax = region[i].Max || region[i].Value;
                var ymin = region[i].Min || region[i].Value;
                var yv = region[i].Sum / region[i].Valid || region[i].Value;
                var y1 = yscale(yv);
                var ym = yv < 0 ? yscale(ymin) : yscale(ymax);
                var y0 = yscale(0);
                if (yv<0){
                  ctx.fillStyle = ncolor;
                } else {
                  ctx.fillStyle = color;
                }
                //var y1 = barHeight - height
                if (mode == 0 || mode == 1) {
                    if (y0 < 0) {
                        ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - y1), width, y1 - 0);
                        //ctx.fillRect(x + xoffset + x1, y + yoffset , width, y1);
                    } else {

                        if (y1 > y0) {
                            ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - y1), width, y1 - y0);
                        } else {
                            ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - y0), width, y0 - y1);
                        }
                    }
                }
                if (mode == 0) {
                    ctx.fillStyle = "#111";
                    ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - ym), width, 1);
                }
                if (mode == 2) {
                    if (y0 < 0) {
                        ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - ym), width, ym - 0);
                    } else {
                        if (y1 > y0) {
                            ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - ym), width, ym - y0);
                        } else {
                            ctx.fillRect(x + xoffset + x1, y + yoffset + (barHeight - y0), width, y0 - ym);
                        }
                    }
                }

            }
        };
        //TODO get a simple rotated version.
        var renderRegionVertical = function (ctx, yoffset, xoffset, region, xscale, yscale, color, ncolor) {
            for (var i = 0; i < region.length; i++) {
                ctx.fillStyle = color;
                var r = xscale.range();
                if (isNaN(region[i].From) || isNaN(region[i].To)) {
                    continue; //add handle large width bug
                }
                var x1 = xscale(region[i].From);
                var x2 = xscale(region[i].To);
                if (x1 < r[0]) {
                    x1 = r[0];
                }
                if (x2 > r[1]) {
                    x2 = r[1];
                }
                var width = x2 - x1;
                if (width > 100) {
                    console.log("debug region", region[i]);
                } //debug
                var ymax = region[i].Max || region[i].Value;
                var ymin = region[i].Min || region[i].Value;
                var yv = region[i].Sum / region[i].Valid || region[i].Value;
                if (yv<0){
                  ctx.fillStyle = ncolor;
                } else {
                  ctx.fillStyle = color;
                }
                var y1 = yscale(yv);
                var ym = yv < 0 ? yscale(ymin) : yscale(ymax);

                var y0 = yscale(0);
                //var y1 = barHeight - height
                if (mode == 1 || mode == 2) {
                    if (y0 < 0) {
                        ctx.fillRect(x + xoffset, y + yoffset + x1, y1 - 0, width);
                    } else {
                        if (y1 > y0) {
                            ctx.fillRect(x + xoffset + y0, y + yoffset + x1, y1 - y0, width);
                        } else {
                            ctx.fillRect(x + xoffset + y1, y + yoffset + x1, y0 - y1, width);
                        }
                    }
                }
                if (mode == 0) {
                    ctx.fillStyle = "#111";
                    ctx.fillRect(x + xoffset + ym, y + yoffset + x1, 1, width);
                }
                if (mode == 2) {
                    if (y0 < 0) {
                        ctx.fillRect(x + xoffset, y + yoffset + x1, ym - 0, width);
                    } else {
                        if (y1 > y0) {
                            ctx.fillRect(x + xoffset + y0, y + yoffset + x1, ym - y0, width);
                        } else {
                            ctx.fillRect(x + xoffset + ym, y + yoffset + x1, y0 - ym, width); //TODO TEST
                        }
                    }
                }


            }
        };
        var xscales, xoffsets, widths;



        var response = function (e) {
            var rdata = [];
            //console.log(e,regions)
            regions.forEach(function (r, i) {
                e.forEach(function (d, j) {
                    if (overlap(r, d)) {
                        var x = xscales[i](d.start) + xoffsets[i];
                        var l = xscales[i](d.end) + xoffsets[i] - x;
                        rdata.push({
                            "x": x,
                            "l": l
                        });
                    }
                });
            });
            //console.log("rdata",rdata)
            var r1 = respSvg.selectAll("rect").data(rdata);
              r1.exit().remove();
              r1.enter()
                .append("rect")
                .merge(r1);

              r1.attr("x", function (d) {
                    console.log("rx", d.x);
                    return d.x
                })
                .attr("y", 0)
                .attr("height", barHeight)
                .attr("width", function (d) {
                    return d.l
                })
                .attr("fill", function (d) {
                    return "#777"
                })
                .attr("opacity", 0.2);

        };
        var _render_ = function (error, results) {
            var min = Infinity;
            var max = -Infinity;
            xscales = [];
            xoffsets = [];
            widths = [];
            var yoffset = 0;
            var offset = 0;
            var totalLen = totalLength(regions);
            var effectWidth = width - (regions.length - 1) * gap;
            regions.forEach(function (d) {
                var w = (+(d.end) - (+d.start)) * effectWidth / totalLen;
                var scale = d3.scaleLinear().domain([+(d.start), +(d.end)]).range([0, w]);
                xscales.push(scale);
                xoffsets.push(offset);
                offset += w + gap;
                widths.push(w);
            });

            results.forEach(function (arr) {
                if (mode == 0 || mode == 2) {
                    arr.forEach(function (d) {
                        var v = d.Max || d.Value;
                        var vmin = d.Min || d.Value;
                        if (v > max) {
                            max = v;
                        }
                        if (vmin < min) {
                            min = vmin;
                        }
                    });
                } else {
                    arr.forEach(function (d) {
                        var v = d.Sum / d.Valid || d.Value;
                        if (v > max) {
                            max = v;
                        }
                        if (v < min) {
                            min = v;
                        }
                    });
                }

            });
            var yscale = d3.scaleLinear().domain([Math.min(0, min), Math.max(max, 0)]).range([0, barHeight]); //TODO?
            scale = yscale;
            var axisScale = d3.scaleLinear().domain([min, max]).range([barHeight, 0]);
            var color = d3.scaleOrdinal(d3.schemeCategory10);// TODO here.
            var background = "#FFF";
            if (vertical) {
                //renderRespVertical(); //TODO
                var ctx = canvas.node().getContext("2d");
                ctx.fillStyle = background;
                ctx.fillRect(x, y, barHeight, width);
                results.forEach(function (region, i) {
                    renderRegionVertical(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, "#333","#666");
                });
                canvasToolXAxis(ctx, axisScale, x, y + width, barHeight, id);
            } else {
                //renderResp(); //TODO
                var ctx = canvas.node().getContext("2d");
                ctx.fillStyle = background;
                ctx.fillRect(x, y, width, barHeight);
                results.forEach(function (region, i) {
                    renderRegion(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, "#333","#666");
                });

                canvasToolYAxis(ctx, axisScale, x + width, y, barHeight, undefined);

                ctx.fillText(id, x+10, y+10);
            }
            callback({
                "min": min,
                "max": max
            });
        };
        var rawdata = false;
        var _render = function () {
            var q = d3_queue.queue(2);
            if (binsize != -1) {
                rawdata = false;
                if (binsize == undefined) {
                    binsize = 1;
                }
                regions.forEach(function (d) {
                    q.defer(d3.json, URI + "/getbin/" + id + "/" + d.chr + ":" + d.start + "-" + d.end + "/" + binsize);
                });
            } else {
                rawdata = true;
                regions.forEach(function (d) {
                    q.defer(d3.json, URI + "/get/" + id + "/" + d.chr + ":" + d.start + "-" + d.end);
                });
            }
            q.awaitAll(_render_);
        };
        var render = function () {
            var length = totalLength(regions);
            var url = URI + "/binsize/" + id + "/" + length + "/" + width;
            console.log("URL", url);
            d3.json(url, function (d) {
                binsize = d;
                console.log("BINSIZE", binsize);
                _render();
            });
        };
        var chart = function (selection) { //selection is canvas;
            canvas = selection;
            panel.selectAll(".resp"+"_"+pos).remove();
            if (vertical) {
              respSvg = panel.append("svg")
                  .classed("resp_"+pos, true)
                  .style("postion", "absolute")
                  .style("top", y)
                  .style("left", x)
                  .attr("width", barHeight)
                  .attr("height", width)
                  .append("g")
                  .attr("transform","translate("+barHeight+","+0+") rotate(90)");
            } else {
              respSvg = panel.append("svg")
                  .classed("resp_"+pos, true)
                  .style("postion", "absolute")
                  .style("top", y)
                  .style("left", x)
                  .attr("width", width)
                  .attr("height", barHeight);
            }


            render();
        };
        var modes = ["mix", "mean", "max"];
        chart.mode = function (_) {
            if (!arguments.length) {
                return modes[mode]
            } else {
                mode = 0;
                if (_ == "max" || _ == 2) {
                    mode = 2;
                }
                if (_ == "mean" || _ == 1) {
                    mode = 1;
                }
                return chart
            }
        };
        chart.callback = function (_) {
            return arguments.length ? (callback = _, chart) : callback;
        };
        chart.panel = function (_) {
            return arguments.length ? (panel = _, chart) : panel;
        };
        chart.x = function (_) {
            return arguments.length ? (x = _, chart) : x;
        };
        chart.y = function (_) {
            return arguments.length ? (y = _, chart) : y;
        };
        chart.regions = function (_) {
            return arguments.length ? (regions = _, chart) : regions;
        };
        chart.width = function (_) {
            return arguments.length ? (width = _, chart) : width;
        };
        chart.height = function (_) {
            return arguments.length ? (height = _, chart) : height;
        };
        chart.URI = function (_) {
            return arguments.length ? (URI = _, chart) : URI;
        };
        chart.barHeight = function (_) {
            return arguments.length ? (barHeight = _, chart) : barHeight;
        };
        chart.response = function (e) {
            response(e);
        };
        chart.id = function (_) {
            return arguments.length ? (id = _, chart) : id;
        };
        chart.vertical = function (_) {
            return arguments.length ? (vertical = _, chart) : vertical;
        };
        chart.pos = function (_) {
            return arguments.length ? (pos = _, chart) : pos;
        };
        chart.scale = function (_) {
            return arguments.length ? (scale = _, chart) : scale;
        };
        chart.gap = function (_) {
            return arguments.length ? (gap = _, chart) : gap;
        };
        return chart
    },

    form : function () {
        var data;
        var number = 1;
        var trackInputs = [];
        var chart = function (selection) {
            selection.selectAll("*").remove();
            var form = selection.append("div").classed("form-group", true);
            form.append("label").text("Track");
            for (var i = 0; i < number; i++) {
                trackInputs.push(form.append("select").classed("form-control", true));
                trackInputs[i].selectAll("option")
                    .data(data.trackIds)
                    .enter()
                    .append("option")
                    .attr("value", function (d, i) {
                        return d
                    })
                    .text(function (d, i) {
                        return d
                    });
            }
        };
        chart.state = function () {
            if (number == 1) {
                return {
                    "track": trackInputs[0].node().value
                }
            } else {
                var v = [];
                trackInputs.forEach(function (d) {
                    v.push({
                        "track": d.node().value
                    });
                });
                return v;
            }
        };
        chart.number = function (_) {
            return arguments.length ? (number = _, chart) : number;
        };
        chart.data = function (_) {
            return arguments.length ? (data = _, chart) : data;
        };
        return chart
    }
};

var constant = function(){
  return {
    norms :[
        "NONE",
        "VC",
        "VC_SQRT",
        "KR",
        "GW_KR",
        "INTER_KR",
        "GW_VC",
        "INTER_VC",
        "LOADED"
    ],
    units: ["BP", "FRAG"]
  }
};
/*
var default_range = function (length) {
    return Math.round(length * 2 / 10) + "-" + Math.round(length * 3 / 10)
}
*/

/*triangle hic */

const norms$1 = constant().norms;
const units$1 = constant().units;

var H = {
    Get: function (URI, callback) {
        var ready = function (error, results) {
            if (error) throw error;
            var config = {};
            config.URI = URI;
            config.norms = results[0];
            config.units = results[1];
            config.chrs = results[2];
            config.chr2idx = {};
            config.chrs.forEach(function (d, i) {
                config.chr2idx[d.Name] = i;
            });
            config.bpres = results[3];
            callback(config);
        };
        d3_queue.queue(2)
            .defer(d3.json, URI + "/norms")
            .defer(d3.json, URI + "/units")
            .defer(d3.json, URI + "/list")
            .defer(d3.json, URI + "/bpres")
            .awaitAll(ready);
    },
    chart: function () { //cfg chart
        var data;
        var form;
        var unitInput, normInput, color1Input, color2Input;
        var chart = function (selection) {
            selection.selectAll("*").remove();
            form = selection.append("div").classed("form-group", true);
            form.append("label").text("Normalized Method");
            normInput = form.append("select").classed("form-control", true);
            normInput.selectAll("option")
                .data(data.norms)
                .enter()
                .append("option")
                .attr("value", function (d, i) {
                    return d
                })
                .text(function (d, i) {
                    return norms$1[d]
                });
            form.append("label").text("Units");
            unitInput = form.append("select").classed("form-control", true);
            unitInput.selectAll("option")
                .data(data.units)
                .enter()
                .append("option")
                .attr("value", function (d, i) {
                    return d
                })
                .text(function (d, i) {
                    return units$1[d]
                });
            if (data.units.length == 1) {
                unitInput.property("disabled", true);
            }
            var colorInputDiv = form.append("div");
            colorInputDiv.append("label").text("Min");
            color1Input = colorInputDiv.append("input").attr("type", "color")
                .attr("value", "#FFFFFF");
            colorInputDiv.append("label").text("Max");
            color2Input = colorInputDiv.append("input").attr("type", "color")
                .attr("value", "#FF0000");
        };
        chart.state = function (_) {
            if (!arguments.length) {
            return {
                "unit": unitInput.node().value,
                "norm": normInput.node().value,
                "color1": color1Input.node().value,
                "color2": color2Input.node().value
            }
          } else {
            unitInput.node().value = _.unit || 0;
            normInput.node().value = _.norm || 0;
            color1Input.node().value = _.color1 || "#FFF";
            color2Input.node().value = _.color2 || "#F00";
          }
        };
        chart.data = function (_) {
            return arguments.length ? (data = _, chart) : data;
        };
        return chart
    },
    /* HiC Canvas Render, Parameters Regions URI and Width Height, xoffset , yoffset */
    canvas: function () {
        /*parameters for canvas */
        var height;
        var width;
        var xoffset;
        var yoffset;
        var rotate = 0;
        var URI;

        /*parameters for hic data */
        var regions;
        var scales = [null, null];
        var bpres;
        var norm;
        var unit;

        /*auto load data */
        var resIdx;
        var min;
        var max;
        var mats;
        var cellSize;
        var offsets;
        var canvas;
        var svg;
        var panel;
        var gap = 20 / Math.SQRT2;
        var emit = function (d) {
            console.log("emit");
        };


        var generateQueryUrl = function (d) {
            var a = regions[d[0]];
            var b = regions[d[1]];
            var url = "/get2dnorm/" + regionString(a) + "/" + regionString(b) + "/" + resIdx + "/" + norm + "/" + unit + "/text";
            return url
        };
        /*TODO TO Triangle  x, y change? which should be region 1. after 3/4 rotate*/
        var renderTriangle = function (ctx, xoffset, yoffset, mat, cellSize, colorScale, region1, se1) {
            ctx.save();
            ctx.translate(xoffset, yoffset);
            ctx.rotate(-Math.PI / 4);
            var binsize = bpres[resIdx];
            var x0 = (se1[0] - region1.start) / binsize * cellSize;
            var y0 = (se1[0] - region1.start) / binsize * cellSize;
            var h0 = cellSize + y0;
            var w0 = cellSize + x0;
            var w1 = cellSize + (region1.end - se1[1]) / binsize * cellSize;
            var h1 = w1;
            var nx = mat.length;
            var ny = mat[0].length;
            if (nx == 0 || ny == 0) {
                return
            }

            /* NOT IN Flank First */
            for (var x = 1; x < mat.length - 1; x++) {
                for (var y = x; y < mat[0].length - 1; y++) {
                    ctx.fillStyle = colorScale(mat[x][y]); //mat[x][y] mirror
                    ctx.fillRect(y * cellSize + y0, x * cellSize + x0, cellSize, cellSize);
                }
            }

            //TODO REMOVE ONE
            ctx.fillStyle = colorScale(mat[0][0]);
            ctx.fillRect(0, 0, h0, w0);

            ctx.fillStyle = colorScale(mat[0][ny - 1]);
            ctx.fillRect(y0 + cellSize * (ny - 1), 0, h1, w0);
            /*
            ctx.fillStyle = colorScale(mat[nx - 1][0])
            ctx.fillRect(0, x0 + cellSize * (nx - 1),  h0, w1)
            */
            ctx.fillStyle = colorScale(mat[nx - 1][ny - 1]);
            ctx.fillRect(y0 + cellSize * (ny - 1), x0 + cellSize * (nx - 1), h1, w1);

            for (var y = 1; y < mat[0].length - 1; y++) {
                var l = nx - 1;
                ctx.fillStyle = colorScale(mat[0][y]);
                ctx.fillRect(y * cellSize + y0, 0, cellSize, w0); //TODO fix size?
                /*
                ctx.fillStyle = colorScale(mat[l][y]);
                ctx.fillRect( y * cellSize + y0,l * cellSize + x0,  w1, cellSize);
                */
            }
            for (var x = 1; x < mat.length - 1; x++) {
                var l = ny - 1;
                /*
                ctx.fillStyle = colorScale(mat[x][0]);
                ctx.fillRect( 0,x * cellSize + x0, cellSize, h0);
                */
                ctx.fillStyle = colorScale(mat[x][l]);
                ctx.fillRect(l * cellSize + y0, x * cellSize + x0, h1, cellSize);

            }
            ctx.restore();
        };
        var renderMatrix = function (ctx, xoffset, yoffset, mat, cellSize, colorScale, region1, se1, region2, se2) {
            //var ctx = canvas.node().getContext("2d");
            //inner matrix
            //TODO FIX render mirror.
            ctx.save();
            ctx.rotate(-Math.PI / 4);
            ctx.translate(xoffset, yoffset);

            var binsize = bpres[resIdx];
            var x0 = (se1[0] - region1.start) / binsize * cellSize;
            var y0 = (se2[0] - region2.start) / binsize * cellSize;
            var h0 = cellSize + y0;
            var w0 = cellSize + x0;
            var w1 = cellSize + (region1.end - se1[1]) / binsize * cellSize;
            var h1 = cellSize + (region2.end - se2[1]) / binsize * cellSize;
            var nx = mat.length;
            var ny = mat[0].length;
            if (nx == 0 || ny == 0) {
                return
            }
            ctx.fillStyle = colorScale(mat[0][0]);
            ctx.fillRect(0, 0, h0, w0);

            ctx.fillStyle = colorScale(mat[0][ny - 1]);
            ctx.fillRect(y0 + cellSize * (ny - 1), 0, h1, w0);

            ctx.fillStyle = colorScale(mat[nx - 1][0]);
            ctx.fillRect(0, x0 + cellSize * (nx - 1), h0, w1);

            ctx.fillStyle = colorScale(mat[nx - 1][ny - 1]);
            ctx.fillRect(y0 + cellSize * (ny - 1), x0 + cellSize * (nx - 1), h1, w1);

            for (var y = 1; y < mat[0].length - 1; y++) {
                var l = nx - 1;
                ctx.fillStyle = colorScale(mat[0][y]);
                ctx.fillRect(y * cellSize + y0, 0, cellSize, w0); //TODO fix size?
                ctx.fillStyle = colorScale(mat[l][y]);
                ctx.fillRect(y * cellSize + y0, l * cellSize + x0, cellSize, w1);
            }
            for (var x = 1; x < mat.length - 1; x++) {
                var l = ny - 1;
                ctx.fillStyle = colorScale(mat[x][0]);
                ctx.fillRect(0, x * cellSize + x0, h0, cellSize);
                ctx.fillStyle = colorScale(mat[x][l]);
                ctx.fillRect(l * cellSize + y0, x * cellSize + x0, h1, cellSize);
            }

            for (var x = 1; x < mat.length - 1; x++) {
                for (var y = 1; y < mat[0].length - 1; y++) {
                    ctx.fillStyle = colorScale(mat[x][y]);
                    ctx.fillRect(y * cellSize + y0, x * cellSize + x0, cellSize, cellSize);
                }
            }
            ctx.restore();
        };
        var color1;
        var color2;
        var color3; //for inter chromosome
        var color4; //for inter chromosome
        var background = "#FFF";
        var lineColor = "#FF0";
        var domain = undefined;
        var render = function (_) {
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = background;
            ctx.save();
            ctx.translate(xoffset, yoffset);
            //ctx.rotate(rotate)
            //ctx.fillRect(0, 0, width, height)

            var color;
            if (domain) {
                color = d3.scaleLog().domain([domain[0] + 1.0, domain[1] + 1.0]).range([color1, color2]); //TODO set scale.
            } else {
                color = d3.scaleLog().domain([min + 1.0, max + 1.0]).range([color1, color2]); //TODO set scale.
            }

            var colorScale = function (d) {
                if (isNaN(d)) {
                    return "#FFF" //color(0)
                } else {
                    return color(d + 1.0)
                }
            };

            var l = regions.length;

            var k = 0;
            //renderAxis(ctx)

            var se = [];
            regions.forEach(function (d, i) {
                se.push(correctedPosition(d.start, d.end, resIdx));
            });

            for (var i = 0; i < l; i++) {
                for (var j = i; j < l; j++) {
                    var x = offsets[i];
                    var y = offsets[j];
                    //renderMatrix(ctx, xoffset + x, yoffset + y, mats[k], cellSize, colorScale, regions[i] , se[i], regions[j],se[j])
                    //TODO. without rotation. upper triangle.
                    //TODO renderMatrix(ctx, x, y, mats[k], cellSize, colorScale, regions[i], se[i], regions[j], se[j])
                    if (i == j) {
                        renderTriangle(ctx, x, 0, mats[k], cellSize / Math.SQRT2, colorScale, regions[i], se[i]);
                    } else {
                        renderMatrix(ctx, y / Math.SQRT2, x / Math.SQRT2, mats[k], cellSize / Math.SQRT2, colorScale, regions[i], se[i], regions[j], se[j]);
                    }
                    k += 1;
                }
            }
            ctx.restore();
            if (!arguments.length) {
              callback({
                  "resolution": bpres[resIdx],
                  "max": max,
                  "min": min
              }); //callback to send parameters

            } else {
              if (typeof _ === 'function') {
                _();
              }
            }

        };



        var callback = function (d) {
            console.log(d);
        };
        var dataReady = function (errors, results) {
            //console.log(results)
            callback(results);
            min = Infinity;
            max = -Infinity;
            mats = [];
            results.forEach(function (text, i) {
                var data = d3.tsvParseRows(text).map(function (row) {
                    return row.map(function (value) {
                        var v = +value;
                        if (min > v) {
                            min = v;
                        }
                        if (max < v) {
                            max = v;
                        }
                        return v;
                    });
                });
                //console.log(data);
                mats.push(data);

            });
            console.log("min,max", min, max);
            //TODO Call Render Function;
            render();
        };


        var regionsToResIdx = function () {
            var w = Math.min(width, height);
            var eW = w - gap * (regions.length - 1);
            var l = totalLength(regions);
            var pixel = l / eW;
            var resIdx = bpres.length - 1;
            for (var i = 0; i < bpres.length; i++) {
                if (bpres[i] < pixel) {
                    resIdx = i - 1;
                    break;
                }
            }
            cellSize = eW / (l / bpres[resIdx]);
            //  console.log(w, l, bpres[resIdx], cellSize)
            offsets = [];
            var offset = 0.0;
            regions.forEach(function (d, i) {
                offsets.push(offset);
                offset += cellSize * ((+d.end - d.start) / bpres[resIdx]) + gap;
            });
            return resIdx
        };
        var correctedPosition = function (start, end, resIdx) {
            var binsize = bpres[resIdx];
            return [Math.floor(start / binsize) * binsize, (Math.floor((end - 1) / binsize) + 1) * binsize]
        };
        var loadData = function () {
            var l = regions.length;
            var pairs = [];
            for (var i = 0; i < l; i++) {
                for (var j = i; j < l; j++) {
                    pairs.push([i, j]);
                }
            }
            resIdx = regionsToResIdx(regions, width, height); // TODO with width and length parameters
            //console.log("smart resIdx", resIdx)
            //d3.select("#bpRes").text(bpres[resIdx]) //TODO
            var q = d3_queue.queue(2);
            // /get2dnorm/{chr}:{start}-{end}/{chr2}:{start2}-{end2}/{resIdx}/{norm}/{unit}/{format}
            pairs.forEach(function (d, i) {
                var url = generateQueryUrl(d);
                q.defer(d3.text, URI + url);
            });
            q.awaitAll(dataReady);
        };
        var chart = function (selection) { //selection is canvas itself;
            canvas = selection;
            //panel = d3.select("#main") //TODO
            //cleanBrush();
            //add loading... here
            //render done.
            loadData();
        };
        chart.render = render; //TODO change name later.
        /*
        chart.loadData = function(callback) {
          loadData()
          return chart;
        }
        */
        chart.panel = function (_) {
            return arguments.length ? (panel = _, chart) : panel;
        };
        chart.svg = function (_) {
            return arguments.length ? (svg = _, chart) : svg;
        };
        chart.domain = function(_) { return arguments.length ? (domain= _, chart) : domain; };

        chart.height = function (_) {
            return arguments.length ? (height = _, chart) : height;
        };
        chart.width = function (_) {
            return arguments.length ? (width = _, chart) : width;
        };
        chart.xoffset = function (_) {
            return arguments.length ? (xoffset = _, chart) : xoffset;
        };
        chart.yoffset = function (_) {
            return arguments.length ? (yoffset = _, chart) : yoffset;
        };
        chart.regions = function (_) {
            return arguments.length ? (regions = _, chart) : regions;
        };
        chart.norm = function (_) {
            return arguments.length ? (norm = _, chart) : norm;
        };
        chart.unit = function (_) {
            return arguments.length ? (unit = _, chart) : unit;
        };
        chart.bpres = function (_) {
            return arguments.length ? (bpres = _, chart) : bpres;
        };
        chart.URI = function (_) {
            return arguments.length ? (URI = _, chart) : URI;
        };
        chart.color1 = function (_) {
            return arguments.length ? (color1 = _, chart) : color1;
        };
        chart.color2 = function (_) {
            return arguments.length ? (color2 = _, chart) : color2;
        };
        chart.background = function (_) {
            return arguments.length ? (background = _, chart) : background;
        };
        chart.emit = function (_) {
            return arguments.length ? (emit = _, chart) : emit;
        };
        chart.callback = function (_) {
            return arguments.length ? (callback = _, chart) : callback;
        };
        chart.rotate = function (_) {
            return arguments.length ? (rotate = _, chart) : rotate;
        };
        chart.gap = function (_) {
            return arguments.length ? (gap = _, chart) : gap;
        };

        return chart;
    }

};

const norms = constant().norms;
const units = constant().units;

var hic1 = {
    Get: H.Get,
    chart: H.chart,
    /* HiC Canvas Render, Parameters Regions URI and Width Height, xoffset , yoffset */
    canvas: function () {
        /*parameters for canvas */
        var height;
        var width;
        var xoffset;
        var yoffset;
        var URI;

        /*parameters for hic data */
        var regions;
        var scales = [null, null];
        var bpres;
        var norm;
        var unit;

        /*auto load data */
        var resIdx;
        var min;
        var max;
        var mats;
        var cellSize;
        var offsets;
        var canvas;
        var svg;
        var panel;
        var emit = function (d) {
            console.log("emit");
        };


        var generateQueryUrl = function (d) {
            var a = regions[d[0]];
            var b = regions[d[1]];
            var url = "/get2dnorm/" + regionString(a) + "/" + regionString(b) + "/" + resIdx + "/" + norm + "/" + unit + "/text";
            return url
        };
        var renderMatrix = function (ctx, xoffset, yoffset, mat, cellSize, colorScale, region1, se1, region2, se2) {
            //var ctx = canvas.node().getContext("2d");
            //inner matrix
            var binsize = bpres[resIdx];
            var x0 = (se1[0] - region1.start) / binsize * cellSize;
            var y0 = (se2[0] - region2.start) / binsize * cellSize;
            var h0 = cellSize + y0;
            var w0 = cellSize + x0;
            var w1 = cellSize + (region1.end - se1[1]) / binsize * cellSize;
            var h1 = cellSize + (region2.end - se2[1]) / binsize * cellSize;
            var nx = mat.length;
            var ny = mat[0].length;
            if (nx == 0 || ny == 0) {
                return
            }
            ctx.fillStyle = colorScale(mat[0][0]);
            ctx.fillRect(xoffset, yoffset, w0, h0);
            ctx.fillStyle = colorScale(mat[0][ny - 1]);
            ctx.fillRect(xoffset, yoffset + y0 + cellSize * (ny - 1), w0, h1);
            ctx.fillStyle = colorScale(mat[nx - 1][0]);
            ctx.fillRect(xoffset + x0 + cellSize * (nx - 1), yoffset, w1, h0);
            ctx.fillStyle = colorScale(mat[nx - 1][ny - 1]);
            ctx.fillRect(xoffset + x0 + cellSize * (nx - 1), yoffset + y0 + cellSize * (ny - 1), w1, h1);
            for (var y = 1; y < mat[0].length - 1; y++) {
                var l = nx - 1;
                ctx.fillStyle = colorScale(mat[0][y]);
                ctx.fillRect(xoffset, yoffset + y * cellSize + y0, w0, cellSize);
                ctx.fillStyle = colorScale(mat[l][y]);
                ctx.fillRect(xoffset + l * cellSize + x0, yoffset + y * cellSize + y0, w1, cellSize);
            }
            for (var x = 1; x < mat.length - 1; x++) {
                var l = ny - 1;
                ctx.fillStyle = colorScale(mat[x][0]);
                ctx.fillRect(xoffset + x * cellSize + x0, yoffset, cellSize, h0);
                ctx.fillStyle = colorScale(mat[x][l]);
                ctx.fillRect(xoffset + x * cellSize + x0, yoffset + l * cellSize + y0, cellSize, h1);
            }
            for (var x = 1; x < mat.length - 1; x++) {
                for (var y = 1; y < mat[0].length - 1; y++) {
                    ctx.fillStyle = colorScale(mat[x][y]);
                    ctx.fillRect(xoffset + x * cellSize + x0, yoffset + y * cellSize + y0, cellSize, cellSize);
                }
            }
        };
        var color1;
        var color2;
        var color3; //for inter chromosome
        var color4; //for inter chromosome
        var background = "#FFF";
        var lineColor = "#000";
        var render = function () {
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = background;
            ctx.fillRect(xoffset, yoffset, width, height);
            var color = d3.scaleLog().domain([min + 1.0, max + 1.0]).range([color1, color2]); //TODO not log scale
            var colorScale = function (d) {
                if (isNaN(d)) {
                    return "#FFF" //color(0)
                } else {
                    return color(d + 1.0)
                }
            };

            var l = regions.length;

            var k = 0;
            renderAxis(ctx);

            var se = [];
            regions.forEach(function (d, i) {
                se.push(correctedPosition(d.start, d.end, resIdx));
            });
            for (var i = 1; i < l; i++) {
                renderLine(ctx, offsets[i]);
            }
            for (var i = 0; i < l; i++) {
                for (var j = i; j < l; j++) {
                    var x = offsets[i];
                    var y = offsets[j];
                    renderMatrix(ctx, xoffset + x, yoffset + y, mats[k], cellSize, colorScale, regions[i], se[i], regions[j], se[j]);
                    k += 1;
                }
            }
            renderResp();
            renderBrush();
            callback({
                "resolution": bpres[resIdx],
                "max": max,
                "min": min
            }); //callback to send parameters
        };
        var renderAxis = function (ctx) {
            ctx.save();
            ctx.translate(width + xoffset, yoffset);
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, 200, height);
            ctx.restore();
            regions.forEach(function (d, i) {
                var h = (offsets[i + 1] || height) - offsets[i];
                var y = d3.scaleLinear().domain([d.start, d.end]).range([0, h]);
                yaxis(ctx, y, xoffset + width + 30, yoffset + offsets[i], h, d.chr);

            });

        };
        /** TODO THIS **/
        var cleanBrush = function () {
            //TODO svg.selectAll("svg").selectAll(".brush").remove();
        };
        var res = function (selection) {
            selection.each(function (d, i) {
                console.log(d, i);
                var x = scales[i](d.start);
                var l = scales[i](d.end) - x;
                var rect = d3.select(this).selectAll("rect")
                    .data([{
                        "x": x,
                        "l": l
                    }]);
                rect
                    .enter()
                    .append("rect")
                    .merge(rect)
                    .attr("x", function (d) {
                        return d.x
                    })
                    .attr("y", function (d) {
                        return d.x
                    })
                    .attr("height", function (d) {
                        return d.l
                    })
                    .attr("width", function (d) {
                        return d.l
                    })
                    .attr("fill", function (d) {
                        return "#777"
                    })
                    .attr("opacity", 0.2);
            });
        };
        var response = function (e) {
            console.log(e);
            panel.selectAll(".hicResp")
                .data(e)
                .call(res);

        };
        var renderResp = function () {
            //var w = offsets[1]
            //var h = height - offsets[1]
            panel.selectAll(".hicResp").remove(); //TODO
            var svg = panel.selectAll(".hicResp").data(offsets)
                .enter()
                .append("svg")
                .attr("class", "hicResp");
            svg.style("position", "absolute")
                .style("top", function (d) {
                    return d + yoffset
                })
                .style("left", function (d) {
                    return d + xoffset
                })
                .attr("width", function (d, i) {
                    return offsets[i + 1] - offsets[i] || height - offsets[i]
                })
                .attr("height", function (d, i) {
                    return offsets[i + 1] - offsets[i] || height - offsets[i]
                });
        };
        var renderBrush = function () {
            var y = offsets[1];
            var w = offsets[1];
            var h = height - offsets[1];
            var xScale = d3.scaleLinear().domain([regions[0].start, regions[0].end]).range([0, w]);
            var yScale = d3.scaleLinear().domain([regions[1].start, regions[1].end]).range([0, h]);
            scales[0] = xScale;
            scales[1] = yScale;
            //console.log(xScale)
            var brushCb = function () {
                var e = d3.event.selection;
                console.log(e);
                var extent = [{
                    "chr": regions[0].chr,
                    "start": Math.round(xScale.invert(e[0][0])),
                    "end": Math.round(xScale.invert(e[1][0]))
                }, {
                    "chr": regions[1].chr,
                    "start": Math.round(yScale.invert(e[0][1])),
                    "end": Math.round(yScale.invert(e[1][1]))
                }];
                emit(extent);
                response(extent);

            };
            var brushEnd = function () {

            };
            //TODO RELATIVE POSITION 200 + 10 padding + 10 pading
            panel.selectAll(".hicBrush").remove(); //TODO
            var svg = panel.selectAll(".hicBrush").data(["0"]).enter().append("svg").attr("class", "hicBrush");
            svg.style("position", "absolute").style("left", xoffset)
                .style("top", yoffset + y)
                .attr("width", w)
                .attr("height", h);
            console.log("svg", svg);
            console.log("panel", panel);
            var brush = d3.brush().on("brush", brushCb).on("end", brushEnd);
            var b = svg.selectAll(".brush")
                .data([0]);
            b.enter()
                .append("g")
                .attr("class", "brush")
                //.merge(b)
                .call(brush);
        };
        var yaxis = canvasToolYAxis;
        var renderLine = function (ctx, offset) {
            ctx.fillStyle = lineColor;
            ctx.fillRect(offset + xoffset, yoffset, 1, height);
            ctx.fillRect(xoffset, yoffset + offset, width, 1);
        };

        var callback = function (d) {
            console.log(d);
        };
        var dataReady = function (errors, results) {
            //console.log(results)
            callback(results);
            min = Infinity;
            max = -Infinity;
            mats = [];
            results.forEach(function (text, i) {
                var data = d3.tsvParseRows(text).map(function (row) {
                    return row.map(function (value) {
                        var v = +value;
                        if (min > v) {
                            min = v;
                        }
                        if (max < v) {
                            max = v;
                        }
                        return v;
                    });
                });
                //console.log(data);
                mats.push(data);

            });
            console.log("min,max", min, max);
            //TODO Call Render Function;
            render();
        };
        var regionsToResIdx = function () {
            var w = Math.min(width, height);
            var l = totalLength(regions);
            var pixel = l / w;
            var resIdx = bpres.length - 1;
            for (var i = 0; i < bpres.length; i++) {
                if (bpres[i] < pixel) {
                    resIdx = i - 1;
                    break;
                }
            }
            cellSize = w / (l / bpres[resIdx]);
            //  console.log(w, l, bpres[resIdx], cellSize)
            offsets = [];
            var offset = 0.0;
            regions.forEach(function (d, i) {
                offsets.push(offset);
                offset += cellSize * ((+d.end - d.start) / bpres[resIdx]);
            });
            return resIdx
        };
        var correctedPosition = function (start, end, resIdx) {
            var binsize = bpres[resIdx];
            return [Math.floor(start / binsize) * binsize, (Math.floor((end - 1) / binsize) + 1) * binsize]
        };
        var loadData = function () {
            var l = regions.length;
            var pairs = [];
            for (var i = 0; i < l; i++) {
                for (var j = i; j < l; j++) {
                    pairs.push([i, j]);
                }
            }
            resIdx = regionsToResIdx(regions, width, height); // TODO with width and length parameters
            //console.log("smart resIdx", resIdx)
            //d3.select("#bpRes").text(bpres[resIdx]) //TODO
            var q = d3_queue.queue(2);
            // /get2dnorm/{chr}:{start}-{end}/{chr2}:{start2}-{end2}/{resIdx}/{norm}/{unit}/{format}
            pairs.forEach(function (d, i) {
                var url = generateQueryUrl(d);
                q.defer(d3.text, URI + url);
            });
            q.awaitAll(dataReady);
        };
        var chart = function (selection) { //selection is canvas itself;
            canvas = selection;
            //panel = d3.select("#main") //TODO
            cleanBrush();
            //add loading... here
            //render done.
            loadData();
        };
        /*
        chart.loadData = function(callback) {
          loadData()
          return chart;
        }
        */
        chart.panel = function (_) {
            return arguments.length ? (panel = _, chart) : panel;
        };
        chart.svg = function (_) {
            return arguments.length ? (svg = _, chart) : svg;
        };
        chart.height = function (_) {
            return arguments.length ? (height = _, chart) : height;
        };
        chart.width = function (_) {
            return arguments.length ? (width = _, chart) : width;
        };
        chart.xoffset = function (_) {
            return arguments.length ? (xoffset = _, chart) : xoffset;
        };
        chart.yoffset = function (_) {
            return arguments.length ? (yoffset = _, chart) : yoffset;
        };
        chart.regions = function (_) {
            return arguments.length ? (regions = _, chart) : regions;
        };
        chart.norm = function (_) {
            return arguments.length ? (norm = _, chart) : norm;
        };
        chart.unit = function (_) {
            return arguments.length ? (unit = _, chart) : unit;
        };
        chart.bpres = function (_) {
            return arguments.length ? (bpres = _, chart) : bpres;
        };
        chart.URI = function (_) {
            return arguments.length ? (URI = _, chart) : URI;
        };
        chart.color1 = function (_) {
            return arguments.length ? (color1 = _, chart) : color1;
        };
        chart.color2 = function (_) {
            return arguments.length ? (color2 = _, chart) : color2;
        };
        chart.background = function (_) {
            return arguments.length ? (background = _, chart) : background;
        };
        chart.domain = function(_) { return arguments.length ? (colorScale.domain(_), chart) : colorScale.domain(); };
        chart.emit = function (_) {
            return arguments.length ? (emit = _, chart) : emit;
        };
        chart.callback = function (_) {
            return arguments.length ? (callback = _, chart) : callback;
        };
        return chart;
    }

};

var getUrlParam = function (name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
};

var randomString = function (length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (!length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
};

function parseRegion(s){
  var a = s.split(":");
  if (a.length==1) {
    return {
      "chr": a[0],
      "start": 0,
      "end" : undefined
    }

  }
  var x = a[1].split("-");
  return {
      "chr": a[0],
      "start": +x[0],
      "end": +x[1]
  }
}
var parseRegions = function(s) {
  var a = s.split(",");
  var r =[];
  a.forEach(function(d){
    r.push(parseRegion(d));
  });
  return r
};

function nearby$1(a,b) {
    if (a.chr!=b.chr) {return false}
    var l = Math.max(a.end,b.end) - Math.min(a.start,b.start);
    if (((a.end-a.start)+(b.end-b.start))/ l > 0.95) {
      return true
    }
    return false
}
function merge$1(a,b) {
    return {"chr":a.chr,"start":Math.min(a.start,b.start),"end":Math.max(a.end,b.end)}
}
/* input :regions
 * output : merged regions */
function fixed(regions) {
  if (regions.length==1) {
    return regions;
  } //for now it use two only.//TODO multi regions.
  if (nearby$1(regions[0],regions[1])) {
    return [merge$1(regions[0],regions[1])]
  } else {
    return regions
  }
}
var toolsFixRegions = function(regions) {
  return fixed(regions)
};

var addPanelTo = function (el) {
    var panel = el.append("div").classed("panel", true);
    var head = panel.append("div").classed("panel-heading", true);
    var body = panel.append("div").classed("panel-body", true);
    return {
        "panel": panel,
        "head": head,
        "body": body
    }
};

var regionText = function(d) {
    return d.chr + ":" + d.start + "-" + d.end
};

var regionsText = function(regions) {
    var r = [];
    regions.forEach(function(d) {
        r.push(regionText(d));
    });
    return r.join(",")
};

var toolsTrimChrPrefix = function(r) {
    var a = [];
    r.forEach(function(d) {
        a.push({
            "chr": d.chr.replace("chr", "").replace("Chr",""),
            "start": d.start,
            "end": d.end
        });
    });
    return a
};

var toolsAddChrPrefix = function(r) { 
    var s = [];
    r.forEach(function(d) {
        s.push({
            "start": d.start,
            "end": d.end,
            "chr": "chr" + d.chr.replace("chr", "").replace("Chr","")
        });
    });
    return s
};

/*
 * region , brush ,update monitor
 *
 */
var simpleMonitor = function() {
  var regions;
  var brushs; // local use?
  var listeners = d3.dispatch("brush","update"); //sent message out, not use in this demo now.
  var dispatch = d3.dispatch("brush","update"); //communicate in chart
  var chart = function(selection) {
      var p = addPanelTo(selection);
      p.head.html("demo brush regions");
      p.body.append("label").text("brush");
      var b = p.body.append("textArea");
      p.body.append("label").text("update");
      var r = p.body.append("textArea");
      dispatch.on("brush.chart",function(d){
        b.html(JSON.stringify(d));
      });
      dispatch.on("update.chart",function(d){
        r.html(JSON.stringify(d));
      });
  };
  dispatch.on("brush.main",function(d){
    brushs = d;
  });
  dispatch.on("update.main",function(d){
    regions = d;
  });
  chart.brush = function(_){        //receive brush message
    dispatch.call("brush", this, _);
  };
  chart.update = function(_) {      //receive update message
    dispatch.call("update", this , _);
  };
  chart.on = function () {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? chart : value;
  };
  chart.regions = function(_) { return arguments.length ? (regions= _, chart) : regions; };
  return chart
};

var panel = function () {
    var width;
    var height;
    var panel, svg, canvas;
    var listeners = d3.dispatch();
    var dispatch = d3.dispatch("update", "brush", "resize");
    var chart = function (main) {
        panel = main.append("div")
            .style("position", "relative")
            .style("width", width + "px")
            .style("height", height + "px");
        canvas = panel.append("canvas")
            .style("postion", "absolute")
            .attr("height", height)
            .attr("width", width);
        svg = panel.append("svg")
            .style("position", "absolute")
            .attr("height", height)
            .attr("width", width);
    };
    chare.resize = function (d) {
        panel.style("width", d.width + "px")
            .style("height", d.height + "px");
        canvas.attr("height", d.height)
            .attr("width", d.width);
        svg.attr("height", d.height)
            .attr("width", d.width);
        dispatch.call("resize", this, d);
    };
    chart.on = function () {
        var value = listeners.on.apply(listeners, arguments);
        return value === listeners ? chart : value;
    };
    chart.panel = function (_) {
        return arguments.length ? (panel = _, chart) : panel;
    };
    chart.svg = function (_) {
        return arguments.length ? (svg = _, chart) : svg;
    };
    chart.canvas = function (_) {
        return arguments.length ? (canvas = _, chart) : canvas;
    };
    chart.width = function (_) {
        return arguments.length ? (width = _, chart) : width;
    };
    chart.height = function (_) {
        return arguments.length ? (height = _, chart) : height;
    };
    return chart
};

var defaultConfig = {
  "color" : "#111"
};
var simple = function(layout, container, state, app) {
    //local event driven . cfg, content ...
    // not d3.call but registerComponent render.
    // similar with d3.call.
    // layout is the interface
    // container is the element.
    //var dispatch = d3.dispatch("local")
    var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg",true);
    var content = d3.select(container.getElement()[0]).append("div").classed("content",true);
    var div1 = content.append("div");
    var div2 = content.append("div");
    //state.config parameters.
    /* render config panel and configs */

    var config = state.config || defaultConfig;
    //TODO FORM state();
    //change title form;
    var c = cfg.append("input")
      .attr("type","color")
      .attr("value",config.color);
    cfg.append("input")
       .attr("type","button")
       .attr("value","submit")
       .on("click",function(){
         cfg.style("display","none"); //jQuery .hide()
         content.style("display","block"); //jQuery .show()
         console.log(c);
         container.extendState({
           "configView":false,
           "config":{"color":c.node().value}
         });
         config.color = c.node().value;
         div1.style("color",config.color); //TODO dispatch mode.
       });

    //container.extendState({"config":config})

    /* render content */
    var brush = []; // instant states not store in container
    var update = state.regions || [];
    div1.style("color",config.color);
    layout.eventHub.on("brush", function(d) {
        brush = d;
        if(!container.isHidden){
          div2.html("BRUSHING   " + regionsText(d));
        }

    });
    layout.eventHub.on("update", function(d) {
       update = d;
       container.extendState({"regions":update});
       if(!container.isHidden){
         div1.html("CURRENT   " + regionsText(d));
         div2.html("");
       }
    });
    container.on("show",function(d) {
      div1.html("WAKEUP "+ regionsText(update));
      div2.html("WAKEUP BRUSHING "+ regionsText(brush));
    });
};

var hic = function (layout, container, state, app) {
    //TODO RM Global Variables, make it as a renderer in Snow;
    var scope = {
        "background": "#BBB"
    };
    var init = {
        "bigwig": false,
        "hic": false
    };
    var server = app["server"] || "";
    var hic = {};
    var dispatch = d3.dispatch("update", "brush", "cfg", "replot", "domain", "monitor");
    var main = d3.select(container.getElement()[0])
        .append("div")
        .attr("class", "content")
        .style("position", "relative");
    var cfg = d3.select(container.getElement()[0])
        .append("div")
        .attr("class", "cfg");
    var sign = false;
    dispatch.on("cfg", function (data) {
        hic.ctrl = H.chart().data(data);
        //console.log("hic state", container.getState().state)
        //TODO add hics options.
        cfg.call(hic.ctrl); //TODO add more config here
        if (container.getState().state && sign == false) {
            hic.ctrl.state(container.getState().state);
            sign = true; //load once.
        } else {
            container.extendState({
                "state": hic.ctrl.state()
            });
        }
        cfg.append("input")
            .attr("type", "button")
            .attr("value", "submit")
            .on("click", function (d) {
                container.extendState({
                    "state": hic.ctrl.state()
                });
                container.extendState({
                    "configView": false
                });
                cfg.style("display", "none");
                main.style("display", "block");
                dispatch.call("replot", this, {});
            });
    });
    //console.log("container",container)
    var canvas = main.append("canvas").style("position", "absolute");
    var svg = main.append("svg").style("position", "absolute");
    var div = main.append("div").style("position", "absolute")
        .style("top", 10).style("left", 10).style("width", 50).style("height", 100);
    var div1 = main.append("div").style("position", "absolute");
    //.style("background-color","#FEF")
    //console.log("container", container)
    //console.log("title", container.title)
    //console.log("width",container.width)
    //console.log("state", state)
    /*
        var div2 =  main.append("div").style("position", "absolute")
            .style("top", 10).style("left", 3*container.width/4).style("width", container.width / 4).style("height", container.width/4)
            .style("background-color","#DFD")

        /* CTRL Inside */
    var btnPrint = div.append("button")
    .classed("btn", true)
    .html('<small><span class="glyphicon glyphicon-print"></span></small>')
    .on('click',function(){
        div.selectAll("a").remove();
      var a = div.append("a")
      .attr("href",canvas.node().toDataURL())
      .attr("download","scope.png")
      .text("");
      a.node().click();
      a.remove();

    });



    var btnPlay = div.append("button")
        .classed("btn", true)
        .html('<small><span class="glyphicon glyphicon-play"></span></small>')
        .on("click", function () {
            dispatch.call("replot", this, {});
        });

    var btnZoomOut = div.append("button")
        .classed("btn", true)
        .html('<small><span class="glyphicon glyphicon-zoom-out"></span></small>')
        .on("click", function () {
            //var regions = region.ctrl.regions(); //or states?
            var regions = state.regions;
            regions.forEach(function (d, i) {
                d.length = getChrLength(d.chr); //TODO fix map for chromosome length;
                var l = d.end - d.start;
                regions[i].start = d.start - l < 0 ? 0 : d.start - l;
                regions[i].end = d.end + l > d.length ? d.length : d.end + l;
            });
            regions = toolsFixRegions(regions);
            dispatch.call("update", this, regions);
            //layout.eventHub.emit("input", regions)
        });

    var btnZoomIn = div.append("button")
        .classed("btn", true)
        .html('<small><span class="glyphicon glyphicon-zoom-in"></span></small>')
        .on("click", function () {
            var regions = state.regions;
            regions.forEach(function (d, i) {
                var l = Math.round((d.end - d.start) / 3);
                regions[i].start = d.start + l;
                regions[i].end = d.end - l;
            });
            regions = toolsFixRegions(regions);
            dispatch.call("update", this, regions);
            //layout.eventHub.emit("input", regions) //TODO

        });
    var axesG = svg.append("g").attr("transform", "translate(10,0)");

    var TO = false; //resize delay
    var resizePanel = function() {
      dispatch.call("replot", this, {});
    };
    container.on("resize", function (e) {
        if(TO!==false) clearTimeout(TO);
        canvas.attr("height", container.height)
            .attr("width", container.width);
        svg.attr("height", container.height)
            .attr("width", container.width);
        //TODO get a better size
        div1.style("top", 10)
            .style("left", 3 * container.width / 4)
            .style("width", container.width / 4)
            .style("height", container.width / 4);
        scope.edge = container.width - 40;
        scope.width = container.width;
        scope.height = container.height;
        TO = setTimeout(resizePanel,200);
    });

    var URI = server + "/hic/default"; //TODO This For All HiC selection.
    var hicId = localStorage.getItem("hicId"); //TODO Fix this
    if (hicId) {
        URI = server + "/hic/" + hicId;
        container.setTitle(hicId);
    } else {
        hicId = "";
    }


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
    ];
    var initHic = function (data) {
        hic.opts = data; //hic.opts.chrs
        dispatch.call("cfg", this, data);
        init.hic = true;
        var r = state.regions || testBeds;
        render(r); //TODO d3 queue ?
    };
    var getChrLength = function (chr) {
        console.log(hic.opts.chrs, hic.opts.chr2idx);
        var i;
        if (hic.opts.chr2idx[chr] !== undefined) {
          i = hic.opts.chr2idx[chr];
        } else if (hic.opts.chr2idx[chr.replace("chr", "").replace("Chr", "")] !== undefined) {
          i = hic.opts.chr2idx[chr.replace("chr", "").replace("Chr", "")];
        } else {
          return 0; //unknown chromosome.
        }
        return hic.opts.chrs[i].Length
    };

    var bigwig;
    var initBw = function (data) {
        console.log("bigwig", data);
        bigwig = data;
        init.bigwig = true;
    };
    var bwconfig = localStorage.getItem("bwconfig"); //TODO IMPROVE
    if (bwconfig) {
        bwconfig = JSON.parse(bwconfig);
    }
    B.Get(server + "/bw", initBw);
    H.Get(URI, initHic); //TODO get localStorage hic id

    var renderBigwig = function (regions) {
        var bw = [];
        var tracks = [];
        //TODO : load localStorage configure?
        if (!bwconfig) {
            bigwig.trackIds.forEach(function (b, i) {
                tracks.push(b);

            });
        } else {

            bwconfig.data.forEach(function (d) {
                if (d.values[1] == "show") {
                    tracks.push(d.values[0]);
                }
            });
        }
        tracks.forEach(function (b, i) {
            bw.push(
                B.canvas()
                .URI(server + "/bw") //set this?
                .id(b)
                .x(10)
                .y(scope.edge / 2 + 40 + i * 80)
                .width(scope.edge)
                .gap(20) //TODO REMV
                .regions(toolsAddChrPrefix(regions))
                .panel(main)
                .mode(1)
                .pos(i)
            );
        });
        dispatch.on("brush.local", function (e) {
            bw.forEach(function (b, i) {
                b.response(e);
            });
        });
        bw.forEach(function (b) {
            canvas.call(b);
        });
    };
    var renderHic = function (r) {
      var regions;
      var pre = new RegExp("^chr*");
      var Pre = new RegExp("^Chr*");
      console.log(hic.opts.chrs[0].Name);
      if ( pre.test(hic.opts.chrs[1].Name) || Pre.test(hic.opts.chrs[1].Name)) {
        regions = r;
        console.log("pre",hic.opts.chrs[0]);
      } else {
        regions = toolsTrimChrPrefix(r);
        console.log("not pre",hic.opts.chrs[1]);
        //prefixed = false;
      }
        var scopebrush = brush$1().width(scope.edge).on("brush", function (d) {
            dispatch.call("brush", this, toolsAddChrPrefix(d));
            layout.eventHub.emit("brush", toolsAddChrPrefix(d));
        }).on("click", function (d) {
            dispatch.call("update", this, toolsAddChrPrefix(d));
        }).regions(regions);
        axesG.selectAll("*").remove();
        axesG.call(scopebrush);

        var hicCb = function (d) {
            dispatch.call("monitor", this, d);
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = scope.background;
            ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40);
        };
        hic.state = hic.ctrl.state();
        hic.chart = H.canvas()
            .URI(URI)
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
                dispatch.call("brush", this, d);
            })
            .callback(hicCb);
        canvas.call(hic.chart);
        //TODO Fix OverFlow.
        dispatch.on("domain", function (d) {
            hic.chart.domain(d); //local render.
            hic.chart.render(function () {
                var ctx = canvas.node().getContext("2d");
                ctx.fillStyle = scope.background;
                ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40);
            });

        });
    };
    var render = function (d) {
        var ctx = canvas.node().getContext("2d");
        ctx.fillStyle = scope.background;
        ctx.fillRect(0, 0, scope.width, scope.height);
        var regions = d;
        regions = toolsFixRegions(regions);
        container.extendState({
            "regions": d
        });
        state.regions = regions; //TODO FIXed
        layout.eventHub.emit("update", d);
        if (init.bigwig) {
            renderBigwig(regions);
        }
        if (init.hic) {
            renderHic(regions);
        }
    };
    layout.eventHub.on("update",function(d){
      console.log("update eventHub",d);
    });
    dispatch.on("monitor", function (d) {
        //div1.html(JSON.stringify(d, 2, 2)) //TODO renders.
        div1.html("");
        //var paratable = paraTable().data(d)
        //div1.call(paratable)
        var table = div1.append("table").classed("table",true)
        .classed("table-condensed",true)
        .classed("table-bordered",true);
        var keys = Object.keys(d);
        var tr = table.selectAll("tr").data(keys)
        .enter().append("tr");
        tr.append("td").text(function(d0){return d0});
        tr.append("td").text(function(d0){return d[d0]});
        var k0 = div1.append("div").style("padding-right", "20px");
        var k1 = k0.append("div"); //.attr("id","slider101")
        var k2 = k0.append("div");
        var max = d.max > 30000 ? 30000 : d.max;
        k2.html("0-"+max);
        $(k1.node()).slider({
            range: true,
            min: 0,
            max: max,
            values: [0, max],
            slide: function (event, ui) {
                //console.log(ui.values[0],ui.values[1])
                k2.html(ui.values[0] + "-" + ui.values[1]);
                dispatch.call("domain", this, [ui.values[0], ui.values[1]]);
            }
        });
    });

    dispatch.on("update.local", function (d) {
        console.log("update.local",d);
        render(toolsAddChrPrefix(d));
    });
    var fixRegions = function (d) {
        d.forEach(function (c, i) {
            if (c.start === undefined || c.start < 0) {
                c.start = 0;
            }
            var l = getChrLength(c.chr);
            if (c.end === undefined || c.start > l) {
                c.end = l;
            }
        });
        return d
    };
    layout.eventHub.on("input", function (d) {
        d = fixRegions(toolsAddChrPrefix(d));
        render(d);
    });
    dispatch.on("replot", function (d) {
        //layout.eventHub.emit("update", state.reigions || testBeds)
        render(state.regions || testBeds);
    });
};

function overlap$1(a,b){
  if (a.chr!=b.chr) {
    return false
  }
  if (a.start > b.end || b.start > a.end) {
    return false
  }
  return true
}
function _intersect(a,b) {
  return {
    "chr":a.chr,
    "start":Math.max(a.start,b.start),
    "end":Math.min(a.end,b.end)
  }
}
var scaleScope = function() {
  var domain; // regions {"chr":name,"start":x,"end":y}
  var gap = 10; //TODO.
  var range;　//[0,width] or any scale.

  /*
   * return [[start,end],[start,end] ...]
   */
  var scales = [];
  var scale2d = [];
  var init = false;
  var initialize = function() {
    scales = [];

    init = true;
    var l = 0;
    console.log("inner domain",domain);
    domain.forEach(function(d){
      l += d.end-d.start;
    });
    var eW = range[1]-range[0] - gap * (domain.length-1);
    var offset = range[0];
    domain.forEach(function(d){
      var w = eW * (+d.end-d.start) / l;
      scales.push(d3.scaleLinear().domain([+d.start,+d.end]).range([offset,offset+w]));
      console.log("init scales",scales);
      offset += w+gap;

    });


  };
  var chart = function(r) { //d = {"chr":name,"start":x,"end":y}
      if (init==false) {
        initialize();
      }
      var overlaps =[];
      domain.forEach(function(d,i){
          if (overlap$1(d,r)) {
            var v = _intersect(d,r);
            overlaps.push([scales[i](v.start),scales[i](v.end)]);
          }
      });
      return overlaps;
  };

  chart.invert = function(value) { //TODO.

  };
  
  chart.scales = function(_) { return arguments.length ? (scales= _, chart) : scales; };
  chart.gap = function(_) { return arguments.length ? (gap= _, init=false, chart) : gap; };
  chart.domain = function(_) { return arguments.length ? (domain= _,init=false, chart) : domain; };
  chart.range = function(_) { return arguments.length ? (range= _,init=false, chart) : range; };
  return chart
};

var factory = function (data, config) {
  var c = config;
  for (var k in data) {
    if (!c[k]) {
      if (Object.prototype.toString.call(data[k]) === '[object Array]') {
        c[k] = data[k][0];
      } else if (typeof data[k] === 'string') {
        c[k] = data[k];
      } else if (typeof data[k] === 　"boolean") {
        c[k] = data[k];
      } else {
        c[k] = 0; //TODO
      }
    }
  }
};

var datgui = function() {
  var callback;
  var closable = true;
  var chart = function(selection) {
    selection.each(function(d){
      var el = d3.select(this);
      el.selectAll(".guidiv").remove();
      var gui = new dat.GUI({
        autoPlace: false
      });
      if (!closable) {
        gui.__closeButton.style.display = "none";
      }
      factory(d.options,d.config);
      var inputs = {};
      for (var k in d.options) {
        if (Object.prototype.toString.call(d.options[k]) === '[object Array]') {
          inputs[k] = gui.add(d.config, k, d.options[k]).listen();
        } else if (typeof d.options[k] === 'string' && d.options[k].match(/^#\S\S\S\S\S\S$/)) {
          inputs[k] = gui.addColor(d.config, k).listen();
        } else if (typeof d.options[k] === 'boolean') {
          inputs[k] = gui.add(d.config, k).listen();
        } else {
          inputs[k] = gui.add(d.config, k, d.options[k]).listen();
        }
      }
      if (callback) {
        for (var k in inputs) {
          inputs[k].onFinishChange(function (value) {
            callback(k, value); //callback key and value
          });
        }
      }
      var el0 = el.append("div").classed("guidiv",true).node();
      el0.appendChild(gui.domElement);
    });
  };
  chart.callback = function(_) { return arguments.length ? (callback= _, chart) : callback; };
  chart.closable = function(_) { return arguments.length ? (closable= _, chart) : closable; };
  return chart
};

//import toolsAddChrPrefix from "../tools/addChrPrefix"
//import brush from "../scopebrush" //TODO
const norms$2 = constant().norms;
const units$2 = constant().units;
var hicMonitor = function (layout, container, state, app) {
    //TODO RM Global Variables, make it as a renderer in Snow;
    var scope = {
        "background": "#BBB"
    };
    var init = {
        "hic": false
    };
    var hic = {};
    var server = app["server"] || "";
    var dispatch = d3.dispatch("update", "brush", "cfg", "replot", "domain", "monitor");
    var main = d3.select(container.getElement()[0])
        .append("div")
        .attr("class", "content")
        .style("position", "relative");
    var cfg = d3.select(container.getElement()[0])
        .append("div")
        .attr("class", "cfg");
    var sign = false;
    //var hicCfgDiv
    var datIO = datgui().closable(false);
    dispatch.on("cfg", function (data) {
        //console.log("hic", hic)
        var opts = {
          "color2": "#ff0000",
          "color1": "#ffffff"
        };
        opts["unit"] = {};
        data.units.forEach(function (d) {
          var k = units$2[d];
          opts["unit"][k] = d;
        });
        opts["norm"] = {};
        data.norms.forEach(function (d) {
          //opts.norms.push({norms[d]:d})
          var k = norms$2[d];
          opts["norm"][k] = d;
        });
        hic.state = {};
        if (container.getState().hicState && sign == false) {
          hic.state = container.getState().hicState;
          opts["color1"] = hic.state.color1;
          opts["color2"] = hic.state.color2;
          sign = true;
        } else {

          sign = true;
        }

        //hicCfgDiv = renderCfg(opts, hic.state, undefined)
        cfg.selectAll(".datgui").remove();
        cfg.selectAll(".datgui")
        .data([
          {"options":opts,"config":hic.state}
        ])
        .enter()
        .append("div")
        .classed("datgui",true)
        .call(datIO);

        container.extendState({
          "hicState": hic.state
        });
        cfg.selectAll(".submit").remove();
        cfg.append("input")
            .attr("type", "button")
            .classed("submit",true)
            .attr("value", "submit")
            .on("click", function (d) {
                container.extendState({
                    "hicState": hic.state
                });
                container.extendState({
                    "configView": false
                });
                //container.extendState({"URI":uri.node().value}
                cfg.style("display", "none");
                main.style("display", "block");
                dispatch.call("replot", this, {});
            });
        
    });

    var canvas = main.append("canvas").style("position", "absolute");
    var svg = main.append("svg").style("position", "absolute");
    var div = main.append("div").style("position", "absolute")
        .style("top", 10).style("left", 10).style("width", 50).style("height", 100);
    var div1 = main.append("div").style("position", "absolute");
    //.style("background-color","#FEF")

    var div2 = main.append("div").style("position", "absolute")
        .style("top", 10).style("left", 3 * container.width / 4).style("width", container.width / 4).style("height", container.width / 4)
        .style("background-color", "#DFD");


    var axesG = svg.append("g").attr("transform", "translate(10,0)");
    var scale = scaleScope();
    var TO = false; //resize delay
    var resizePanel = function () {
        dispatch.call("replot", this, {});
    };
    container.on("resize", function (e) {
        if (TO !== false) clearTimeout(TO);
        canvas.attr("height", container.height)
            .attr("width", container.width);
        svg.attr("height", container.height)
            .attr("width", container.width);
        //TODO get a better size
        div1.style("top", 10)
            .style("left", 3 * container.width / 4)
            .style("width", container.width / 4)
            .style("height", container.width / 4);
        scope.edge = container.width - 40;
        scope.width = container.width;
        scope.height = container.height;
        scale.range([0, scope.edge]);
        TO = setTimeout(resizePanel, 200);
    });

    var URI = state.URI || server+"/hic/default"; //need to set it if could.
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
    ];

    var initHic = function (data) {
        hic.opts = data;
        dispatch.call("cfg", this, data);
        init.hic = true;
        var r = state.regions || testBeds;
        render(r); //TODO d3 queue ?
    };



    var hics = {
      "options":{},
      "config":{}
    };
    var resetHics = function (k, v) {
      container.extendState({
        "hicsState": hics.config
      });
      URI = server + "/hic/" + v;
      H.Get(URI, initHic);
    };
    var hicIO = datgui().callback(resetHics).closable(false);
    var initHics = function(){
      d3.json(server + "/hic/list", function (d) {
        hic.hics = d;
        hics.options = {
          "hic": d
        };
        if (container.getState().hicsState) {
          hics.config = container.getState().hicsState;
        } else {
          hics.config = {
            "hic": d[0]
          };
        }

        cfg.selectAll(".hicsgui").remove();
        cfg.selectAll(".hicsgui")
        .data([
          hics
        ])
        .enter()
        .append("div")
        .classed("hicsgui",true)
        .call(hicIO);
        //renderCfg(hics.opts, hics.cfg, callback)
        URI = server + "/hic/" + hics.config.hic;
        H.Get(URI, initHic);
      });
    };


    //H.Get(URI, initHic)
    initHics();
    var prefixed = true;
    var renderHic = function (r) {
        var regions;
        var pre = new RegExp("^chr*");
        var Pre = new RegExp("^Chr*");
        if (pre.test(hic.opts.chrs[1].Name) || Pre.test(hic.opts.chrs[1].Name)) {
          regions = r;
        } else {
          regions = toolsTrimChrPrefix(r);
          prefixed = false;
        }
        var hicCb = function (d) {　
            dispatch.call("monitor", this, d);
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = scope.background;
            ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40);
        };
        //hic.state = hic.ctrl.state();
        hic.chart = H.canvas() //just for canvas view.
            .URI(URI)
            .norm(hic.state.norm)
            .unit(hic.state.unit)
            .bpres(hic.opts.bpres)
            .xoffset(10)
            .yoffset(scope.edge * 0.5)
            .width(scope.edge)
            .height(scope.edge)
            .regions(regions)
            .panel(main)
            .gap(10)
            .color1(hic.state.color1)
            .color2(hic.state.color2)
            .callback(hicCb);
        canvas.call(hic.chart);
        //TODO Fix OverFlow.
        dispatch.on("domain", function (d) {
            hic.chart.domain(d);
            hic.chart.render(function () {
                var ctx = canvas.node().getContext("2d");
                ctx.fillStyle = scope.background;
                ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40);
            });
        });
        dispatch.on("brush", function (d) {
            var data = [];
            var rectData = [];
            d.forEach(function (d) {
                data.push(scale(d));
            });
            //assume data is sorted.
            var r2 = svg.selectAll(".resp2")
                .data([0]);
            r2.enter()
                .append("g")
                .attr("class", "resp2")
                .attr("transform", function (d) {
                    return "translate(" + (scope.edge / 2 + 10) + ",0) rotate(45)"
                })
                .merge(r2);
            if (data.length > 1) {
                var rx = data[0][0][0] / Math.SQRT2;
                var rWidth = data[0][0][1] / Math.SQRT2 - rx;
                var ry = data[1][0][1] / Math.SQRT2;
                var rHeight = ry - data[1][0][0] / Math.SQRT2;
                ry = scope.edge / Math.SQRT2 - ry;
                var p2 = r2.selectAll("rect")
                    .data([0]);
                p2.enter()
                    .append("rect")
                    .merge(p2)
                    .attr("x", rx)
                    .attr("y", ry)
                    .attr("width", rWidth)
                    .attr("height", rHeight)
                    .attr("opacity", 0.2);
                p2.exit().remove();
            } else {
                r2.selectAll("rect").remove();
            }

            var r = svg.selectAll(".resp")
                .data(data);

            r.enter()
                .append("g")
                .merge(r)
                .attr("class", "resp")
                .attr("transform", function (d) {
                    return "translate(" + (d[0][0] + 10) + "," + scope.edge / 2 + ")"
                });
            var p = r.selectAll("path").data(function (d) {
                return [d[0]]
            });
            p.enter()
                .append("path")
                .merge(p)
                .attr("d",
                    d3.symbol().type(symbolTriangle).size(function (d) {
                        return d[1] - d[0]
                    })
                )
                .style("opacity", 0.2);
            r.exit().remove();
        });
    };
    init.panel = false;
    var render = function (d) {
        var ctx = canvas.node().getContext("2d");
        ctx.fillStyle = scope.background;
        ctx.fillRect(0, 0, scope.width, scope.height);
        svg.selectAll(".resp").remove();
        svg.selectAll(".resp2").remove();
        var regions = d;
        regions = toolsFixRegions(regions);
        container.extendState({
            "regions": d
        });
        state.regions = regions; //TODO FIXed
        scale.domain(regions);
        if (init.hic) {
            renderHic(regions);
        }
    };

    dispatch.on("monitor", function (d) {
        div1.html("");
        var table = div1.append("table").classed("table", true)
            .classed("table-condensed", true)
            .classed("table-bordered", true);
        var keys = Object.keys(d);
        var tr = table.selectAll("tr").data(keys)
            .enter().append("tr");
        tr.append("td").text(function (d0) {
            return d0
        });
        tr.append("td").text(function (d0) {
            return d[d0]
        });
        var k0 = div1.append("div").style("padding-right", "20px");
        var k1 = k0.append("div"); //.attr("id","slider101")
        var k2 = k0.append("div");
        var max = d.max > 30000 ? 30000 : d.max;
        k2.html("0-" + max);
        $(k1.node()).slider({
            range: true,
            min: 0,
            max: max,
            values: [0, max],
            slide: function (event, ui) {
                k2.html(ui.values[0] + "-" + ui.values[1]);
                dispatch.call("domain", this, [ui.values[0], ui.values[1]]);
            }
        });
    });

    layout.eventHub.on("update", function (d) {
        /*
        if (fixed){
          return
        }
        */
        if (!container.isHidden) {
            render(d);
        } else {
            state.regions = toolsFixRegions(d);
        }
    });
    layout.eventHub.on("brush", function (d) {
        if (!container.isHidden) {
            dispatch.call("brush", this, d);
        }
    });
    container.on("show", function (d) {
        if (state.regions) {
            render(state.regions);
        }
        console.log("d", d);
        //render(state.regions)
    });
    dispatch.on("replot", function (d) {
        //layout.eventHub.emit("update", state.reigions || testBeds)
        render(state.regions || testBeds);
    });
};

//import brush from "../scopebrush" //TODO

//TODO: sort the regions first for response ,
//TODO 2. don't refresh data if it is same

var hicIcon = function(layout, container, state, app) {
    //TODO RM Global Variables, make it as a renderer in Snow;
    var scope = {
      "background":"#BBB"
    };
    var init = {
      "bigwig":false,
      "hic":false
    };
    var hic = {
    };
    var dispatch = d3.dispatch("update","brush","cfg","replot","domain","monitor");
    var main = d3.select(container.getElement()[0])
          .append("div")
          .attr("class","content")
          .style("position", "relative");
    var cfg = d3.select(container.getElement()[0])
          .append("div")
          .attr("class","cfg");
    var sign = false;
    dispatch.on("cfg", function(data) {
              hic.ctrl = H.chart().data(data);
              console.log("hic state", state.state);
              cfg.call(hic.ctrl);

              if (state.state && sign == false) {
                  hic.ctrl.state(container.getState().state);
                  sign = true; //load once.
              } else {
                  container.extendState({"state":hic.ctrl.state()});
              }
              var uri = cfg.append("input")
                .attr("type","text")
                .attr("value",state.URI || "/hic");

              cfg.append("input")
                .attr("type","button")
                .attr("value","submit")
                .on("click", function(d){
                  container.extendState({"state":hic.ctrl.state()});
                  container.extendState({"configView":false});
                  container.extendState({"URI":uri.node().value});
                  if (uri.node().value != URI) {
                      URI=uri.node().value;
                      H.Get(URI,initHic);
                  }

                  cfg.style("display","none");
                  main.style("display","block");
                  dispatch.call("replot",this,{});
                });
          });

    var canvas = main.append("canvas").style("position","absolute");
    var svg = main.append("svg").style("position","absolute");
    var div = main.append("div").style("position", "absolute")
        .style("top", 10).style("left", 10).style("width", 50).style("height", 100);
    var div1 = main.append("div").style("position", "absolute")
        //.style("backgrounremoveyle("left", 3*container.width/4).style("width", container.width / 4).style("height", container.width/4)
        .style("background-color","#DFD");


    var axesG = svg.append("g").attr("transform", "translate(10,0)");
    var scale = scaleScope();

    container.on("resize", function(e) {
        canvas.attr("height", container.height)
            .attr("width", container.width);
        svg.attr("height", container.height)
            .attr("width", container.width);
        div1.style("top",10)
            .style("left",3*container.width/4)
            .style("width",container.width/4)
            .style("height",container.width/4);
        scope.edge = container.width - 40;
        scope.width = container.width;
        scope.height = container.height;

        scale.range([0,scope.edge]);

        dispatch.call("replot",this,{});
    });

    var URI = state.URI || "/hic/default"; //need to set it if could.
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
    ];
    var initHic = function(data) {
        hic.opts = data;
        dispatch.call("cfg", this , data);
        init.hic = true;
        var r = state.regions || testBeds;
        render(r); //TODO d3 queue ?
    };


    H.Get(URI, initHic);

    var renderHic = function(regions) {

        var hicCb = function(d) {　
            dispatch.call("monitor", this, d);
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = scope.background;
            ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40);
        };
        hic.state = hic.ctrl.state();
        hic.chart = H.canvas()  //just for canvas view.
            .URI(URI)
            .norm(hic.state.norm)
            .unit(hic.state.unit)
            .bpres(hic.opts.bpres)
            .xoffset(10)
            .yoffset(scope.edge * 0.5)
            .width(scope.edge)
            .height(scope.edge)
            .regions(regions)
            .panel(main)
            .gap(10)
            .color1(hic.state.color1)
            .color2(hic.state.color2)
            .callback(hicCb);
        canvas.call(hic.chart);
        //TODO Fix OverFlow.
        dispatch.on("domain",function(d){
          hic.chart.domain(d);
          hic.chart.render();
        });
        dispatch.on("brush",function(d){
          console.log("icon brush",d);
          var data =[];
          var rectData = [];
          d.forEach(function(d){
            data.push(scale(d));
          });
          //assume data is sorted.
          console.log("icon convert to data",data);
          var r2 = svg.selectAll(".resp2")
            .data([0]);
          r2.enter()
          .append("g")
          .attr("class","resp2")
          .attr("transform",function(d){
            return "translate(" + (scope.edge/2+10) +",0) rotate(45)"
          })
          .merge(r2);
          if (data.length > 1) {
            var rx = data[0][0][0]/Math.SQRT2;
            var rWidth = data[0][0][1]/Math.SQRT2 - rx;
            var ry = data[1][0][1]/Math.SQRT2;
            var rHeight = ry - data[1][0][0]/Math.SQRT2;
            ry = scope.edge/Math.SQRT2 - ry;
            var p2 = r2.selectAll("rect")
            .data([0]);
            console.log(rx,ry,rWidth,rHeight,"xywh");
            p2.enter()
              .append("rect")
              .merge(p2)
              .attr("x",rx )
              .attr("y",ry)
              .attr("width",rWidth)
              .attr("height",rHeight)
              .attr("opacity",0.2);
            p2.exit().remove();
          } else {
            r2.selectAll("rect").remove();
          }

          var r = svg.selectAll(".resp")
             .data(data);

            r.enter()
            .append("g")
            .merge(r)
            .attr("class","resp")
            .attr("transform",function(d){
              return "translate("+(d[0][0]+10)+","+scope.edge/2+")"
            });
            var p = r.selectAll("path").data(function(d){return [d[0]]});
            p.enter()
            .append("path")
            .merge(p)
            .attr("d",
              d3.symbol().type(symbolTriangle).size(function(d){
                console.log("d",d);
                return d[1]-d[0]
              })
            )
            .style("opacity", 0.5);
            r.exit().remove();
        });
    };
    var chromosome = function(d) {
      var r ={};
      d.forEach(function(d){
        if (!r[d.chr]) {
          r[d.chr]=1;
        }
      });
      var v=[];
      Object.keys(r).forEach(function(d){
        v.push({"chr":d,"start":1,"end":200000000});
      });
      return v;
    };
    var render = function(d) {
        var ctx = canvas.node().getContext("2d");
        ctx.fillStyle = scope.background;
        ctx.fillRect(0, 0, scope.width, scope.height);
        //svg.selectAll(".resp").remove()
        //svg.selectAll(".resp2").remove()
        var regions = toolsFixRegions(d);
        var chrs = chromosome(regions);
        container.extendState({
            "regions": chrs
        });
        state.regions = chrs; //TODO FIXed
        scale.domain(chrs);
        if (init.hic) {
            renderHic(chrs);
        }
       dispatch.call("brush",this,regions);
    };

    dispatch.on("monitor", function(d){
      div1.html(JSON.stringify(d,2,2));//TODO renders.
    });

    layout.eventHub.on("update", function(d) {
        render(d);
    });
    layout.eventHub.on("brush", function(d) {
    });
    dispatch.on("replot", function(d) {
        //layout.eventHub.emit("update", state.reigions || testBeds)
        render(state.regions || testBeds);
    });
};

//TODO replace daslink ucsclink and washulink. add customized templates.

function das(db,coords,type) {
  return "http://genome.ucsc.edu/cgi-bin/das/"+db+"/features?segment="+regionText(coords).replace("chr","").replace("-",",")+";type="+type
}
function ucsc(org,db,position,width) {
  return "http://genome.ucsc.edu/cgi-bin/hgTracks?org="+org+"&db="+db+"&position="+regionText(position)+"&pix="+width
}
function washu(db,position) {
  return "http://epigenomegateway.wustl.edu/browser/?genome="+db+"&coordinate="+regionText(position)
}
var defaultConfig$1 = {
  "color" : "#111",
  "server" : "ucsc"
};

var ml = ["ucsc","washu","das"];

var links = function(layout, container, state, app) {
    var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg",true);
    var content = d3.select(container.getElement()[0]).append("div").classed("content",true);
    var div1 = content.append("div");
    var div2 = content.append("div");
    //state.config parameters.
    /* render config panel and configs */
    var setdiv = function(div, title, d) {
      div.selectAll("*").remove();
      div.append("span").text(title);
      var ul = div.append("ul");
      var li = ul.selectAll("li").data(d);
      li.enter()
       .append("li")
       .merge(li)
       .append("a")
       .attr("href",function(d){
         var url="#";
         switch(config.server) {
           case "ucsc":
              url = ucsc( app.species || "human", app.genome || "hg19",d,800);
              break;
           case "das":
              url = das(app.genome || "hg19",d, app.dasType || "refGene");
              break;
           case "washu":
              url = washu( app.genome || "hg19",d);
              break;
           default:
              url = "#";
         }
        return url//TODO SET CONFIG STATE
       }) //TODO set other org
       .attr("target","_blank")
       .text(function(d,i){
         return "Region "+(i+1)
       });
    };
    var config = state.config || defaultConfig$1;
    /* render content */
    var brush = []; // instant states not store in container
    var update = state.regions || [];
    container.setTitle(config.server +" links"|| "links");
    var c = cfg.append("input")
      .attr("type","color")
      .attr("value",config.color);
    var s = cfg.append("select");
    s.selectAll("option").data(ml).enter()
    .append("option").attr("value",function(d){
      return d
    }).text(function(d){return d});
    cfg.append("input")
       .attr("type","button")
       .attr("value","submit")
       .on("click",function(){
         cfg.style("display","none"); //jQuery .hide()
         content.style("display","block"); //jQuery .show()
         container.extendState({
           "configView":false,
           "config":{"color":c.node().value, "server": s.node().value}
         });
         config.color = c.node().value;
         config.server = s.node().value;
         setdiv(div1,"current",update);
         if (brush !== undefined) {
           setdiv(div2,"brushing", brush);
         }
         container.setTitle(config.server+" links");
         div1.style("color",config.color); //TODO dispatch mode.
       });

    div1.style("color",config.color); // TODO.
    layout.eventHub.on("brush", function(d) {
        brush = toolsAddChrPrefix(d);
        setdiv(div2,"brushing",brush);

    });
    layout.eventHub.on("update", function(d) {
       update = toolsAddChrPrefix(d);
       setdiv(div1,"current", update);
       div2.selectAll("*").remove();
    });

    container.on("show",function(d) {
      setdiv(div1,"current",update);
      setdiv(div2,"brushing", brush);
    });
};

//TODO replace daslink ucsclink and washulink. add customized templates.

function das$1(db,coords,type) {
  return "http://genome.ucsc.edu/cgi-bin/das/"+db+"/features?segment="+regionText(coords).replace("chr","").replace("-",",")+";type="+type
}
function ucsc$1(org,db,position,width) {
  return "http://genome.ucsc.edu/cgi-bin/hgTracks?org="+org+"&db="+db+"&position="+regionText(position)+"&pix="+width
}
function washu$1(db,position) {
  return "http://epigenomegateway.wustl.edu/browser/?genome="+db+"&coordinate="+regionText(position)
}
var defaultConfig$2 = {
  "color" : "#111",
  "server" : "ucsc"
};

var ml$1 = ["ucsc","washu","das"];

var popouts = function(layout, container, state, app) {
    var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg",true);
    var content = d3.select(container.getElement()[0]).append("div").classed("content",true);
    var div1 = content.append("div");
    var div2 = content.append("div");
    //state.config parameters.
    /* render config panel and configs */
    var setdiv = function(div, title, d) {
      div.selectAll("*").remove();
      div.append("span").text(title);
      var ul = div.append("ul");
      var li = ul.selectAll("li").data(d);
      li.enter()
       .append("li")
       .merge(li)
       .on("click",function(d){
         var url="#";
         switch(config.server) {
           case "ucsc":
              url = ucsc$1( app.species || "human", app.genome || "hg19",d,800);
              break;
           case "das":
              url = das$1(app.genome || "hg19",d, app.dasType || "refGene");
              break;
           case "washu":
              url = washu$1( app.genome || "hg19",d);
              break;
           default:
              url = "#";
         }
         var newWindow = window.open(url, "", "width=800,height=500");
         layout.eventHub.on("update",function(){
           newWindow.close();
         });
         //return url//TODO SET CONFIG STATE
       }) //TODO set other org
       //.attr("target","_blank")
       .on("mouseover",function(d){
         d3.select(this).style("color","red");
       })
       .on("mouseout",function(d){
         d3.select(this).style("color","black");
       })
       .text(function(d,i){
         return "Region "+(i+1)
       });
    };
    var config = state.config || defaultConfig$2;
    /* render content */
    var brush = []; // instant states not store in container
    var update = state.regions || [];
    container.setTitle(config.server +" links"|| "links");
    var c = cfg.append("input")
      .attr("type","color")
      .attr("value",config.color);
    var s = cfg.append("select");
    s.selectAll("option").data(ml$1).enter()
    .append("option").attr("value",function(d){
      return d
    }).text(function(d){return d});
    cfg.append("input")
       .attr("type","button")
       .attr("value","submit")
       .on("click",function(){
         cfg.style("display","none"); //jQuery .hide()
         content.style("display","block"); //jQuery .show()
         container.extendState({
           "configView":false,
           "config":{"color":c.node().value, "server": s.node().value}
         });
         config.color = c.node().value;
         config.server = s.node().value;
         setdiv(div1,"current",update);
         if (brush !== undefined) {
           setdiv(div2,"brushing", brush);
         }
         container.setTitle(config.server+" links");
         div1.style("color",config.color); //TODO dispatch mode.
       });

    div1.style("color",config.color); // TODO.
    layout.eventHub.on("brush", function(d) {
        brush = toolsAddChrPrefix(d);
        setdiv(div2,"brushing",brush);

    });
    layout.eventHub.on("update", function(d) {
       update = toolsAddChrPrefix(d);
       setdiv(div1,"current", update);
       div2.selectAll("*").remove();
    });

    container.on("show",function(d) {
      setdiv(div1,"current",update);
      setdiv(div2,"brushing", brush);
    });
    
};

var ucsc$3 = function(org,db,position,width) {
  return "http://genome.ucsc.edu/cgi-bin/hgTracks?org="+org+"&db="+db+"&position="+regionText(position)+"&pix="+width
};

var labelLength = 105;

var ucsc$2 = function(layout, container, state, app) {
    var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg",true);
    var content = d3.select(container.getElement()[0]).append("div").classed("content",true);
    var div1 = content.append("div").style("position","relative");
    var svg = content.append("svg")
      .style("position","absolute")
      .style("pointer-events","none");
    var scale = scaleScope().gap(10+labelLength);

    //state.config parameters.
    /* render config panel and configs */
    var setiframe = function(div,  d) {
      scale.domain(d).range([10+labelLength,container.width-10]); //padding = 10
      var gbdiv = div.selectAll(".gbdiv")
        .data(d);
      svg.selectAll("rect").remove();
      gbdiv.selectAll("iframe").remove();
      gbdiv.enter().append("div")
        .classed("gbdiv",true)
        .merge(gbdiv)
        .style("position","absolute")
        .style("top",0)
        .style("left",function(d,i){
          var p = scale(d);
          return p[0][0] - labelLength
        })
        .style("width",function(d,i){
          var p = scale(d);
          return p[0][1]-p[0][0] + labelLength
        })
        .style("height",container.height)
        .style("background-color","#FFF")
        .append("iframe") //TODO
        .style("position","absolute")
        .style("top",-200)
        .style("left",-12)
        .style("border",0)
        .style("width",function(d){
          var p = scale(d);
          return p[0][1]-p[0][0] + labelLength
        })
        .style("height",container.height+200)
        .attr("src",function(d){
          var p = scale(d);
          var w = p[0][1]-p[0][0] + labelLength;
          return ucsc$3(app.species ||  "human", app.genome || "hg19",d,w)
        }
        );
      gbdiv.exit().remove();

       svg.attr("height",container.height+"px")
       .attr("width",container.width+"px");
    };
    var brush = []; // instant states not store in container
    var update = state.regions || [];

    layout.eventHub.on("brush", function(d) {
      if(!container.isHidden){
        brush = toolsAddChrPrefix(d);
        //TODO
        var pos=[];
        brush.forEach(function(d){
          var p = scale(d);
          var p0 = p[0];
          pos.push(p0);
          console.log("p0",p0);
        });
        var rect = svg.selectAll("rect").data(pos);

        rect.enter().append("rect")
        .merge(rect)
        .attr("x",function(d){return d[0]})
        .attr("y", 0)
        .attr("width",function(d){return d[1]-d[0]})
        .attr("height",container.height)
        .attr("opacity",0.2);
        rect.exit().remove();
      }

    });
    layout.eventHub.on("update", function(d) {
       update = toolsAddChrPrefix(d);
       if (!container.isHidden) {
         setiframe(div1, update);
       }
    });

    container.on("show",function(d) {
      setiframe(div1,update);
    });
};

var dna3d = function(layout, container, state, app) {
var rainbow = d3.scaleOrdinal(d3.schemeCategory20);
console.log(state);
var server = app["server"] || "";
//console.log("server in 3d",server)
//console.log("app in 3d ",app)
var dataURI = state.dataURI || server + "/3d/get/default";//TODO switch between 3ds
state.dataURI = dataURI;

var data;
var width = 500,
initialWidth = 500,
height = 500,
initialHeight = 500;
//container.getElement().remove(".content")
//container.getElement().remove(".content")
container.getElement().append("<div class='content'></div>");
//TODO manage URI
//container.getElement().append("<div class='cfg'>CONFIG<br><label>Data URI:</label><input type='text' class='uri'></input></div>")
var cfg = d3.select(container.getElement()[0])
		.append("div")
		.classed("cfg",true);
var datGui = datgui().closable(false);

//cfg.append("div").text("Data URI:")
// var uri = cfg.append("select")
var dat = {};
d3.json(server + "/3d/list",function(d){  //TODO Server


	dat = {
		"options":{"src":d},
		"config":{"src":d[0]}
	};
	cfg.selectAll(".io")
	.data([dat])
	.enter()
	.append("div")
	.classed("io",true)
	.call(datGui);

	/*
	uri.selectAll("option")
		 .data(d)
		 .enter()
		 .append("option")
		 .attr("value",function(d){
			 return server + "/3d/get/"+d;  //TODO Server
		 })
		 .text(function(d){
			 return d
		 })
	*/
});
//container.getElement().find(".cfg .uri").val(state.dataURI)
d3.select(container.getElement()[0])
.append("input")
.attr("type","button")
.attr("value","submit")
.on("click", function(){
	 //var v = container.getElement().find(".cfg .uri").val()
	 var v = "/3d/get/"+dat.config.src;
	 console.log(v);
	 if (v!=state.dataURI) {
		state.dataURI = v;
		dataLoaded = false;
		dataURI = v;
		load(draw); //event load data? //todo
	}
	 container.extendState({
		 "configView":false,
		 "dataURI": v
	 });
	 container.getElement().find(".content").show();
	 container.getElement().find(".cfg").hide();

});
var pdb,
	resolution = '1Mb',
	resolutionMult = 1000000,
	genome = {},
	segments = [],    						// range of bin indexes for each chromosome (ex [0, 193] for chrom 1)
	pairSegments = [],						// range of base pairs for each chromosome (ex [0, 197000000] for chrom 1)
	chromosomes = [],

	scene,   							//three js scene
	camera,  							//three js camera
	renderer,							//three js renderer
	controls,							//three js controls
	model,
	labels = [],
	all = [],       					//container for 3d model
	geometries = [],					//container for geometry of each chromosome
	meshes = [],    					//container for geometry + material of each chromosome
	sphere,
	raycaster = new THREE.Raycaster(),
	mouse = new THREE.Vector2(),
	click = new THREE.Vector2(),
	shifting = false,
	dragging = false,

	launch = true,
	dataLoaded = false,
	regions = [];

var load = function(callback) {
	resolution = '1Mb',
	resolutionMult = 1000000,
	genome = {},
	segments = [],    						// range of bin indexes for each chromosome (ex [0, 193] for chrom 1)
	pairSegments = [],						// range of base pairs for each chromosome (ex [0, 197000000] for chrom 1)
	chromosomes = [],
	labels = [],
	all = [],       					//container for 3d model
	geometries = [],					//container for geometry of each chromosome
	meshes = [],
	raycaster = new THREE.Raycaster(),
	mouse = new THREE.Vector2(),
	click = new THREE.Vector2(),
	shifting = false,
	dragging = false,
	launch = true,
	dataLoaded = false,
	regions = [];

	$.get(dataURI, function(data){
		pdb = data.split('\n');
		var bins = [];
		var chromosome = -1;
		var pairCounter = 0;
		var distance = 0;
		var pairChromStartIndex = 0;
		var offset = 0;
		var chr = null;
		var index = -1;

		//console.log("Loading and Parsing",dataURI,data)
		//load coordinates
		for (var i = 0; i < pdb.length - 1; i++){
			var row = pdb[i].split('\t');
			var location = row[1].split(' ');	// should look like ["chr1","3000000"]

					if (chr != location[0].substring(3)) { // case: new chromosome
				chromosome++;
				segments.push([index, i - 1]);
				chromosomes.push(location[0].substring(3));
				index = i;
				chr = location[0].substring(3);
				if (i != 0) {
					pairSegments.push([pairChromStartIndex, pairCounter]);
					pairChromStartIndex = pairCounter + 1;

				}
				distance = parseInt(location[1]);
				pairCounter += distance; //
					}
					else { // case: same chromosome as previous line
				if (i!=0){
					offset = 1;
				}
				var prevPair = parseInt(pdb[i-1].split('\t')[1].split(' ')[1]);
				distance = parseInt(location[1]) - prevPair;
				pairCounter += distance;
				if (distance != resolutionMult) {
					console.log(prevPair + "," + location[1]); // these are the bins that have >resolutionMult basepairs. due to alignment problems.
				}
					}
					all.push({
				'chromosome': location[0].substring(3),
				'chromosome_idx': chromosome,
				'bin': i,
				'pairCount': [pairCounter - distance + offset, pairCounter],
				'active': false
					});
					bins.push({
				'x': parseFloat(row[2]),
				'y': parseFloat(row[3]),
				'z': parseFloat(row[4]),
					});
		}
		segments.shift();
		segments.push([index, i - 1]);
		pairSegments.push([pairChromStartIndex, pairCounter]);
		genome = {
			'bins': bins,
			'chromosomes': []
		};

		dataLoaded = true;
		callback();
	});
};


var draw = function() {
  console.log("dataLoaded",dataLoaded);
	if (!dataLoaded) {
		return
	}
	getPanelSize();
	var model = "<div class='model'></div>";
	var title = "<div class='title'><div class = titleComponent>3D STRUCTURE<br></div></div>";
	container.getElement().find(".content .genome").remove();
	container.getElement().find(".content").append(
		"<div class = genome>"+ title + model + "</div>"
	);
	if (launch){
		init();
	}
	modelGenome();
	animate();
	if(regions.length > 0) {
		alphaRegions(regions);
	}

};
var getPanelSize = function(){
  width = container.width;
	initialWidth = container.width;
	height = container.height;
	initialHeight = container.height;
};

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, 1, 1, 20000);
renderer = new THREE.WebGLRenderer({ alpha: true });

var rerender = function(){
//d3.select(container.getElement()[0]).selectAll("*").remove()
	getPanelSize();
	console.log(width,height);
	draw();
	if(dataLoaded && regions.length > 0) {
		alphaRegions(regions);
	}
	//renderer.setSize(Math.min(height,width) - 25, Math.min(height,width) - 25);

};
function init() {
	//launch = false;

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, 1, 1, 20000);
	renderer = new THREE.WebGLRenderer({ alpha: true });

	renderer.setSize(Math.max(300,Math.min(height,width) - 25), Math.max(300,Math.min(height,width) - 25));
	renderer.setClearColor(0x000000, 0);
	container.getElement().find('.content .genome .model').append(renderer.domElement);//TODO FIX

	controls = new THREE.TrackballControls(camera, renderer.domElement);
	sphere = new THREE.Mesh(new THREE.SphereGeometry(11.5, 30, 30), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.1 }));
    sphere.visible = false;
    scene.add(camera);
    scene.add(sphere);

}

function modelGenome() {
	model = new THREE.Object3D();

	for (var i = 0; i<segments.length; i++){
		var segment = segments[i];
		var curve = new THREE.CatmullRomCurve3(genome.bins.slice(segment[0],segment[1]).map(function(values,bin){
			return new THREE.Vector3(values.x, values.y, values.z);
		}));

		var geometry = new THREE.TubeGeometry(
			curve, // path
			(segments[i % segments.length][1] - segments[i % segments.length][0]) * (resolution == '1Mb' ? 5 : 2), // segments
			resolution == '1Mb' ? 0.05 : 0.1, // radius
			3, // radiusSegments
			false // closed
		);

		geometries[i] = new THREE.BufferGeometry().fromGeometry(geometry);
		var alphas = new Float32Array(geometries[i].attributes.position.count);
		var colors = new Float32Array(geometries[i].attributes.position.count * 3);
		var color = d3.rgb(rainbow(i));
		for (var v = 0; v < geometries[i].attributes.position.count; v++){
			alphas[v] = 0.8;
			colors[(v * 3)] = color.r / 255;
			colors[(v * 3) + 1] = color.g / 255;
			colors[(v * 3) + 2] = color.b / 255;
		}
		geometries[i].attributes.alpha = new THREE.BufferAttribute(alphas, 1);
		geometries[i].attributes.color = new THREE.BufferAttribute(colors, 3);
		var material = new THREE.ShaderMaterial({
			vertexShader: document.getElementById('vertexShader').textContent, //TODO FIX
			fragmentShader: document.getElementById('fragmentShader').textContent, //TODO FIX
			vertexColors: THREE.VertexColors,
			transparent: true
		});
		meshes[i] = new THREE.Mesh(geometries[i], material);
		meshes[i].name = i;
		model.add(meshes[i]);
	}
	scene.add(model);
	camera.position.set(11, 11, 11);

}

function alphaModel(alpha, visible) {
	for (var i = 0; i < chromosomes.length; i++){
		if (visible != null && visible.indexOf(i) == -1) meshes[i].visible = false;
		else {
			meshes[i].visible = true;
			var alphas = new Float32Array(geometries[i].attributes.alpha.count);
			for (var a = 0; a < geometries[i].attributes.alpha.count; a ++){
				alphas[a] = alpha;
			}
			geometries[i].attributes.alpha = new THREE.BufferAttribute(alphas, 1);
		}
	}
}

function alphaSegments(alpha, visible_chrom, visible_bins) {
	for (var z = 0; z<all.length; z++){
		all[z].active = false;
	}
	//$('#contain .title .overbite').remove();
	for (var i = 0; i < visible_chrom.length; i++) {
		var visibleRange = visible_bins[i];
		var pairSegment = pairSegments[visible_chrom[i]];
		var segment = segments[visible_chrom[i]];
		var geometry = geometries[visible_chrom[i]];
		// var alphas = new Float32Array(geometries[visible_chrom[i]].attributes.alpha.count);
		var mesh = meshes[visible_chrom[i]];
		var binGeomSize = parseInt(geometry.attributes.alpha.count / (segment[1] - segment[0]));
		var overbite = 0;
		for (var j = segment[0]; j < segment[1]; j++){
			if (all[j].pairCount[1] < visibleRange[0] || all[j].pairCount[0] >= visibleRange[1]) {
				if(!all[j].active){
					for (var k = (j - segment[0]) * binGeomSize; k < (j + 1 - segment[0]) * binGeomSize; k++) {
						geometry.attributes.alpha.array[k] = 0.2; // non highlighted regions
					}
				}

			}
			else {
				if (all[j].pairCount[0] < visibleRange[0] && all[j].pairCount[1] >= visibleRange[0]) {
					overbite += (visibleRange[0] - all[j].pairCount[0]);
				}
				if (all[j].pairCount[0] < visibleRange[1] && all[j].pairCount[1] >= visibleRange[1]) {
					overbite += (all[j].pairCount[1] - visibleRange[1]);
				}
				all[j].active = true;
				for (var k = (j - segment[0]) * binGeomSize; k < (j + 1 - segment[0]) * binGeomSize; k++) {
					geometry.attributes.alpha.array[k] = 0.9; // highlighted regions
				}
			}

		}
		//$('#contain .title').append("<div class = overbite> RANGE " + i + " OVERBITE : " + overbite + "</div>")
		//geometries[visible_chrom[i]].attributes.alpha = new THREE.BufferAttribute(alphas, 1);
		geometry.attributes.alpha.needsUpdate = true;
	}


}

//revised by @author zhuxp
var chr2idx = function(d) {
	return parseInt(d.replace("chr","").replace("Chr",""))-1 //TODO improve
};
var translate = function(d) {
	var range = pairSegments[chr2idx(d.chr)];
	var start = Math.min(d.start+range[0],range[1]);
	var end = Math.min(d.end+range[0],range[1]);
	return [start,end]
};
var alphaRegions = function(regions) {
	var visArrayChroms = [];
	var visArrayBins = [];
	//var overbite = [(chrom1_range[1] - chrom1_range[0]) - (chrom1_endBin - chrom)];
	//visArrayChroms.push(chrom1-1);
	regions.forEach(function(d){
		visArrayChroms.push(chr2idx(d.chr));
		visArrayBins.push(translate(d));
	});
	console.log(visArrayBins);
	alphaModel(0.8, visArrayChroms);
	alphaSegments(0.8, visArrayChroms, visArrayBins);
};

layout.eventHub.on("update",function(d){
	regions = d;
	if(dataLoaded) {
		alphaRegions(d);
	}
});


function isNumberKey(evt) {
	var charCode = (evt.which) ? evt.which : evt.keyCode;
	// Added to allow decimal, period, or delete
	if (charCode == 110 || charCode == 190 || charCode == 46)
		return true;

	if (charCode > 31 && (charCode < 48 || charCode > 57))
		return false;

	return true;
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	render();
}

function render() {
	renderer.render(scene, camera);
}

container.on("resize", function(e) {
  rerender();
});

load(draw);
};

//TODO replace daslink ucsclink and washulink. add customized templates.

function ucsc$4(org, db, position, width) {
    return "http://genome.ucsc.edu/cgi-bin/hgTracks?org=" + org + "&db=" + db + "&position=" + regionText(position) + "&pix=" + width
}

var defaultConfig$4 = {
    "color": "#111",
    "server": "ucsc"
};

var external = function (layout, container, state, app) {
    var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg", true);
    var content = d3.select(container.getElement()[0]).append("div").classed("content", true);
    var div1 = content.append("div");
    var div2 = content.append("div");
    //state.config parameters.
    /* render config panel and configs */
    var windows = [window.open("", "", "width=800,height=500"), window.open("", "", "width=800,height=500")];
    var updated = function (d) {
        var r = toolsAddChrPrefix(d);
        console.log(windows);
        if (!windows[0].location.href) {
            windows[0].location = ucsc$4(app.species || "human", app.genome || "hg19", r[0], 800);
            if (r.length > 1 && windows[1] != undefined) {
                windows[1].location = ucsc$4(app.species || "human", app.genome || "hg19", r[1], 800);
            } else {
                windows[1].location = "/v1/version.html";
            }

        } else {
            windows[0].location.href = ucsc$4(app.species || "human", app.genome || "hg19", r[0], 800);
            if (r.length > 1 && windows[1] != undefined) {
                windows[1].location.href = ucsc$4(app.species || "human", app.genome || "hg19", r[1], 800);
            } else {
                windows[1].location.href = "/v1/version.html";
            }
        }
    };
    var updateMain =  function (d) {
        //newWindow.close();
        if (!windows[1]) {
            //console.log("wait for init") // block out should open in
            //setTimeout(function(){updated(d)},10000)
            windows[1] = window.open("", "", "width=800;height=700");
            updated(d);
        } else {
            updated(d);
        }

    };
    layout.eventHub.on("update",updateMain);

    var setdiv = function (div, title, regions) {

    };
    var config = state.config || defaultConfig$4;
    /* render content */
    var brush = []; // instant states not store in container
    var update = state.regions || [];


    div1.style("color", config.color); // TODO.
    /*
    layout.eventHub.on("brush", function (d) {
        brush = addChrPrefix(d)
        setdiv(div2, "brushing", brush)

    })
    var update = function (d) {
        update = addChrPrefix(d);
        setdiv(div1, "current", update)
        div2.selectAll("*").remove();
    }
    layout.eventHub.on("update", update )
    */
    container.on("show", function (d) {
        setdiv(div1, "current", update);
        setdiv(div2, "brushing", brush);
    });
    container.on("destroy", function () {
        console.log("close container");
        windows[0].close();
        windows[1].close();
        layout.eventHub.off("update",updateMain);
    });
};

//app is global var
function getTrimChrNames(a) {
  var names = [];
  a.forEach(function(d){
    names.push(d.chr.replace("chr","").replace("Chr",""));
  });
  return names
}
var ideogram = function(layout,container,state,app) {
  var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg",true);
  var content = d3.select(container.getElement()[0]).append("div").classed("content",true);
　var id = randomString(8);
  var div1 = content.append("div");
  var div = content.append("div").attr("id",id);
  //var svg = content.append("svg").attr("height",container.height).attr("width",container.width)
  layout.eventHub.on("brush", function(d) {
      //brush = d
      if(!container.isHidden){
        //div2.html("BRUSHING   " + regionsText(d))
      }

  });
  layout.eventHub.on("update", function(d) {
     console.log("updating",d);
     container.extendState({"regions":d});
     div.html("");
     div1.html("CURRENT   " + regionsText(d));
     if(!container.isHidden){
       //div.html("CURRENT   " + regionsText(d))
       var config = {
                container: "#"+id,
                organism: "human",
                //organism: app.species,
                chromosomes: getTrimChrNames(d),
                //chromosomes: d[0].chr.replace("chr",""),
                brush: false,
                chrHeight: 300,
                chrWidth: 10,
                rotatable: false,
                orientation: "horizontal"
                //onBrushMove: writeSelectedRange1,
                //onLoad: writeSelectedRange1
            };

      var ideogram = new Ideogram(config);
      console.log(ideogram);

     }
  });
  container.on("show",function(d) {
    //div1.html("WAKEUP "+ regionsText(update))
    //div2.html("WAKEUP BRUSHING "+ regionsText(brush))
  });
  var resize = function() {
    /*
     svg.attr("height", container.height)
        .attr("width", container.width)
    */
  };
  var TO = false;
  container.on("resize", function (e) {
      if (TO !== false) clearTimeout(TO);
      TO = setTimeout(resize, 200);
  });

};

var bigwigCanvas = function () {
  var id = "default";
  var pos = 0; //for response rect TODO remove this limitation (change to id or get the response var)
  var height;
  var width;
  var regions;
  var x;
  var y;
  var URI = "";
  var barHeight = 50;
  var vertical = false;
  var canvas;
  var panel; //canvas parent for add svg;
  var binsize;
  var scale;
  var respSvg;
  var gap = 0; //TODO for gap axis
  var mode = 0; // "max" or "mean" { 0: mix (max,min,mean) , 1: mean, 2: max/min }
  var callback = function (d) {
    console.log("callback", d);
  };

  /* is this a really a static function? */
  var renderRegion = function (ctx, xoffset, yoffset, region, xscale, yscale, color, ncolor) {
    //  var ctx = canvas.node().getContext("2d");
    //console.log(mat, mat.length)
    var area = d3.area()
                 .x(function(d){return xoffset + xscale(d.x)})
                 .y1(function(d){
                   return yoffset + (barHeight - yscale(d.y))
                 })
                 .y0(  yoffset + (barHeight - yscale(0)))
                 .context(ctx);
    var values = [{

        "x": xscale.domain()[0],
        "y": 0

    }];

    ctx.fillStyle = color;
    for (var i = 0; i < region.length; i++) {
      var r = xscale.range();
      if (isNaN(region[i].From) || isNaN(region[i].To)) {
        continue; //add handle large width bug
      }
      values.push({"x":(region[i].From+region[i].To)/2,"y":region[i].Sum/(region[i].Valid || region[i].Value)});
    }
    values.push(
      {
        "x":xscale.domain()[1],
        "y":0
      }
    );
    ctx.translate(x,y);
    ctx.beginPath();
    area(values);
    ctx.closePath();
    ctx.fill();
    ctx.translate(-x,-y);
  };
  //TODO get a simple rotated version.




  var xscales, xoffsets, widths;



  var response = function (e) {
    var rdata = [];
    //console.log(e,regions)
    regions.forEach(function (r, i) {
      e.forEach(function (d, j) {
        if (overlap(r, d)) {
          var x = xscales[i](d.start) + xoffsets[i];
          var l = xscales[i](d.end) + xoffsets[i] - x;
          rdata.push({
            "x": x,
            "l": l
          });
        }
      });
    });
    //console.log("rdata",rdata)
    var r1 = respSvg.selectAll("rect").data(rdata);
    r1.exit().remove();
    r1.enter()
      .append("rect")
      .merge(r1);

    r1.attr("x", function (d) {
        console.log("rx", d.x);
        return d.x
      })
      .attr("y", 0)
      .attr("height", barHeight)
      .attr("width", function (d) {
        return d.l
      })
      .attr("fill", function (d) {
        return "#777"
      })
      .attr("opacity", 0.2);

  };
  var _render_ = function (error, results) {
    var min = Infinity;
    var max = -Infinity;
    xscales = [];
    xoffsets = [];
    widths = [];
    var yoffset = 0;
    var offset = 0;
    var totalLen = totalLength(regions);
    var effectWidth = width - (regions.length - 1) * gap;
    regions.forEach(function (d) {
      var w = (+(d.end) - (+d.start)) * effectWidth / totalLen;
      var scale = d3.scaleLinear().domain([+(d.start), +(d.end)]).range([0, w]);
      xscales.push(scale);
      xoffsets.push(offset);
      offset += w + gap;
      widths.push(w);
    });

    results.forEach(function (arr) {
      if (mode == 0 || mode == 2) {
        arr.forEach(function (d) {
          var v = d.Max || d.Value;
          var vmin = d.Min || d.Value;
          if (v > max) {
            max = v;
          }
          if (vmin < min) {
            min = vmin;
          }
        });
      } else {
        arr.forEach(function (d) {
          var v = d.Sum / d.Valid || d.Value;
          if (v > max) {
            max = v;
          }
          if (v < min) {
            min = v;
          }
        });
      }

    });
    var yscale = d3.scaleLinear().domain([Math.min(0, min), Math.max(max, 0)]).range([0, barHeight]); //TODO?
    scale = yscale;
    var axisScale = d3.scaleLinear().domain([min, max]).range([barHeight, 0]);
    var color = d3.scaleOrdinal(d3.schemeCategory10); // TODO here.
    var background = "#FFF";
    if (vertical) {
      //renderRespVertical(); //TODO
      var ctx = canvas.node().getContext("2d");
      ctx.fillStyle = background;
      ctx.fillRect(x, y, barHeight, width);
      results.forEach(function (region, i) {
        renderRegionVertical(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, "#333", "#666");
      });
      canvasToolXAxis(ctx, axisScale, x, y + width, barHeight, id);
    } else {
      //renderResp(); //TODO
      var ctx = canvas.node().getContext("2d");
      ctx.fillStyle = background;
      ctx.fillRect(x, y, width, barHeight);
      results.forEach(function (region, i) {
        renderRegion(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, "#333", "#666");
      });

      canvasToolYAxis(ctx, axisScale, x + width, y, barHeight, undefined);

      ctx.fillText(id, x + 10, y + 10);
    }
    callback({
      "min": min,
      "max": max
    });
  };
  var rawdata = false;
  var _render = function () {
    var q = d3_queue.queue(2);
    if (binsize != -1) {
      rawdata = false;
      if (binsize == undefined) {
        binsize = 1;
      }
      regions.forEach(function (d) {
        q.defer(d3.json, URI + "/getbin/" + id + "/" + d.chr + ":" + d.start + "-" + d.end + "/" + binsize);
      });
    } else {
      rawdata = true;
      regions.forEach(function (d) {
        q.defer(d3.json, URI + "/get/" + id + "/" + d.chr + ":" + d.start + "-" + d.end);
      });
    }
    q.awaitAll(_render_);
  };
  var render = function () {
    var length = totalLength(regions);
    var url = URI + "/binsize/" + id + "/" + length + "/" + width;
    console.log("URL", url);
    d3.json(url, function (d) {
      binsize = d;
      console.log("BINSIZE", binsize);
      _render();
    });
  };
  var chart = function (selection) { //selection is canvas;
    canvas = selection;
    panel.selectAll(".resp" + "_" + pos).remove();
    if (vertical) {
      respSvg = panel.append("svg")
        .classed("resp_" + pos, true)
        .style("postion", "absolute")
        .style("top", y)
        .style("left", x)
        .attr("width", barHeight)
        .attr("height", width)
        .append("g")
        .attr("transform", "translate(" + barHeight + "," + 0 + ") rotate(90)");
    } else {
      respSvg = panel.append("svg")
        .classed("resp_" + pos, true)
        .style("postion", "absolute")
        .style("top", y)
        .style("left", x)
        .attr("width", width)
        .attr("height", barHeight);
    }


    render();
  };
  var modes = ["mix", "mean", "max"];
  chart.mode = function (_) {
    if (!arguments.length) {
      return modes[mode]
    } else {
      mode = 0;
      if (_ == "max" || _ == 2) {
        mode = 2;
      }
      if (_ == "mean" || _ == 1) {
        mode = 1;
      }
      return chart
    }
  };
  chart.callback = function (_) {
    return arguments.length ? (callback = _, chart) : callback;
  };
  chart.panel = function (_) {
    return arguments.length ? (panel = _, chart) : panel;
  };
  chart.x = function (_) {
    return arguments.length ? (x = _, chart) : x;
  };
  chart.y = function (_) {
    return arguments.length ? (y = _, chart) : y;
  };
  chart.regions = function (_) {
    return arguments.length ? (regions = _, chart) : regions;
  };
  chart.width = function (_) {
    return arguments.length ? (width = _, chart) : width;
  };
  chart.height = function (_) {
    return arguments.length ? (height = _, chart) : height;
  };
  chart.URI = function (_) {
    return arguments.length ? (URI = _, chart) : URI;
  };
  chart.barHeight = function (_) {
    return arguments.length ? (barHeight = _, chart) : barHeight;
  };
  chart.response = function (e) {
    response(e);
  };
  chart.id = function (_) {
    return arguments.length ? (id = _, chart) : id;
  };
  chart.vertical = function (_) {
    return arguments.length ? (vertical = _, chart) : vertical;
  };
  chart.pos = function (_) {
    return arguments.length ? (pos = _, chart) : pos;
  };
  chart.scale = function (_) {
    return arguments.length ? (scale = _, chart) : scale;
  };
  chart.gap = function (_) {
    return arguments.length ? (gap = _, chart) : gap;
  };
  return chart
};

//TODO Config Part
var bigwig = function (layout, container, state, app) {
  var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg", true);
  //cfg.html("TODO CONFIG")
  var content = d3.select(container.getElement()[0]).append("div")
    .classed("content", true);
  var main = content.append("div")
    //.attr("id","main")
    .style("position", "relative");
  var canvas = main.append("canvas");
  var server = state["server"] || app["server"] || "";
  var bigwig;
  var init = false;
  var dispatch = d3.dispatch("brush", "update","replot");
  var bwconfig = state["bwconfig"] || undefined;
  var scope = {
    "edge": 500,
    "background": "#BBB"
  };
  var initBw = function (data) {
    //console.log("bigwig", data)
    bigwig = data;
    init = true;
    renderCfg(data);
  };
  var datGui = datgui().closable(false);
  var renderCfg = function (data) { // TODO make checkbox workin
    var factory = function(d,n) {
      var a = {};
      d.forEach(function(id,i){
        if (i<n) {
          a[id] = true;
        } else {
          a[id] = false;
        }
      });
      return a
    };
    var dat = {};
    dat["options"] = factory(data.trackIds,10);
    dat["config"] = container.getState()["trackConfig"] || {};
    cfg.selectAll(".io").remove();
    cfg.selectAll(".io")
      .data([dat])
      .enter()
      .append("div")
      .classed("io",true)
      .call(datGui);

    cfg.append("div").append("input")
    .attr("type","button")
    .attr("value","submit")
    .text("submit")
    .on("click",function(){
      bwconfig = dat.config;
      cfg.style("display", "none");
      content.style("display", "block");

      container.extendState({
          "bwconfig":dat.config
      });
      container.extendState({
          "configView": false
      });
      dispatch.call("replot", this, {});
    });

  };
  B.Get(server + "/bw", initBw);
  var renderBigwig = function (regions) {
    var ctx = canvas.node().getContext("2d");
    ctx.fillStyle = scope.background;
    ctx.fillRect(0, 0, scope.width, scope.height);
    var bw = [];
    var tracks = [];
    //TODO : load localStorage configure?
    if (!bwconfig) {
      bigwig.trackIds.forEach(function (b, i) {
        tracks.push(b);
      });
    } else {
      for (var k in bwconfig) {
        if (bwconfig[k]) {
          tracks.push(k);
        }
      }
    }
    tracks.forEach(function (b, i) {
      bw.push(
        //B.canvas()
        bigwigCanvas()
        .URI(server + "/bw") //set this?
        .id(b)
        .x(10)
        .y(40 + i * 80)
        .width(scope.edge)
        .gap(20) //TODO REMV
        .regions(toolsAddChrPrefix(regions))
        .panel(main)
        .mode(1)
        .pos(i)
      );
    });
    dispatch.on("brush.local", function (e) {
      bw.forEach(function (b, i) {
        b.response(e);
      });
    });
    bw.forEach(function (b) {
      canvas.call(b);
    });
  };
  //var svg = content.append("svg").attr("height",container.height).attr("width",container.width)
  var regions = state.regions || [];
  layout.eventHub.on("brush", function (d) {
    //brush = d
    if (!container.isHidden) {
      //div2.html("BRUSHING   " + regionsText(d))
      dispatch.call("brush", this, d);
    }

  });
  layout.eventHub.on("update", function (d) {
    container.extendState({
      "regions": d
    });
    //main.html("")
    regions = d;
    if (!container.isHidden && init) {
      //console.log("CALL RENDER BIGWIG",d)
      //div.html("CURRENT   " + regionsText(d))
      renderBigwig(d);
    }
  });
  dispatch.on("replot",function(){
    renderBigwig(regions);
  });
  container.on("show", function (d) {
    //div1.html("WAKEUP "+ regionsText(update))
    //div2.html("WAKEUP BRUSHING "+ regionsText(brush))
    /*
    if (init) {
      renderBigwig(d)
    }
    */
  });
  var resize = function () {
    canvas.attr("height", container.height)
      .attr("width", container.width);


    scope.edge = container.width - 40;
    scope.width = container.width;
    scope.height = container.height;
    if (init) {
      renderBigwig(regions);
    }
  };
  var TO = false;
  container.on("resize", function (e) {
    if (TO !== false) clearTimeout(TO);
    TO = setTimeout(resize, 2000);
  });

};

/* coord API

 */
var coord = function () {
  var regions;
  var width = 500;
  var gap = 10;
  var inited = false;
  var scales, offsets, widths;
  /* x.chr x.start x.end */
  /* TODO add overflow fix */
  var chart = function (e) {
    if (!inited) {
      init();
    }
    var rdata = [];
    //console.log(e,regions)

    regions.forEach(function (r, i) {
      var domain = scales[i].domain();
      if (Object.prototype.toString.call(e) === '[object Array]') {
        e.forEach(function (d, j) {
          if (overlap(r, d)) {
            var start = d.start;
            var end = d.end;
            var full = true;
            if (d.start < domain[0]) {
              start = domain[0];
              full = false;
            }
            if (d.end > domain[1]) {
              end = domain[1];
              full = false;
            }
            var x = scales[i](start) + offsets[i];
            var full = true;
            var l = scales[i](end) + offsets[i] - x;

            rdata.push({
              "x": x,
              "l": l,
              "f":full
            });
          }
        });
      } else {
        if (overlap(r, e)) {
          var start = e.start;
          var end = e.end;
          var full = true;
          if (e.start < domain[0]) {
            start = domain[0];
            full = false;
          }
          if (e.end > domain[1]) {
            end = domain[1];
            full = false;
          }
          var x = scales[i](start) + offsets[i];
          var l = scales[i](end) + offsets[i] - x;
          rdata.push({
            "x": x,
            "l": l,
            "f":full
          });
        }
      }
    });

    return rdata
  };
  var init = function () {
    inited = true;
    scales = [];
    offsets = [];
    widths = [];
    var offset = 0;
    var totalLen = totalLength(regions);
    var effectWidth = width - (regions.length - 1) * gap;
    regions.forEach(function (d) {
      var w = (+(d.end) - (+d.start)) * effectWidth / totalLen;
      var scale = d3.scaleLinear().domain([+(d.start), +(d.end)]).range([0, w]);
      scales.push(scale);
      offsets.push(offset);
      offset += w + gap;
      widths.push(w);
    });
  };
  chart.width = function (_) {
    return arguments.length ? (width = _, inited = false, chart) : width;
  };
  chart.regions = function (_) {
    return arguments.length ? (regions = _, inited = false, chart) : regions;
    e;
  };
  chart.gap = function (_) {
    return arguments.length ? (gap = _, inited = false, chart) : gap;
  };
  return chart
};

var trackManager = function () {
  var callback;
  var width = 800;
  //var scale = d3.scale.linear().range([0, width]);
  var coord$$1;
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
        i = j;
      }
    });
    return i;
  };

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
  };
  var _putToTrack = function (d, i) {
    d.forEach(function (d) {
      if (trackAvailableArray[i] < d.x + d.l) {
        trackAvailableArray[i] = d.x + d.l;
      }
    });
    if (trackNumber < i) {
      trackNumber = i;
    }
  };
  var trackAssign = function(d) {
    var r = {i:0,c:false};
    d.forEach(function (d0) {
      var x = _trackAvailable(d0);
      if (r.i <= x.i) {
         r.i = x.i;
         r.c = x.c;
      }
    });
    _putToTrack(d, r.i);
    return r
  };

  var chart = function (selection) {
    /*
    selection.each(function (d, i) {
      var r = coord(d)
      var iTrack = trackAssign(r)

    })
    */
  };
  chart.AssignTrack = function(d) {
    var r = coord$$1(d);
    return trackAssign(r)
  };
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
  };
  chart.trackHeight = function (x) {
    if (!arguments.length == 0) {
      trackHeight = x;
      return chart
    } else {
      return trackHeight;
    }
  };

  chart.coord = function (_) {
    return arguments.length ? (coord$$1 = _, chart) : coord$$1;
  };
  chart.regions = function (_) {
    return arguments.length ? (regions = _, chart) : regions;
  };
  chart.callback = function (_) {
    return arguments.length ? (callback = _, chart) : callback;
  };
  return chart;
};

var symbolArrow = {
    draw: function (context, size) {
        context.moveTo(0, -size/2);
        context.lineTo(size/2, 0);
        context.lineTo(0, size/2);
    }
};

var symbolRarrow = {
    draw: function (context, size) {
        context.moveTo(size/2, -size/2);
        context.lineTo(0, 0);
        context.lineTo(size/2, size/2);
    }
};

function split(start, end, thickStart, thickEnd) {
  if (end < thickStart || start > thickEnd) {
    return [{
      "s": start,
      "e": end,
      "t": 0
    }]
  }
  if (start >= thickStart && end <= thickEnd) {
    return [{
      "s": start,
      "e": end,
      "t": 1
    }]
  }
  if (start < thickStart && end < thickEnd) {
    return [{
      "s": start,
      "e": thickStart,
      "t": 0
    }, {
      "s": thickStart,
      "e": end,
      "t": 1
    }]
  }
  if (start > thickStart && end > thickEnd) {
    return [{
      "s": start,
      "e": thickEnd,
      "t": 1
    }, {
      "s": thickEnd,
      "e": end,
      "t": 0
    }]
  }
  if (start < thickStart && end > thickEnd) {
    return [{
      "s": start,
      "e": thickStart,
      "t": 0
    }, {
      "s": thickStart,
      "e": thickEnd,
      "t": 1
    }, {
      "s": thickEnd,
      "e": end,
      "t": 0
    }]
  }
  console.log("WARNING",start,end,thickStart,thickEnd);
  return []
}
var shapeGene = function () {
  var color = "blue";
  var context;
  var buffer;
  var width = 200;
  var label = false;

  function chart(data) {
    var scale = d3.scaleLinear().domain([0, data.end - data.start]).range([0, width]);
    if (context == null) {
      buffer = context = d3.path();
    } else {
      context.strokeStyle = context.fillStyle = color;
    }
    var hs = [6,10];
    var y = 0; //TODO
    var arrows = {
      "+":d3.symbol().type(symbolArrow).size(4).context(context),
      "-":d3.symbol().type(symbolRarrow).size(4).context(context)
    };
    var arrow = arrows[data.strand];
    context.moveTo(0, y);
    context.lineTo(width, y);
    if (!buffer) {
      context.stroke();
    }
    var thickStart = data.thickStart - data.start;
    var thickEnd = data.thickEnd - data.start;
    for (var i = 0; i < data.blockCount; i++) {
      var starti = data.blockStarts[i];
      var endi = data.blockStarts[i] + data.blockSizes[i];
      var di = split(starti, endi, thickStart, thickEnd);
      di.forEach(function (d) {
        var x = scale(d.s);
        var w = scale(d.e) - x;
        var h = hs[d.t];
        context.rect(x, y - h / 2, w, h);
      });
    }

    if (!buffer) {
      //context.stroke();
      // context.save();
      //context.moveTo(-110,y);
      context.fill();
      if (label) {
      context.fillStyle = "black";
      context.font = "8px Arial";
      context.fillText(data.name, scale(0) - 4*data.name.length -10,y + 2);
      }
      //context.restore();
    }
    for (var i = 0; i < data.blockCount - 1; i++) {
      var s = scale(data.blockStarts[i] + data.blockSizes[i]);
      var e = scale(data.blockStarts[i + 1]);
      console.log(s,e);
      if(!buffer && arrow){
      context.strokeStyle = "#333333";
      context.beginPath();
      for (var j = 10; j < e - s; j += 10) {
        var x = s + j;
        context.translate(x, y);
        context.beginPath();
        arrow();
        //context.closePath()
        context.stroke();
        context.translate(-x, -y);
      }
    }
    }
    if (buffer) {
      return buffer + "";
    } else {

    }
  }
  chart.width = function (_) {
    return arguments.length ? (width = _, chart) : width;
  };
  chart.color = function (_) {
    return arguments.length ? (color = _, chart) : color;
  };
  chart.context = function (_) {
    return arguments.length ? (context = _, chart) : context;
  };
  chart.label = function(_) { return arguments.length ? (label= _, chart) : label; };
  return chart
};

function parseInts(s) {
  var a = [];
  s.split(",").forEach(function (d) {
    a.push(parseInt(d));
  });
  return a;
}

var BB = {
  Get: function (URI, callback) {
    var config = {};
    var ready = function (error, results) {
      config.URI = URI;
      config.trackIds = results[0];
      callback(config);
    };
    d3_queue.queue(2)
      .defer(d3.json, URI + "/list")
      .awaitAll(ready);
  },
  canvas: function () {
    var id = "gene"; //TODO
    var pos = 0; //for response rect TODO remove this limitation (change to id or get the response var)
    var height = 12;
    var gap = 3;
    var x = 0;
    var y = 0;
    var coord;
    var regions;
    var el;
    var trackM;
    var ctx;
    var URI = "";
    var _render_ = function (error, results) {
      ctx.fillStyle = "grey";
      ctx.fillRect(x, y, coord.width(), height);
      results.forEach(function (d) {
        //onsole.log(d)
        var lines = d.split("\n");
        lines.forEach(function (d) {
          var t = d.split("\t");
          var a = {
            "chr": t[0],
            "start": parseInt(t[1]),
            "end": parseInt(t[2])
          };
          if (t.length >= 6) {
            a["name"] = t[3];
            a["score"] = parseInt(t[4]);
            a["strand"] = t[5];
          }
          if (t.length >= 12) {
            a["thickStart"] = parseInt(t[6]);
            a["thickEnd"] = parseInt(t[7]);
            a["itemRgb"] = t[8];
            a["blockCount"] = parseInt(t[9]);
            a["blockSizes"] = parseInts(t[10]);
            a["blockStarts"] = parseInts(t[11]);
          }


          var xs = coord(a);
          //console.log(a,x)
          //TODO console.log(coord(a))
          ctx.fillStyle = "blue";
          xs.forEach(function (o, i) {
            if (o.f) {
              var width = o.l > 1 ? o.l : 1;
              var yi = trackM.AssignTrack(a);
              //TODO ctx.fillRect(x + o.x, y + yi * (height+gap), width, height)

              ctx.translate(x + o.x, y + yi.i * (height + gap));
              shapeGene().width(width).label(!yi.c).context(ctx)(a);
              ctx.translate(-x - o.x, -y - yi.i * (height + gap));

            } else {
              ctx.fillStyle = "red"; //TODO partial overlap problem.
              ctx.fillRect(x + o.x, y + yi * (height + gap), width, height);
            }

          });

        });
      });
    };
    var render = function () {
      /* NOT JSON BUT BED */
      var q = d3_queue.queue(2);
      regions.forEach(function (d) {
        q.defer(d3.text, URI + "/" + id + "/get/" + d.chr + ":" + d.start + "-" + d.end);
      });
      q.awaitAll(_render_);
    };
    var chart = function (selection) {
      trackM = trackManager().coord(coord);
      el = selection; //canvas?
      ctx = el.node().getContext("2d");
      render();
    };
    chart.x = function (_) {
      return arguments.length ? (x = _, chart) : x;
    };
    chart.y = function (_) {
      return arguments.length ? (y = _, chart) : y;
    };
    chart.height = function (_) {
      return arguments.length ? (height = _, chart) : height;
    };
    chart.URI = function (_) {
      return arguments.length ? (URI = _, chart) : URI;
    };
    chart.coord = function (_) {
      return arguments.length ? (coord = _, chart) : coord;
    };
    chart.regions = function (_) {
      return arguments.length ? (regions = _, chart) : regions;
    };
    chart.id = function (_) {
      return arguments.length ? (id = _, chart) : id;
    };
    return chart
  }

};

//TODO Config Part
var bigbed = function (layout, container, state, app) {
  var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg", true);
  //cfg.html("TODO CONFIG")
  var content = d3.select(container.getElement()[0]).append("div")
    .classed("content", true);
  var main = content.append("div").style("position", "relative");
  var canvas = content.append("canvas");
  var svg = content.append("svg");
  var server = state["server"] || app["server"] || ""; //TODO
  var trackNames;
  var init = false;
  var dispatch = d3.dispatch("brush", "update", "replot");
  var trackConfig = state["trackConfig"] || undefined;
  var scope = {
    "edge": 500,
    "background": "#BBB"
  };
  var dbname = state["dbname"] || "bigbed";
  var coords;

  var initTracks = function (data) {
    //console.log("bigwig", data)

    trackNames = data;
    init = true;
    renderCfg(data);
  };
  var datGui = datgui().closable(false);
  var renderCfg = function (data) { // TODO make checkbox working
    var factory = function(d,n) {
      var a = {};
      d.forEach(function(id,i){
        if (i<n) {
          a[id] = true;
        } else {
          a[id] = false;
        }
      });
      return a
    };
    var dat = {};
    dat["options"] = factory(data.trackIds,10);
    dat["config"] = container.getState()["trackConfig"] || {};
    cfg.selectAll(".io").remove();
    cfg.selectAll(".io")
      .data([dat])
      .enter()
      .append("div")
      .classed("io",true)
      .call(datGui);
    cfg.append("div").append("input")
      .attr("type", "button")
      .attr("value", "submit")
      .text("submit")
      .on("click", function () {
        //console.log(text)
        trackConfig = dat.config;
        cfg.style("display", "none");
        content.style("display", "block");

        container.extendState({
          "trackConfig": trackConfig
        });
        container.extendState({
          "configView": false
        });
        dispatch.call("replot", this, {});
      });
  };
  BB.Get(server + "/" + dbname, initTracks);
  var regions = state.regions || [];
  var render = function (d) {
    main.html("todo render" + regionsText(d));
    svg.selectAll(".resp").remove();
    coords = coord().regions(regions).width(scope.width);
    var ctx = canvas.node().getContext("2d");
    ctx.fillStyle = scope.background;
    ctx.fillRect(0,0,scope.width,scope.height);
    //TODO Add Ids
    var i = 0;
    var height = 25;
    for (var id in trackConfig) {
      if(trackConfig[id]) {
        var chart = BB.canvas().coord(coords).regions(regions).URI(server + "/" + dbname).id(id).y(i*height);
        canvas.call(chart);
        i+=1;
      }
    }
  };
  var brush = function (d) {
    main.html("todo brush " + regionsText(d));
    var r = coords(d);
    var resp = svg.selectAll(".resp")
      .data(r);
    resp.exit().remove();
    resp.enter()
      .append("g")
      .attr("class", "resp")

      .merge(resp)
      .attr("transform",function(d){
        return "translate("+d.x+",0)"
      });
   var rect = resp.selectAll("rect")
      .data(function(d){
        return [d]
      });
      rect.enter()
      .append("rect")
      .merge(rect)
      .attr("height", scope.height)
      .attr("width", function (d) {
        return d.l > 1 ? d.l : 1
      })
      .attr("fill", "black")
      .attr("opacity", 0.2);

  };

  layout.eventHub.on("brush", function (d) {
    //brush = d
    if (!container.isHidden) {
      //div2.html("BRUSHING   " + regionsText(d))
      dispatch.call("brush", this, d);
    }

  });
  layout.eventHub.on("update", function (d) {
    container.extendState({
      "regions": d
    });
    regions = d;
    if (!container.isHidden && init) {
      render(d);
    }
  });
  dispatch.on("replot", function () {
    render(regions);
  });
  dispatch.on("brush", function (d) {
    brush(d);
  });
  var resize = function () {
    canvas.attr("height", container.height)
      .attr("width", container.width);
    svg.attr("height", container.height)
        .attr("width", container.width);
    scope.edge = container.width - 40;
    scope.width = container.width;
    scope.height = container.height;
    if (init) {
      coords.regions(regions).width(scope.width);
      render(regions);
    }
  };
  var TO = false;
  container.on("resize", function (e) {
    if (TO !== false) clearTimeout(TO);
    TO = setTimeout(resize, 2000);
  });

};

const norms$3 = constant().norms;
const units$3 = constant().units;
const _barHeight$1 = 30;


var ctrlCanvas = function (layout, container, state, app) {

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
  ];



  var scope = {
    "background": "#BBB"
  };
  var init = {
    "bigwig": false,
    "hic": false,
    "bigbed": false
  };
  var server = app["server"] || "";
  var hic = {};
  var hics = {
    "options": {},
    "config": {}
  };
  var dispatch = d3.dispatch("update", "brush", "cfgHic", "replot", "domain", "monitor");
  var main = d3.select(container.getElement()[0])
    .append("div")
    .attr("class", "content")
    .style("position", "relative");
  var content = main;
  var cfg = d3.select(container.getElement()[0])
    .append("div")
    .attr("class", "cfg");
  var sign = false;
  var datGui = datgui().closable(false);


  dispatch.on("cfgHic", function (data) { //Config HiC
    var opts = {
      "color2": "#ff0000",
      "color1": "#ffffff"
    };
    opts["unit"] = {};
    data.units.forEach(function (d) {
      var k = units$3[d];
      opts["unit"][k] = d;
    });
    opts["norm"] = {};
    data.norms.forEach(function (d) {
      //opts.norms.push({norms[d]:d})
      var k = norms$3[d];
      opts["norm"][k] = d;
    });
    hic.state = {};
    if (container.getState().hicState && sign == false) {
      hic.state = container.getState().hicState;
      //console.log("load hic STATE")
      opts["color1"] = hic.state.color1;
      opts["color2"] = hic.state.color2;
      sign = true; //load once.
    } else {
      sign = true;
    }
    container.extendState({
      "hicState": hic.state
    });
    var hicConfig = {
      options: opts,
      config: hic.state
    };
    cfg.selectAll(".hicio").remove();
    cfg.selectAll(".hicio")
    .data([hicConfig])
    .enter()
    .append("div")
    .classed("hicio",true)
    .call(datGui);

  });
  //console.log("container",container)
  var canvas = main.append("canvas").style("position", "absolute");
  var svg = main.append("svg").style("position", "absolute");
  var div = main.append("div").style("position", "absolute")
    .style("top", 10).style("left", 10).style("width", 50).style("height", 100);
  var div1 = main.append("div").style("position", "absolute");


  var state = {}; // TODO canvas state for hic , bigwigs and bigbeds....

  var btnPrint = div.append("button")
    .classed("btn", true)
    .html('<small><span class="glyphicon glyphicon-print"></span></small>')
    .on('click', function () {
      div.selectAll("a").remove();
      var a = div.append("a")
        .attr("href", canvas.node().toDataURL())
        .attr("download", "scope.png")
        .text("");
      a.node().click();
      a.remove();
    });



  var btnPlay = div.append("button")
    .classed("btn", true)
    .html('<small><span class="glyphicon glyphicon-play"></span></small>')
    .on("click", function () {
      dispatch.call("replot", this, {});
    });

  var btnZoomOut = div.append("button")
    .classed("btn", true)
    .html('<small><span class="glyphicon glyphicon-zoom-out"></span></small>')
    .on("click", function () {
      //var regions = region.ctrl.regions(); //or states?
      var regions = state.regions;
      regions.forEach(function (d, i) {
        d.length = getChrLength(d.chr); //TODO fix map for chromosome length;
        var l = d.end - d.start;
        regions[i].start = d.start - l < 0 ? 0 : d.start - l;
        regions[i].end = d.end + l > d.length ? d.length : d.end + l;
      });
      regions = toolsFixRegions(regions);
      dispatch.call("update", this, regions);
      //layout.eventHub.emit("input", regions)
    });

  var btnZoomIn = div.append("button")
    .classed("btn", true)
    .html('<small><span class="glyphicon glyphicon-zoom-in"></span></small>')
    .on("click", function () {
      var regions = state.regions;
      regions.forEach(function (d, i) {
        var l = Math.round((d.end - d.start) / 3);
        regions[i].start = d.start + l;
        regions[i].end = d.end - l;
      });
      regions = toolsFixRegions(regions);
      dispatch.call("update", this, regions);
      //layout.eventHub.emit("input", regions) //TODO

    });
  var axesG = svg.append("g").attr("transform", "translate(10,0)");

  var TO = false; //resize delay
  var resizePanel = function () {
    dispatch.call("replot", this, {});
  };
  container.on("resize", function (e) {
    if (TO !== false) clearTimeout(TO);
    canvas.attr("height", container.height)
      .attr("width", container.width);
    svg.attr("height", container.height)
      .attr("width", container.width);
    //TODO get a better size
    div1.style("top", 10)
      .style("left", 3 * container.width / 4)
      .style("width", container.width / 4)
      .style("height", container.width / 4);
    scope.edge = container.width - 40;
    scope.width = container.width;
    scope.height = container.height;
    TO = setTimeout(resizePanel, 2000);
  });
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
  ];
  var initHic = function (data) {
    hic.opts = data; //hic.opts.chrs
    dispatch.call("cfgHic", this, data);
    init.hic = true;
    var r = state.regions || testBeds;
    renderHic(r); //TODO d3 queue ?
  };

  //TODO.
  cfg.append("input")
    .attr("type", "button")
    .attr("value", "submit")
    .on("click", function (d) {
      container.extendState({
        "hicsState": hics.config,
        "hicState": hic.state,
        "bigWigState": bw.config,
        "bigBedState": bb.config
      });
      container.extendState({
        "configView": false
      });
      cfg.style("display", "none");
      main.style("display", "block");
      dispatch.call("replot", this, {});
    });



  var getChrLength = function (chr) {
    console.log(hic.opts.chrs, hic.opts.chr2idx);
    var i;
    if (hic.opts.chr2idx[chr] !== undefined) {
      i = hic.opts.chr2idx[chr];
    } else if (hic.opts.chr2idx[chr.replace("chr", "").replace("Chr", "")] !== undefined) {
      i = hic.opts.chr2idx[chr.replace("chr", "").replace("Chr", "")];
    } else {
      return 0; //unknown chromosome.
    }
    return hic.opts.chrs[i].Length
  };



  var bigwig;
  var bw = {
    "options": {},
    "config": {}
  };
  var initBw = function (data) {
    bigwig = data;
    if (container.getState().bigWigState) {
      console.log("getState");
      bw.config = container.getState().bigWigState;
      bigwig.trackIds.forEach(function (d, i) {
        bw.options[d] = bw.config[d];
      });
    } else {
      bigwig.trackIds.forEach(function (d, i) {
        bw.options[d] = (i < 4);
      });
    }
    cfg.selectAll(".bwio").data([bw])
    .enter()
    .append("div")
    .classed("bwio",true)
    .call(datGui);
    init.bigwig = true;
  };


  var bb = {
    "options": {},
    "config": {}
  };
  var bigbed;
  var initBb = function (data) {
    console.log("INIT BIGBED  ???",data);
    bigbed = data;
    if (container.getState().bigBedState) {
      console.log("getState");
      bb.config = container.getState().bigBedState;
      bigbed.trackIds.forEach(function (d, i) {
        bb.options[d] = bb.config[d];
      });
    } else {
      bigbed.trackIds.forEach(function (d, i) {
        bb.options[d] = (i < 4);
      });
    }
    cfg.selectAll(".bbio").data([bb])
    .enter()
    .append("div")
    .classed("bbio",true)
    .call(datGui);
    console.log("call cfg bbio");
    init.bigbed = true;
  };

  B.Get(server + "/bw", initBw);
  BB.Get(server + "/bigbed", initBb);

  var URI; //TODO THIS

  var resetHics = function (k, v) {
    container.extendState({
      "hicsState": hics.config
    });
    URI = server + "/hic/" + v;
    H.Get(URI, initHic);
  };
  // URI is default now. change this. TODO : handle

  var hicIO = datgui().callback(resetHics).closable(false);
  d3.json(server + "/hic/list", function (d) {
      hic.hics = d;
      hics.options = {
        "hic": d
      };
      if (container.getState().hicsState) {
        hics.config = container.getState().hicsState;
      } else {
        hics.config = {
          "hic": d[0]
        };
      }

      cfg.selectAll(".hicsgui").remove();
      cfg.selectAll(".hicsgui")
      .data([
        hics
      ])
      .enter()
      .append("div")
      .classed("hicsgui",true)
      .call(hicIO);
      //renderCfg(hics.opts, hics.cfg, callback)
      URI = server + "/hic/" + hics.config.hic;
      H.Get(URI, initHic);
  });
  var renderBigbed = function (regions) {
    //console.log("TODO render BigBed", regions)
    var dbname = "bigbed";
    var _bedHeight = 10;
    var bbs = [];
    var tracks = [];
    var yoffset = scope.edge / 2 + 40 + 4 * (_barHeight$1 + 10) + 5;
    //var yoffset = 300
    var coords = coord().regions(regions).width(scope.edge);
    //TODO : load localStorage configure?
    if (!bb.config) {
      bigbed.trackIds.forEach(function (b, i) {
        tracks.push(b);
      });
    } else {
      for (var k in bb.config) {
        if (bb.config[k]) {
          tracks.push(k);
        }
      }
    }
    tracks.forEach(function (id, i) {
      var chart = BB.canvas().coord(coords).regions(regions).URI(server + "/" + dbname).id(id).x(10).y(yoffset + i * _bedHeight);
      canvas.call(chart);
      //console.log("TODO Render", b, i)
    });


  };
  var renderBigwig = function (regions) {
    var bws = [];
    var tracks = [];
    //TODO : load localStorage configure?
    if (!bw.config) {
      bigwig.trackIds.forEach(function (b, i) {
        tracks.push(b);
      });
    } else {
      for (var k in bw.config) {
        if (bw.config[k]) {
          tracks.push(k);
        }
      }
    }
    tracks.forEach(function (b, i) {
      bws.push(
        B.canvas()
        .URI(server + "/bw") //set this?
        .id(b)
        .x(10)
        .y(scope.edge / 2 + 40 + i * (_barHeight$1 + 10))
        .width(scope.edge)
        .barHeight(_barHeight$1)
        .gap(20) //TODO REMV
        .regions(toolsAddChrPrefix(regions))
        .panel(main)
        .mode(1)
        .pos(i)
      );
    });
    dispatch.on("brush.local", function (e) {
      bws.forEach(function (b, i) {
        b.response(e);
      });
    });
    bws.forEach(function (b) {
      canvas.call(b);
    });
  };
  var renderHic = function (r) {
    var regions;
    var pre = new RegExp("^chr*");
    var Pre = new RegExp("^Chr*");
    console.log(hic.opts.chrs[0].Name);
    if (pre.test(hic.opts.chrs[1].Name) || Pre.test(hic.opts.chrs[1].Name)) {
      regions = r;
      console.log("pre", hic.opts.chrs[0]);
    } else {
      regions = toolsTrimChrPrefix(r);
      console.log("not pre", hic.opts.chrs[1]);
      //prefixed = false;
    }
    var scopebrush = brush$1().width(scope.edge).on("brush", function (d) {
      dispatch.call("brush", this, toolsAddChrPrefix(d));
      layout.eventHub.emit("brush", toolsAddChrPrefix(d));
    }).on("click", function (d) {
      dispatch.call("update", this, toolsAddChrPrefix(d));
    }).regions(regions);
    axesG.selectAll("*").remove();
    axesG.call(scopebrush);

    var hicCb = function (d) {
      dispatch.call("monitor", this, d);
      var ctx = canvas.node().getContext("2d");
      ctx.fillStyle = scope.background;
      ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40);
    };
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
        dispatch.call("brush", this, d);
      })
      .callback(hicCb);
    canvas.call(hic.chart);
    //TODO Fix OverFlow.
    dispatch.on("domain", function (d) {
      hic.chart.domain(d); //local render.
      hic.chart.render(function () {
        var ctx = canvas.node().getContext("2d");
        ctx.fillStyle = scope.background;
        ctx.fillRect(0, scope.width / 2 - 20, scope.width, 40);
      });

    });
  };
  var render = function (d) {
    var ctx = canvas.node().getContext("2d");
    ctx.fillStyle = scope.background;
    ctx.fillRect(0, 0, scope.width, scope.height);
    var regions = d;
    regions = toolsFixRegions(regions);
    container.extendState({
      "regions": d
    });
    state.regions = regions; //TODO FIXed
    layout.eventHub.emit("update", d);
    if (init.bigwig) {
      renderBigwig(regions);
    }
    if (init.hic) {
      console.log("Render HiC");
      renderHic(regions);
    }
    if (init.bigbed) {
      renderBigbed(regions);
    }
  };
  layout.eventHub.on("update", function (d) {
    console.log("update eventHub", d);
  });
  dispatch.on("monitor", function (d) {
    //div1.html(JSON.stringify(d, 2, 2)) //TODO renders.
    div1.html("");
    //var paratable = paraTable().data(d)
    //div1.call(paratable)
    var table = div1.append("table").classed("table", true)
      .classed("table-condensed", true)
      .classed("table-bordered", true);
    var keys = Object.keys(d);
    var tr = table.selectAll("tr").data(keys)
      .enter().append("tr");
    tr.append("td").text(function (d0) {
      return d0
    });
    tr.append("td").text(function (d0) {
      return d[d0]
    });
    var k0 = div1.append("div").style("padding-right", "20px");
    var k1 = k0.append("div"); //.attr("id","slider101")
    var k2 = k0.append("div");
    var max = d.max > 30000 ? 30000 : d.max;
    k2.html("0-" + max);
    $(k1.node()).slider({
      range: true,
      min: 0,
      max: max,
      values: [0, max],
      slide: function (event, ui) {
        //console.log(ui.values[0],ui.values[1])
        k2.html(ui.values[0] + "-" + ui.values[1]);
        dispatch.call("domain", this, [ui.values[0], ui.values[1]]);
      }
    });
  });

  dispatch.on("update.local", function (d) {
    console.log("update.local", d);
    render(toolsAddChrPrefix(d));
  });
  var fixRegions = function (d) {
    d.forEach(function (c, i) {
      if (c.start === undefined || c.start < 0) {
        c.start = 0;
      }
      var l = getChrLength(c.chr);
      if (c.end === undefined || c.start > l) {
        c.end = l;
      }
    });
    return d
  };
  layout.eventHub.on("input", function (d) {
    d = fixRegions(toolsAddChrPrefix(d));
    render(d);
  });
  dispatch.on("replot", function (d) {
    //layout.eventHub.emit("update", state.reigions || testBeds)
    render(state.regions || testBeds);
  });
};

var render = {
  simple : simple,
  links : links,
  popouts : popouts,
  hic : hic,
  hicMonitor : hicMonitor,
  hicIcon : hicIcon,
  ucsc : ucsc$2,
  dna3d  : dna3d,
  external : external,
  ideogram : ideogram,
  bigwig   : bigwig,
  bigbed   : bigbed,
  ctrlCanvas : ctrlCanvas
};

var rects = function() {
  var color = "grey";
  var context;
  var buffer;
  function chart(data){
    if (context == null) buffer = context = d3.path(); //only path works.
    data.forEach(function(d){
      context.fillStyle = d.color || color;
      context.rect(d.x,d.y,d.width,d.height);
      if (context.fill) {
        context.fill();
      }
      context.closePath();
    });
    if (buffer) return buffer+"";
  }
  chart.color = function(_) { return arguments.length ? (color= _, chart) : color; };
  chart.context = function(_) { return arguments.length ? (context= _, chart) : context; };
  return chart
};

exports.symbolTriangle = symbolTriangle;
exports.brush = brush;
exports.axis = axis;
exports.scopebrush = brush$1;
exports.brushTri = brushTri;
exports.regionForm = region;
exports.paraTable = parameter;
exports.colorbar = colorbar;
exports.canvasToolYAxis = canvasToolYAxis;
exports.canvasToolXAxis = canvasToolXAxis;
exports.dataBigwig = B;
exports.dataHic1 = hic1;
exports.dataHic2 = H;
exports.dataHic = H;
exports.toolsGetUrlParam = getUrlParam;
exports.toolsRandomString = randomString;
exports.toolsParseRegions = parseRegions;
exports.toolsFixRegions = toolsFixRegions;
exports.toolsAddPanelTo = addPanelTo;
exports.toolsRegionText = regionText;
exports.toolsRegionsText = regionsText;
exports.toolsTrimChrPrefix = toolsTrimChrPrefix;
exports.toolsAddChrPrefix = toolsAddChrPrefix;
exports.simpleMonitor = simpleMonitor;
exports.panel = panel;
exports.render = render;
exports.datgui = datgui;
exports.shapeRects = rects;
exports.shapeGene = shapeGene;
exports.canvasBigwig = bigwigCanvas;

Object.defineProperty(exports, '__esModule', { value: true });

})));
