import regionText from "../tools/regionText"
import regionsText from "../tools/regionsText"
export default function(layout, container, state) {

    var div1 = d3.select(container.getElement()[0]).append("div");
    var div2 = d3.select(container.getElement()[0]).append("div");
    var brush =[]
    var update = []
    layout.eventHub.on("brush", function(d) {
        brush = d
        if(!container.isHidden){
          div2.html("BRUSHING   " + regionsText(d))
        }

    })
    layout.eventHub.on("update", function(d) {
        update = d;
       if(!container.isHidden){
         div1.html("CURRENT   " + regionsText(d))
         div2.html("")
       }
    })
    container.on("show",function(d) {
      div1.html("WAKEUP "+ regionsText(update))
      div2.html("WAKEUP BRUSHING "+ regionsText(brush))
    })
}
