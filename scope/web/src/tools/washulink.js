import regionText from "./regionText"

export default function(db,position) {
  return "http://epigenomegateway.wustl.edu/browser/?genome="+db+"&coordinate="+regionText(position)
}
