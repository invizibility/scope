export default function () {
    var data = {}
    var chart = function (selection) {
            var table = selection.selectAll(".para-table").data([data])
            table.enter().append("table").classed("para-table",true)
            table.merge(table)
                .classed("table", true)
            table.selectAll("*").remove();
            var thead = table.append("thead")
            var tbody = table.append("tbody")
            var keys = Object.keys(data)
            var rows = tbody.selectAll("tr")
                .data(keys)
                .enter()
                .append("tr")
            rows.append("td").text(function(d){return d})
            rows.append("td").text(function(d){return data[d]})

        }
    chart.data = function (_) {
        return arguments.length ? (data = _, chart) : data;
    }
    return chart;
}
