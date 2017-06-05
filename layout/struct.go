package layout

import (
	"encoding/json"

	astilectron "github.com/asticode/go-astilectron"
)

var v = map[string]string{"code": "getState", "data": ""}
var codeGetState, _ = json.Marshal(v)

type App struct {
	a    *astilectron.Astilectron
	m    *astilectron.Menu
	w    *astilectron.Window         //main windows
	ws   map[int]*astilectron.Window //external windows.
	vars map[int]map[string]string
	app  map[string]string
	//idx  int
	ch chan map[string]interface{}
}
