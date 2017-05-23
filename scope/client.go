package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"

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
	var a *astilectron.Astilectron
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
	if a, err = astilectron.New(astilectron.Options{
		AppName:           "Scope",
		BaseDirectoryPath: os.Getenv("HOME") + "/lib",
	}); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating new astilectron failed"))
	}
	//a.SetProvisioner(astilectron.NewDisembedderProvisioner(Asset, "vendor/astilectron-v0.1.0.zip", "vendor/electron-v1.6.5.zip"))
	defer a.Close()
	a.HandleSignals()
	a.On(astilectron.EventNameAppClose, func(e astilectron.Event) (deleteListener bool) {
		a.Stop()
		return
	})

	// Start
	if err = a.Start(); err != nil {
		astilog.Fatal(errors.Wrap(err, "starting failed"))
	}

	// menu
	// Init a new app menu
	// You can do the same thing with a window
	var m = a.NewMenu([]*astilectron.MenuItemOptions{
		{
			Label: astilectron.PtrStr("Admin"),
			SubMenu: []*astilectron.MenuItemOptions{
				//{Label: astilectron.PtrStr("Data Manager")},
				{Label: astilectron.PtrStr("Add External Window")},
				{Label: astilectron.PtrStr("Quit"), Role: astilectron.MenuItemRoleClose},
				{Type: astilectron.MenuItemTypeSeparator},
				{Label: astilectron.PtrStr("About"), Role: astilectron.MenuItemRoleAbout},
			},
		},

		{
			Label: astilectron.PtrStr("Config"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Label: astilectron.PtrStr("Load")},
				{Label: astilectron.PtrStr("Save")},
			},
		},
		/*
			{
				Label: astilectron.PtrStr("Genome"),
				SubMenu: []*astilectron.MenuItemOptions{
					{Checked: astilectron.PtrBool(true), Label: astilectron.PtrStr("Human - hg19"), Type: astilectron.MenuItemTypeRadio},
					{Label: astilectron.PtrStr("Mouse - mm10"), Type: astilectron.MenuItemTypeRadio},
				},
			},
		*/
		{
			Label: astilectron.PtrStr("View"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Label: astilectron.PtrStr("DevTools"), Role: astilectron.MenuItemRoleToggleDevTools},
				{Label: astilectron.PtrStr("Minimize"), Role: astilectron.MenuItemRoleMinimize},
				{Label: astilectron.PtrStr("Close"), Role: astilectron.MenuItemRoleClose},
			},
		},
	})

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
	idx := 1
	app := make(map[string]string)

	//TODO Handle Multi Genomes;
	/*　TODO get app genome in server
	m11, _ := m.Item(1, 1)
	m11.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		if app["genome"] != "mm10" || app["species"] != "mouse" {
			app["genome"] = "mm10"
			app["species"] = "mouse"
			w.Send("app mouse mm10")
			closeAll(ws)
		}
		return false
	})
	m10, _ := m.Item(1, 0)
	m10.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		if app["genome"] != "hg19" || app["species"] != "human" {
			app["genome"] = "hg19"
			app["species"] = "human"
			w.Send("app human hg19")
			closeAll(ws)
		}
		return false
	})
	*/
	//manager := false
	app = map[string]string{
		"server":  uri,
		"species": "human", //TODO
		"genome":  "hg19",  //TODO
	}

	mi1, _ := m.Item(0, 0)
	mi1.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		go createNewWindow(a, port, 1000, 700, "external", ws, idx, app, ch)
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

	w.On(astilectron.EventNameWindowEventMessage, func(e astilectron.Event) (deleteListener bool) {
		var m string
		//var m map[string]interface{}
		e.Message.Unmarshal(&m)
		astilog.Infof("Received message %s", m)
		var dat map[string]interface{}
		if err := json.Unmarshal([]byte(m), &dat); err != nil {
			panic(err)
		}
		//fmt.Println("message", dat)
		if dat["code"] == "app" {
			for k, v := range dat["data"].(map[string]interface{}) {
				app[k] = v.(string)
			}
		}
		if dat["code"] == "openExt" {
			fmt.Println("openExt", dat)
			//app := make(map[string]string)
			for k, v := range dat["data"].(map[string]interface{}) {
				app[k] = v.(string)
			}
			go createNewWindow(a, port, 1000, 618, "external", ws, idx, app, ch)
			idx++
			astilog.Infof("window %d", idx)
		}
		if dat["code"] == "closeExt" {
			closeAll(ws)
			idx = 1
		}
		if dat["code"] == "brush" || dat["code"] == "update" {
			for _, w1 := range ws {
				w1.Send(m)
			}
		}
		if dat["code"] == "readFile" {
			content, err := ioutil.ReadFile(dat["data"].(string))
			if err == nil {
				s := "file " + string(content)
				w.Send(s)
			} else {
				w.Send("file null")
			}
		}
		//get states from extWindws.
		if dat["code"] == "getStates" {
			/* init channel for gather states*/
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
				c, err := json.Marshal(m)
				if err == nil {
					w.Send("states " + string(c)) //return ext states to main window
				} else {
					w.Send("error codingExtStates")
				}
			}()
			/* request state from Ext Windows */
			for k, w0 := range ws {
				if k != 0 { //skip data manager for now.
					w0.Send(string(codeGetState))
				}
			}

		}
		if dat["code"] == "createExt" {
			go func() {
				var id int
				id = idx
				createNewWindow(a, port, 1000, 618, "external", ws, id, app, ch)
				v := map[string]string{
					"code": "setState",
					"data": dat["data"].(string),
				}
				c, _ := json.Marshal(v)
				log.Println("coding for set state", string(c))
				ws[id].Send(string(c))
			}()
			idx++
		}
		return
	})

	w.On(astilectron.EventNameWindowEventClosed, func(e astilectron.Event) (deleteListener bool) {
		closeAll(ws)
		return
	})

	a.On(astilectron.EventNameAppCmdStop, func(e astilectron.Event) bool {
		return false
	})
	a.Wait()
	return nil
}
