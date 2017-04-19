import regionText from "./regionText"

export default function(org,db,position,width) {
  return "http://genome.ucsc.edu/cgi-bin/hgTracks?org="+org+"&db="+db+"&position="+regionText(position)+"&pix="+width
}
