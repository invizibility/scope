package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	observable "github.com/GianlucaGuarini/go-observable"
	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
	"github.com/gorilla/mux"
	"github.com/nimezhu/snowjs"
	"github.com/pkg/errors"
	"github.com/urfave/cli"
)

func CmdConnect(c *cli.Context) error {
	ch := make(chan map[string]interface{})
	port := c.Int("port")
	uri := c.String("input") //uri is server uri.
	router := mux.NewRouter()
	//var a *astilectron.Astilectron
	var w *astilectron.Window
	//var w1 *astilectron.Window
	var err error
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)

	/* add Socket */
	chatroom := "scope"

	log.Println("Listening...")
	go http.ListenAndServe(":"+strconv.Itoa(port), router)
	log.Println("Please open http://127.0.0.1:" + strconv.Itoa(port))
	// Create astilectron
	log.Print("start app")
	//var err error

	//a.SetProvisioner(astilectron.NewDisembedderProvisioner(Asset, "vendor/astilectron-v0.1.0.zip", "vendor/electron-v1.6.5.zip"))
	a, _ := newApp("Scope")
	defer a.Close()

	// menu
	// Init a new app menu
	// You can do the same thing with a window
	var m = scopeMenu(a)

	//mi0, _ := m.Item(0, 0)

	miLoadCfg, _ := m.Item(1, 0)
	miSaveCfg, _ := m.Item(1, 1)

	// Create the menu
	m.Create()

	miLoadCfg.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		//TODO Wait for astilectron update with dialog
		return false
	})

	miSaveCfg.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		//TODO Wait for astilectron update with dialog
		return false
	})
	//end menu
	// Create window
	// w1 := createNewWindow(a, port, 800, 600, "ucsc") //simple monitor 1
	ws := make(map[int]*astilectron.Window)
	wsVars := make(map[int]map[string]string)
	idx := 1
	app := make(map[string]string)

	//TODO Handle Multi Genomes;
	//　TODO get app genome in server genome version controller
	m11, _ := m.Item(2, 1)
	m11.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		if app["genome"] != "mm10" || app["species"] != "mouse" {
			app["genome"] = "mm10"
			app["species"] = "mouse"
			w.Send("app mouse mm10")
			closeAll(ws)
		}
		return false
	})
	m10, _ := m.Item(2, 0)
	m10.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		if app["genome"] != "hg19" || app["species"] != "human" {
			app["genome"] = "hg19"
			app["species"] = "human"
			w.Send("app human hg19")
			closeAll(ws)
		}
		return false
	})

	//manager := false
	app = map[string]string{
		"server":  uri,
		"species": "human", //TODO
		"genome":  "hg19",  //TODO
	}

	mi1, _ := m.Item(0, 0)
	mi1.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		id := assignId(ws)
		go createNewWindow(a, port, 1000, 700, "external", ws, id, app, ch)
		idx++
		return false

	})
	u := generateLinks(port, "index", app)
	if w, err = a.NewWindow(u, &astilectron.WindowOptions{
		Center: astilectron.PtrBool(true),
		Height: astilectron.PtrInt(618),
		Width:  astilectron.PtrInt(1000),
	}); err != nil {
		astilog.Fatal(errors.Wrap(err, "new window failed"))
	}
	if err = w.Create(); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating window failed"))
	}

	AddSocket(chatroom, router, w)
	w.On(astilectron.EventNameWindowEventResize, func(e astilectron.Event) (deleteListener bool) {
		astilog.Info("Window resized")
		w.Send("resize")
		return
	})

	/** START OF CODES */
	o := observable.New()
	w.On(astilectron.EventNameWindowEventMessage, func(e astilectron.Event) (deleteListener bool) {
		var m string
		//var m map[string]interface{}
		e.Message.Unmarshal(&m)
		astilog.Infof("Received message %s", m)
		var dat map[string]interface{}
		//var vars map[string]string
		if err := json.Unmarshal([]byte(m), &dat); err != nil {
			panic(err)
		}
		o.Trigger(dat["code"].(string), dat)
		//fmt.Println("message", dat["code"])

		return
	})
	o.On("app", func(dat map[string]interface{}) {
		for k, v := range dat["data"].(map[string]interface{}) {
			app[k] = v.(string)
		}
	})
	o.On("getStates", func(dat map[string]interface{}) {
		go func() {
			m := make(map[int]string)
			for k, _ := range ws {
				if k != 0 { //skip data manager window
					a := <-ch
					fmt.Println("get id", a["sender"])
					d, _ := a["data"].(string)
					id, _ := a["sender"].(int)
					m[id] = d
				}
			}
			c, _ := json.Marshal(m)
			c2, _ := json.Marshal(wsVars)
			ms := map[string]string{
				"states": string(c),
				"vars":   string(c2),
			}
			msg, err := json.Marshal(ms)
			if err == nil {
				w.Send("states " + string(msg)) //return ext states to main window
			} else {
				w.Send("error codingExtStates")
			}
		}()
		for k, w0 := range ws {
			if k != 0 { //skip data manager for now.
				w0.Send(string(codeGetState))
			}
		}
	})

	o.On("readFile", func(dat map[string]interface{}) {
		content, err := ioutil.ReadFile(dat["data"].(string))
		if err == nil {
			s := "file " + string(content)
			log.Println(s)
			w.Send(s)
		} else {
			w.Send("file null")
		}
	})

	o.On("brush", func(dat map[string]interface{}) {
		m, _ := json.Marshal(dat)
		for _, w1 := range ws {
			w1.Send(string(m))
		}
	})
	o.On("update", func(dat map[string]interface{}) {
		m, _ := json.Marshal(dat)
		for _, w1 := range ws {
			w1.Send(string(m))
		}
	})

	/** TODO  Ext **/
	o.On("openExt", func(dat map[string]interface{}) {
		fmt.Println("openExt", dat)
		for k, v := range dat["data"].(map[string]interface{}) {
			app[k] = v.(string)
		}
		id := assignId(ws)
		go createNewWindow(a, port, 1000, 618, "external", ws, id, app, ch)
		idx++
		astilog.Infof("window %d", idx)
	})

	o.On("closeExt", func(dat map[string]interface{}) {
		log.Println("close ext")
		closeAll(ws)
		idx = 1
	})

	o.On("createExt", func(dat map[string]interface{}) {
		log.Println("createExt")
		ida := assignId(ws)
		go func(id int) {
			if dat, ok := dat["vars"]; ok {
				vars := make(map[string]string)
				for k, v := range dat.(map[string]interface{}) {
					vars[k] = v.(string)
				}
				createNewWindow(a, port, 1000, 618, "external", ws, id, vars, ch)
			} else {
				createNewWindow(a, port, 1000, 618, "external", ws, id, app, ch)
			}
			v := map[string]string{
				"code": "setState",
				"data": dat["data"].(string),
			}
			c, _ := json.Marshal(v)
			ws[id].Send(string(c))
		}(ida)
		idx++
	})
	/*  END OF CODES */

	w.On(astilectron.EventNameWindowEventClosed, func(e astilectron.Event) (deleteListener bool) {
		closeAll(ws)
		return
	})

	a.On(astilectron.EventNameAppCmdStop, func(e astilectron.Event) bool {
		return false
	})
	/* FIX BUG */
	var ni = m.NewItem(&astilectron.MenuItemOptions{
		Label:   astilectron.PtrStr("Add"),
		SubMenu: []*astilectron.MenuItemOptions{},
	})
	if err = m.Insert(1, ni); err != nil {
		astilog.Fatal(errors.Wrap(err, "inserting menu item failed"))
	}
	a.Wait()
	return nil
}
