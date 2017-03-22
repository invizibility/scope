function nearby(a,b) {
    if (a.chr!=b.chr) {return false}
    var l = Math.max(a.end,b.end) - Math.min(a.start,b.start)
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
export default function(regions) {
  return fixed(regions)
}
