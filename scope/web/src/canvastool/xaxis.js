export default function(ctx,scale,x,y,height,label) {
  ctx.save()
  ctx.translate(x+height,y)
  ctx.rotate(Math.PI/2)
  S.canvasToolYAxis(ctx,scale,0,0,height,label)
  ctx.restore()
}
