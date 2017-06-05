package layout

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"

	observable "github.com/GianlucaGuarini/go-observable"
	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
)

/*  add astilectron code
 *  - getStates
 *  - readFile
 *  - brush and update
 *  - openExt, closeExt, createExt.
 *  TODO:
 *    app
 *    vars
 *  TODO:
 *    add customized message.
 */
func (x *App) addCode() {
	o := observable.New()
	x.w.On(astilectron.EventNameWindowEventMessage, func(e astilectron.Event) (deleteListener bool) {
		var m string
		//var m map[string]interface{}
		e.Message.Unmarshal(&m)
		log.Printf("Received message %s\n", m)
		var dat map[string]interface{}
		//var vars map[string]string
		if err := json.Unmarshal([]byte(m), &dat); err != nil {
			panic(err)
		}
		//Layout Messages.

		o.Trigger(dat["code"].(string), dat)
		return false
	})
	o.On("getStates", func(dat map[string]interface{}) {
		go func() {
			m := make(map[int]string)
			for k, _ := range x.ws {
				if k > 0 { //skip data manager window
					a := <-x.ch
					fmt.Println("get id", a["sender"])
					d, _ := a["data"].(string)
					id, _ := a["sender"].(int)
					m[id] = d
				}
			}
			c, _ := json.Marshal(m)
			c2, _ := json.Marshal(x.vars)
			ms := map[string]string{
				"states": string(c),
				"vars":   string(c2),
			}
			msg, err := json.Marshal(ms)
			if err == nil {
				x.w.Send("states " + string(msg)) //return ext states to main window
			} else {
				x.w.Send("error codingExtStates")
			}
		}()
		/* request state from Ext Windows */
		for k, w0 := range x.ws {
			if k != 0 { //skip data manager for now.
				w0.Send(string(codeGetState))
			}
		}
	})

	//Customized Code Message.
	o.On("readFile", func(dat map[string]interface{}) {
		content, err := ioutil.ReadFile(dat["data"].(string))
		if err == nil {
			s := "file " + string(content)
			log.Println(s)
			x.w.Send(s)
		} else {
			x.w.Send("file null")
		}
	})

	o.On("brush", func(dat map[string]interface{}) {
		m, _ := json.Marshal(dat)
		for i, w1 := range x.ws {
			if i == -1 {
				continue
			}
			log.Println("brush to ext", string(m))
			w1.Send(string(m))
		}
	})
	o.On("update", func(dat map[string]interface{}) {
		m, _ := json.Marshal(dat)
		for _, w1 := range x.ws {
			w1.Send(string(m))
		}
	})

	/** TODO  Ext **/
	o.On("openExt", func(dat map[string]interface{}) {
		fmt.Println("openExt", dat)
		//app := make(map[string]string)
		for k, v := range dat["data"].(map[string]interface{}) {
			x.app[k] = v.(string)
		}
		//go createNewWindow(a, port, 1000, 618, "external", ws, idx, app, ch)
		go x.NewWindow("external", 1000, 618, x.app)
		x.idx++
		astilog.Infof("window %d", x.idx)
	})

	o.On("closeExt", func(dat map[string]interface{}) {
		log.Println("close ext")
		closeAll(x.ws)
		x.idx = 1
	})

	o.On("createExt", func(dat map[string]interface{}) {
		log.Println("createExt")
		go func() {
			var w0 *astilectron.Window
			if dat, ok := dat["vars"]; ok {
				//err := json.Unmarshal([]byte(v.(map[string]interface{})), &vars)
				vars := make(map[string]string)
				for k, v := range dat.(map[string]interface{}) {
					vars[k] = v.(string)
				}
				//TODO vars createNewWindow(a, port, 1000, 618, "external", ws, id, vars, ch)
				w0 = x.NewWindow("external", 1000, 618, vars)
			} else {
				//TODO createNewWindow(a, port, 1000, 618, "external", ws, id, app, ch)
				w0 = x.NewWindow("external", 1000, 618, x.app)
			}
			v := map[string]string{
				"code": "setState",
				"data": dat["data"].(string),
			}
			c, _ := json.Marshal(v)
			log.Println("coding for set state", string(c))
			w0.Send(string(c))
		}()
	})
}
