export default function (context, scale, x, y, height, label) {
    context.save()
    context.translate(x,y)
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
    context.fillStyle = "black"
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

}
