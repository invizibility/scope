export function totalLength(regions) {
    var l = 0;
    regions.forEach(function (r, i) {
        l += (+r.end) - (+r.start)
    })
    return l
}
export function regionString(o) {
    return o.chr + ":" + o.start + "-" + o.end
}


export function overlap(a, b) {
    var chrA = a.chr.replace("chr","").replace("Chr","")
    var chrB = b.chr.replace("chr","").replace("Chr","")
    if (chrA != chrB) {
        return false
    }
    if (b.end < a.start) {
        return false
    }
    if (a.end < b.start) {
        return false
    }
    return true
}
/*
export function default_range(length) {
    return Math.round(length * 2 / 10) + "-" + Math.round(length * 3 / 10)
}
*/
