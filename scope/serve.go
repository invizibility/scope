package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
	"github.com/gorilla/mux"
	"github.com/nimezhu/snowjs"

	"github.com/pkg/errors"
	"github.com/urfave/cli"

	"github.com/googollee/go-socket.io"
)

func serveBufferURI(uri string, router *mux.Router, prefix string) {
	//hicExt := strings.ToLower(path.Ext(uri))
	uriMap := LoadURI(uri)
	AddBuffersHandle(router, uriMap, prefix)
}

/* CmdServe: serve bigwigs and hic, and static html
 *
 */
func addData(c *cli.Context, router *mux.Router) (*BigWigManager, *HicManager, error) {
	entry := []string{}
	bwURI := c.String("B")
	var bwM *BigWigManager
	if bwURI != "" {
		//serveBwURI(bwURI, router, "/bw")
		bwM = NewBigWigManager(bwURI, router, "/bw")
		log.Println("bw manager", bwM)
		entry = append(entry, "bw")
	}
	/* TODO: multi hic files */
	hicURI := c.String("H")
	var hicM *HicManager
	if hicURI != "" {
		hicM = NewHicManager(hicURI, router, "/hic")
		entry = append(entry, "hic")
	}
	structURI := c.String("S")
	if structURI != "" {
		serveBufferURI(structURI, router, "/3d")
		entry = append(entry, "3d")
	}
	genomeURI := c.String("G")
	if genomeURI != "" {
		serveBufferURI(genomeURI, router, "/genome")
		entry = append(entry, "genome")
	}
	router.HandleFunc("/list", func(w http.ResponseWriter, r *http.Request) {
		e, _ := json.Marshal(entry)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Write(e)
	})
	return bwM, hicM, nil
}

func CmdServe(c *cli.Context) error {
	port := c.Int("port")
	router := mux.NewRouter()
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)
	addData(c, router)

	log.Println("Listening...")
	log.Println("Please open http://127.0.0.1:" + strconv.Itoa(port))
	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(port), router))
	return nil
}

func CmdHttp(c *cli.Context) error {
	port := c.Int("port")
	router := mux.NewRouter()
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)
	log.Println("Listening...")
	log.Println("Please open http://127.0.0.1:" + strconv.Itoa(port))
	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(port), router))
	return nil
}

func CmdApp(c *cli.Context) error {
	port := c.Int("port")
	router := mux.NewRouter()
	var a *astilectron.Astilectron
	var w *astilectron.Window
	var w1 *astilectron.Window
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)
	bwManager, hicManager, _ := addData(c, router) //TODO.
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
			w.Send(msg)
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
	if a, err = astilectron.New(astilectron.Options{BaseDirectoryPath: os.Getenv("HOME") + "/lib"}); err != nil {
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
			{
				Label: astilectron.PtrStr("Radio"),
				SubMenu: []*astilectron.MenuItemOptions{
					{Checked: astilectron.PtrBool(true), Label: astilectron.PtrStr("Radio 1"), Type: astilectron.MenuItemTypeRadio},
					{Label: astilectron.PtrStr("Radio 2"), Type: astilectron.MenuItemTypeRadio},
					{Label: astilectron.PtrStr("Radio 3"), Type: astilectron.MenuItemTypeRadio},
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

	mi0, _ := m.Item(0, 0)

	// Create the menu
	m.Create()

	//end menu
	// Create window
	// w1 := createNewWindow(a, port, 800, 600, "ucsc") //simple monitor 1
	ws := make(map[int]*astilectron.Window)
	idx := 1

	//manager := false

	mi0.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		if w0, ok := ws[0]; ok {
			w1 = w0
		} else {
			go func() {
				createNewWindow(a, port, 1100, 700, "manager", ws, 0)
				w1 = ws[0]
				fmt.Println(w1)
				w1.On(astilectron.EventNameWindowEventMessage, func(e astilectron.Event) (deleteListener bool) {
					var m string
					var dat map[string]interface{}
					e.Message.Unmarshal(&m)
					astilog.Infof("Received message %s", m)
					if err = json.Unmarshal([]byte(m), &dat); err != nil {
						panic(err)
					}
					if dat["code"] == "loadBw" {
						d, _ := dat["data"].(string)
						fmt.Println("window message : load bigwig ", d)
						a := strings.Split(d, "/")
						bwManager.AddURI(d, a[len(a)-1])
					}

					if dat["code"] == "loadHic" {
						d, _ := dat["data"].(string)
						fmt.Println("window message : load hic ", d)
						a := strings.Split(d, "/")
						hicManager.AddURI(d, a[len(a)-1])
					}
					return
				})
			}()
		}
		return false
	})

	mi1, _ := m.Item(0, 1)
	mi1.On(astilectron.EventNameMenuItemEventClicked, func(e astilectron.Event) bool {
		go createNewWindow(a, port, 1000, 700, "external", ws, idx)
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
		fmt.Println("m : ", m)
		astilog.Infof("Received message %s", m)
		var dat map[string]interface{}
		if err := json.Unmarshal([]byte(m), &dat); err != nil {
			panic(err)
		}
		if dat["code"] == "openExt" {
			go createNewWindow(a, port, 1000, 700, "external", ws, idx)
			idx++
			astilog.Infof("window %d", idx)
		}
		if dat["code"] == "brush" || dat["code"] == "update" {
			for _, w1 := range ws {
				w1.Send(m)
			}
		}
		return
	})
	/*()
	w.On(astilectron.EventNameWindowCmdClose, func(e astilectron.Event) (deleteListener bool) {
		for k, w0 := range ws {
			log.Println("close", k)
			w0.Close()
		}
		a.Stop() //TODO fix javascript error
		//a.Close()
		return

	})
	*/
	w.On(astilectron.EventNameWindowEventClosed, func(e astilectron.Event) (deleteListener bool) {
		log.Println("in close w")
		keys := []int{}
		for k, _ := range ws {
			log.Println("add ", k, " to close")
			keys = append(keys, k)
		}
		for i := 0; i < len(keys); i++ {
			go func(j int) {
				log.Println("close", keys[j])
				ws[keys[j]].Close()
			}(i)
		}
		//a.Stop() //TODO fix javascript error
		//a.Close()
		return
	})
	/*
		w.On(astilectron.EventNameWindowCmdDestroy, func(e astilectron.Event) (deleteListener bool) {
			log.Println("in destroy w")
			a.Stop() //TODO fix javascript error
			//a.Close()
			return
		})
	*/
	a.On(astilectron.EventNameAppCmdStop, func(e astilectron.Event) bool {
		log.Println("in stop app event")
		/*
			keys := []int{}
			for k, _ := range ws {
				log.Println("add ", k, " to close")
				keys = append(keys, k)
			}
			for i := 0; i < len(keys); i++ {
				log.Println("close", keys[i])
				go func() {
					ws[keys[i]].Close()
				}()
			}
		*/
		return false
	})
	a.Wait()
	return nil
}

func createNewWindow(a *astilectron.Astilectron, port int, width int, height int, page string, ws map[int]*astilectron.Window, idx int) {
	var w1 *astilectron.Window
	var err error
	id := idx
	if w1, err = a.NewWindow(fmt.Sprintf("http://127.0.0.1:%d/v1/%s.html", port, page), &astilectron.WindowOptions{
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
	fmt.Println("create", id)
	w1.On(astilectron.EventNameWindowEventResize, func(e astilectron.Event) (deleteListener bool) {
		astilog.Info("w1 Window resize")
		fmt.Println("wn resize", id)
		//w1.Send("w1 resize") // TODO
		return
	})
	w1.On(astilectron.EventNameWindowEventClosed, func(e astilectron.Event) (deleteListener bool) {
		astilog.Info("w1 Window close") //TODO?
		fmt.Println("wn close", id)
		delete(ws, id)
		return
	})
	ws[id] = w1

}
