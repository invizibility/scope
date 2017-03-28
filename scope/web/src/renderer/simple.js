import regionText from "../tools/regionText"
import regionsText from "../tools/regionsText"
var defaultConfig = {
  "color" : "#EED"
}
export default function(layout, container, state) {
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

    var config = state.config || defaultConfig
    //TODO FORM state();
    //change title form; 
    cfg.append("input")
       .attr("type","button")
       .attr("value","submit")
       .on("click",function(){
         cfg.style("display","none") //jQuery .hide()
         content.style("display","block") //jQuery .show()
         container.extendState({
           "configToggle":false,
           "config":config //TODO get config.state();
         })
       })

    //container.extendState({"config":config})

    /* render content */
    var brush = [] // instant states not store in container
    var update = state.regions || []
    layout.eventHub.on("brush", function(d) {
        brush = d
        if(!container.isHidden){
          div2.html("BRUSHING   " + regionsText(d))
        }

    })
    layout.eventHub.on("update", function(d) {
       update = d;
       container.extendState({"regions":update});
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
