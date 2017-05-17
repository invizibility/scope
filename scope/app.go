package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
	"github.com/googollee/go-socket.io"
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
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)
	//bwManager, hicManager, _ := addData(c, router) //TODO manage data managers.
	managers := AddDataManagers(uri, router)
	//bwManager := managers["/bw"]
	//hicManager := managers["/hic"]
	/* add Socket */
	chatroom := "scope"
	server, err := socketio.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}
	server.On("connection", func(so socketio.Socket) {
		log.Println("on connection")
		so.Join(chatroom)
		so.On("data", func(msg string) {
			//data := msg
			//so.BroadcastTo(chatroom, "data", len(data))
			w.Send("data " + msg)
		})
		so.On("callback", func(msg string) string {
			return msg
		})
		so.On("disconnection", func() {
			log.Println("on disconnect")
		})
	})
	server.On("error", func(so socketio.Socket, err error) {
		log.Println("error:", err)
	})

	router.HandleFunc("/socket.io/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*:*")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		server.ServeHTTP(w, r)
	})

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
				{Label: astilectron.PtrStr("Quit"), Role: astilectron.MenuItemRoleClose},
				{Type: astilectron.MenuItemTypeSeparator},
				{Label: astilectron.PtrStr("About"), Role: astilectron.MenuItemRoleAbout},
			},
		},
		/*
			{
				Label: astilectron.PtrStr("Checkbox"),
				SubMenu: []*astilectron.MenuItemOptions{
					{Checked: astilectron.PtrBool(true), Label: astilectron.PtrStr("Checkbox 1"), Type: astilectron.MenuItemTypeCheckbox},
					{Label: astilectron.PtrStr("Checkbox 2"), Type: astilectron.MenuItemTypeCheckbox},
					{Label: astilectron.PtrStr("Checkbox 3"), Type: astilectron.MenuItemTypeCheckbox},
				},
			},
		*/
		{
			Label: astilectron.PtrStr("Config"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Label: astilectron.PtrStr("Load")},
				{Label: astilectron.PtrStr("Save")},
			},
		},
		{
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
		go createNewWindow(a, port, 1000, 700, "external", ws, idx, app, ch)
		idx++
		return false
	})
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
		/*
			keys := []int{}
			for k, _ := range ws {
				keys = append(keys, k)
			}
			for i := 0; i < len(keys); i++ {
				go func(j int) {
					ws[keys[j]].Close()
				}(i)
			}
		*/
		closeAll(ws)
		//a.Stop() //TODO fix javascript error
		//a.Close()
		return
	})

	a.On(astilectron.EventNameAppCmdStop, func(e astilectron.Event) bool {
		return false
	})
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
		//log.Println("wn get message", dat)
		//fmt.Println("wn get message", dat)
		if dat["code"] == "state" {
			dat["sender"] = id
			log.Println("sender id", id)
			ch <- dat
			//get ext state and return it through ch to w.
		}
		/*
			if dat["code"] == "setState" {
				log.Println("set state TODO")
			}
		*/
		return false
	})

	ws[id] = w1

}
