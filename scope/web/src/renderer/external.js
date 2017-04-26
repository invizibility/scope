//TODO replace daslink ucsclink and washulink. add customized templates.

import addChrPrefix from "../tools/addChrPrefix"
import regionText from "../tools/regionText"

function das(db, coords, type) {
    return "http://genome.ucsc.edu/cgi-bin/das/" + db + "/features?segment=" + regionText(coords).replace("chr", "").replace("-", ",") + ";type=" + type
}

function ucsc(org, db, position, width) {
    return "http://genome.ucsc.edu/cgi-bin/hgTracks?org=" + org + "&db=" + db + "&position=" + regionText(position) + "&pix=" + width
}

function washu(db, position) {
    return "http://epigenomegateway.wustl.edu/browser/?genome=" + db + "&coordinate=" + regionText(position)
}
var defaultConfig = {
    "color": "#111",
    "server": "ucsc"
}

var ml = ["ucsc", "washu", "das"]

export default function (layout, container, state, app) {
    var cfg = d3.select(container.getElement()[0]).append("div").classed("cfg", true);
    var content = d3.select(container.getElement()[0]).append("div").classed("content", true);
    var div1 = content.append("div");
    var div2 = content.append("div");
    //state.config parameters.
    /* render config panel and configs */
    var windows = [window.open("", "", "width=800,height=500"), window.open("", "", "width=800,height=500")]
    var updated = function (d) {
        var r = addChrPrefix(d)
        console.log(windows)
        if (!windows[0].location.href) {
            windows[0].location = ucsc(app.species || "human", app.genome || "hg19", r[0], 800)
            if (r.length > 1 && windows[1] != undefined) {
                windows[1].location = ucsc(app.species || "human", app.genome || "hg19", r[1], 800)
            } else {
                windows[1].location = "/v1/version.html"
            }

        } else {
            windows[0].location.href = ucsc(app.species || "human", app.genome || "hg19", r[0], 800)
            if (r.length > 1 && windows[1] != undefined) {
                windows[1].location.href = ucsc(app.species || "human", app.genome || "hg19", r[1], 800)
            } else {
                windows[1].location.href = "/v1/version.html"
            }
        }
    }
    var updateMain =  function (d) {
        //newWindow.close();
        if (!windows[1]) {
            //console.log("wait for init") // block out should open in
            //setTimeout(function(){updated(d)},10000)
            windows[1] = window.open("", "", "width=800;height=700")
            updated(d)
        } else {
            updated(d)
        }

    }
    layout.eventHub.on("update",updateMain)

    var setdiv = function (div, title, regions) {

    }
    var config = state.config || defaultConfig
    /* render content */
    var brush = [] // instant states not store in container
    var update = state.regions || []


    div1.style("color", config.color) // TODO.
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
        setdiv(div1, "current", update)
        setdiv(div2, "brushing", brush)
    })
    container.on("destroy", function () {
        console.log("close container")
        windows[0].close();
        windows[1].close();
        layout.eventHub.off("update",updateMain)
    })
}
