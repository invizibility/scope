function parseRegion(s){
  var a = s.split(":")
  if (a.length==1) {
    return {
      "chr": a[0],
      "start": 0,
      "end" : undefined
    }

  }
  var x = a[1].split("-")
  return {
      "chr": a[0],
      "start": +x[0],
      "end": +x[1]
  }
}
export default function(s) {
  var a = s.split(",")
  var r =[]
  a.forEach(function(d){
    r.push(parseRegion(d))
  })
  return r
}
