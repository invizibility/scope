package layout

import (
	"encoding/json"
	"log"
	"os"

	observable "github.com/GianlucaGuarini/go-observable"
	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
	"github.com/pkg/errors"
)

/* NewWindow: create new window for application
 * astilectron code : state , send to application chan.
 */
func (x *App) assignId() int {
	i := 100
	for _, ok := x.ws[i]; ok; i++ {
		_, ok = x.ws[i+1]
	}
	//fmt.Println("create", i)
	return i
}
func (x *App) NewWindow(page string, width int, height int, vars map[string]string, id int) *astilectron.Window {
	port := 5050 //TODO FIX
	var w1 *astilectron.Window
	var err error
	//var id int
	//id = x.idx
	if id < 0 {
		id = x.assignId()
	}
	o := observable.New()

	if w1, err = x.a.NewWindow(generateLinks(port, page, vars), &astilectron.WindowOptions{ //TODO change x.app
		Center: astilectron.PtrBool(true),
		Icon:   astilectron.PtrStr(os.Getenv("GOPATH") + "/src/github.com/asticode/go-astilectron/examples/6.icons/gopher.png"),
		Height: astilectron.PtrInt(height),
		Width:  astilectron.PtrInt(width),
	}); err != nil {
		astilog.Fatal(errors.Wrap(err, "new window failed"))
	}
	if err := w1.Create(); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating window failed"))
	}
	w1.On(astilectron.EventNameWindowEventResize, func(e astilectron.Event) (deleteListener bool) {
		//w1.Send("resize")
		log.Println("resize", id)
		return
	})
	w1.On(astilectron.EventNameWindowEventClosed, func(e astilectron.Event) (deleteListener bool) {
		log.Println("delete", id)
		//w1.Send("delete")
		delete(x.ws, id)
		log.Println("deleted", id)
		for i, _ := range x.ws {
			log.Println("left", i)
		}
		return
	})

	w1.On(astilectron.EventNameWindowEventMessage, func(e astilectron.Event) bool {
		var m string
		//var m map[string]interface{}
		e.Message.Unmarshal(&m)
		var dat map[string]interface{}
		if err := json.Unmarshal([]byte(m), &dat); err != nil {
			panic(err)
		}
		o.Trigger(dat["code"].(string), dat)
		return false
	})

	o.On("state", func(dat map[string]interface{}) {
		dat["sender"] = id
		x.ch <- dat
	})

	x.ws[id] = w1
	return w1
}
