package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
	"github.com/gorilla/mux"
	"github.com/nimezhu/snowjs"
	"github.com/pkg/errors"
	"github.com/urfave/cli"
)

func CmdApp(c *cli.Context) error {
	ch := make(chan map[string]interface{})
	port := c.Int("port")
	uri := c.String("input")
	router := mux.NewRouter()
	var a *astilectron.Astilectron
	var w *astilectron.Window
	var w1 *astilectron.Window
	var err error
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)
	var managers map[string]DataManager
	ext := path.Ext(uri)
	if ext == ".json" {
		managers = ReadJsonToManagers(uri, router)
	} else {
		managers = AddDataManagers(uri, router)
	}
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
				{Label: astilectron.PtrStr("Data Manager")},
				{Label: astilectron.PtrStr("Add External Window")},
				//{Label: astilectron.PtrStr("Add Window From Server")},
				{Label: astilectron.PtrStr("Quit"), Role: astilectron.MenuItemRoleClose},
				{Type: astilectron.MenuItemTypeSeparator},
				{Label: astilectron.PtrStr("About"), Role: astilectron.MenuItemRoleAbout},
			},
		}, {
			Label: astilectron.PtrStr("Config"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Label: astilectron.PtrStr("Load")},
				{Label: astilectron.PtrStr("Save")},
			},
		}, {
			Label: astilectron.PtrStr("Genome"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Checked: astilectron.PtrBool(true), Label: astilectron.PtrStr("Human - hg19"), Type: astilectron.MenuItemTypeRadio},
				{Label: astilectron.PtrStr("Mouse - mm10"), Type: astilectron.MenuItemTypeRadio},
			},
		},
		{
			Label: astilectron.PtrStr("View"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Label: astilectron.PtrStr("DevTools"), Role: astilectron.MenuItemRoleToggleDevTools},
				{Label: astilectron.PtrStr("Minimize"), Role: astilectron.MenuItemRoleMinimize},
				{Label: astilectron.PtrStr("Close"), Role: astilectron.MenuItemRoleClose},
			},
		},
	})

	mi0, _ := m.Item(0, 0)
	//mi2, _ := m.Item(0, 2)

	miLoadCfg, _ := m.Item(1, 0)
	miSaveCfg, _ := m.Item(1, 1)

	// Create the menu
	if err = m.Create(); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating app menu failed"))
		log.Fatal("wrong create menu")
	}
	fmt.Println("create menu err", err)

	miLoadCfg.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		//TODO Wait for astilectron update with dialog
		w.Send("loadCfg")
		return false
	})

	miSaveCfg.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		//TODO Wait for astilectron update with dialog
		w.Send("saveCfg")
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
	//manager := false

	mi0.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		if w0, ok := ws[0]; ok {
			w1 = w0
		} else {
			go func() {
				createNewWindow(a, port, 1000, 618, "dm", ws, 0, app, ch)
				w1 = ws[0]
				fmt.Println(w1)
				AddAsticodeToWindow(w1, managers)
			}()
		}
		return false
	})

	mi1, _ := m.Item(0, 1)
	mi1.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		wsVars[idx] = app
		go createNewWindow(a, port, 1000, 700, "external", ws, idx, app, ch)
		idx++
		return false
	})
	/*
		mi2.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
			species, _ := app["species"]
			genome, _ := app["genome"]
			server, _ := managers["server"].Get("main") //TODO.
			local := map[string]string{
				"species": species,
				"genome":  genome,
				"server":  server,
			}
			wsVars[idx] = local
			go createNewWindow(a, port, 1000, 700, "external", ws, idx, local, ch)
			idx++
			return false
		})
	*/
	if w, err = a.NewWindow(fmt.Sprintf("http://127.0.0.1:%d/v1/index.html", port), &astilectron.WindowOptions{
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
		//var vars map[string]string
		if err := json.Unmarshal([]byte(m), &dat); err != nil {
			panic(err)
		}
		//fmt.Println("message", dat["code"])
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
			log.Println("close ext")
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
			/* request state from Ext Windows */
			for k, w0 := range ws {
				if k != 0 { //skip data manager for now.
					w0.Send(string(codeGetState))
				}
			}

		}
		if dat["code"] == "createExt" {
			log.Println("createExt")
			go func(id int) {
				//var id int
				//id = idx
				if dat, ok := dat["vars"]; ok {
					//err := json.Unmarshal([]byte(v.(map[string]interface{})), &vars)
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
				log.Println("coding for set state", string(c))
				ws[id].Send(string(c))
			}(idx)
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

	sm := []*astilectron.MenuItemOptions{}
	for _, v := range managers["server"].List() {
		sm = append(sm, &astilectron.MenuItemOptions{
			Label: astilectron.PtrStr(v),
			OnClick: func(e astilectron.Event) (deleteListener bool) {
				server, _ := managers["server"].Get(v)
				species, _ := app["species"]
				genome, _ := app["genome"]
				local := map[string]string{
					"species": species,
					"genome":  genome,
					"server":  server,
				}
				wsVars[idx] = local
				go createNewWindow(a, port, 1000, 700, "external", ws, idx, local, ch)
				idx++
				return false
			},
		})
	}
	var ni = m.NewItem(&astilectron.MenuItemOptions{
		Label:   astilectron.PtrStr("Ext Server"),
		SubMenu: sm,
	})
	if err = m.Insert(3, ni); err != nil {
		astilog.Fatal(errors.Wrap(err, "inserting menu item failed"))
	}

	a.Wait()
	return nil
}
func closeAll(ws map[int]*astilectron.Window) {
	keys := []int{}
	for k, _ := range ws {
		keys = append(keys, k)
	}
	for i := 0; i < len(keys); i++ {
		go func(j int) {
			ws[keys[j]].Close()
		}(i)
	}
	return
}
func generateLinks(port int, name string, app map[string]string) string {
	url := fmt.Sprintf("http://127.0.0.1:%d/v1/%s.html?", port, name)
	for k, v := range app {
		url += k + "=" + v + "&"
	}
	url = strings.Trim(url, "?")
	url = strings.Trim(url, "&")
	fmt.Println("url", url)
	return url
}
func createNewWindow(a *astilectron.Astilectron, port int, width int, height int, page string, ws map[int]*astilectron.Window, idx int, app map[string]string, ch chan map[string]interface{}) {
	var w1 *astilectron.Window
	var err error
	var id int
	id = idx
	log.Println("create ", id)
	if w1, err = a.NewWindow(generateLinks(port, page, app), &astilectron.WindowOptions{
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
		astilog.Info("w1 Window resize")
		//w1.Send("w1 resize") // TODO
		log.Println("resize", id)
		return
	})
	w1.On(astilectron.EventNameWindowEventClosed, func(e astilectron.Event) (deleteListener bool) {
		log.Println("delete", id)
		delete(ws, id)
		return
	})

	w1.On(astilectron.EventNameWindowEventMessage, func(e astilectron.Event) bool {
		var m string
		//var m map[string]interface{}
		e.Message.Unmarshal(&m)
		astilog.Infof("Received message %s", m)
		var dat map[string]interface{}
		if err := json.Unmarshal([]byte(m), &dat); err != nil {
			panic(err)
		}
		if dat["code"] == "state" {
			dat["sender"] = id
			log.Println("sender id", id)
			ch <- dat
			//get ext state and return it through ch to w.
		}

		return false
	})
	//TODO id increase .
	ws[id] = w1
	time.Sleep(time.Second)

}
