(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
   typeof define === 'function' && define.amd ? define(['exports'], factory) :
   (factory((global.snow = global.snow || {})));
}(this, (function (exports) { 'use strict';

var triangle = {
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

var scopebrush = function () {
    function nearby(a,b) {
        if (a.chr!=b.chr) {return false}
        var l = Math.max(a.end,b.end) - Math.min(a.start,b.start);
        if (((a.end-a.start)+(b.end-b.start))/ l > 0.95) {
          return true
        }
        return false
    }
    function merge(a,b) {
        console.log("a",a);
        console.log("b",b);
        return {"chr":a.chr,"start":Math.min(a.start,b.start),"end":Math.max(a.end,b.end)}
    }
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
            var table = selection.selectAll(".para-table").data([data]);
            table.enter().append("table").classed("para-table",true);
            table.merge(table)
                .classed("table", true);
            table.selectAll("*").remove();
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
    context.fillText(label, -10, -10);
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

var bigwig = {
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
        var renderRegion = function (ctx, xoffset, yoffset, region, xscale, yscale, color) {
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
        var renderRegionVertical = function (ctx, yoffset, xoffset, region, xscale, yscale, color) {
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
            console.log(e,regions);
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
            console.log("rdata",rdata);
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
            var color = d3.scaleOrdinal(d3.schemeCategory10);
            var background = "#EEE";
            if (vertical) {
                //renderRespVertical(); //TODO
                var ctx = canvas.node().getContext("2d");
                ctx.fillStyle = background;
                ctx.fillRect(x, y, barHeight, width);
                results.forEach(function (region, i) {
                    renderRegionVertical(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, color(i));
                });
                canvasToolXAxis(ctx, axisScale, x, y + width, barHeight, id);
            } else {
                //renderResp(); //TODO
                var ctx = canvas.node().getContext("2d");
                ctx.fillStyle = background;
                ctx.fillRect(x, y, width, barHeight);
                results.forEach(function (region, i) {
                    renderRegion(ctx, xoffsets[i], yoffset, region, xscales[i], yscale, color(i));
                });

                canvasToolYAxis(ctx, axisScale, x + width, y, barHeight, id);
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

var hic2 = {
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
                config.chr2idx[d] = i;
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
        chart.state = function () {
            return {
                "unit": unitInput.node().value,
                "norm": normInput.node().value,
                "color1": color1Input.node().value,
                "color2": color2Input.node().value
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
    Get: hic2.Get,
    chart: hic2.chart,
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
  var x = a[1].split("-");
  return {
      "chr": a[0],
      "start": +x[0],
      "end": +x[1],
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
/* input :regions
 * output : merged regions */
function fixed(regions) {
  if (regions.length==1) {
    return regions;
  } //for now it use two only.//TODO multi regions.
  if (nearby(regions[0],regions[1])) {
    return [merge(regions[0],regions[1])]
  } else {
    return regions
  }
}
var fixRegions = function(regions) {
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

var trimChrPrefix = function(r) {
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

var addChrPrefix = function(r) { 
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

exports.symbolTriangle = triangle;
exports.brush = brush;
exports.axis = axis;
exports.scopebrush = scopebrush;
exports.brushTri = brushTri;
exports.regionForm = region;
exports.paraTable = parameter;
exports.colorbar = colorbar;
exports.canvasToolYAxis = canvasToolYAxis;
exports.canvasToolXAxis = canvasToolXAxis;
exports.dataBigwig = bigwig;
exports.dataHic1 = hic1;
exports.dataHic2 = hic2;
exports.dataHic = hic2;
exports.toolsGetUrlParam = getUrlParam;
exports.toolsRandomString = randomString;
exports.toolsParseRegions = parseRegions;
exports.toolsFixRegions = fixRegions;
exports.toolsAddPanelTo = addPanelTo;
exports.toolsRegionText = regionText;
exports.toolsRegionsText = regionsText;
exports.toolsTrimChrPrefix = trimChrPrefix;
exports.toolsAddChrPrefix = addChrPrefix;
exports.simpleMonitor = simpleMonitor;
exports.panel = panel;

Object.defineProperty(exports, '__esModule', { value: true });

})));
