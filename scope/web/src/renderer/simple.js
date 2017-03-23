import regionText from "../tools/regionText"
import regionsText from "../tools/regionsText"
export default function(layout, container, state) {
    var div1 = d3.select(container.getElement()[0]).append("div");
    var div2 = d3.select(container.getElement()[0]).append("div");
    layout.eventHub.on("brush", function(d) {
        div2.html("BRUSHING   " + regionsText(d))
    })
    layout.eventHub.on("update", function(d) {
        div1.html("CURRENT   " + regionsText(d))
        div2.html("")
    })
}
