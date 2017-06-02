package main

import "encoding/json"

var v = map[string]string{"code": "getState", "data": ""}
var codeGetState, _ = json.Marshal(v)
