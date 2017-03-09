export default function (el) {
    var panel = el.append("div").classed("panel", true)
    var head = panel.append("div").classed("panel-heading", true)
    var body = panel.append("div").classed("panel-body", true)
    return {
        "panel": panel,
        "head": head,
        "body": body
    }
}
