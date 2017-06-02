package layout

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"

	observable "github.com/GianlucaGuarini/go-observable"
	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
	"github.com/pkg/errors"
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
	idx  int
	ch   chan map[string]interface{}
}

func NewApp(name string, app map[string]string) (*App, error) {
	port := 5050                                                        //TODO FIX
	indexPage := fmt.Sprintf("http://127.0.0.1:%d/v1/index.html", port) //TODO FIX
	var w *astilectron.Window
	ch := make(chan map[string]interface{})
	a, err := newApp(name)
	if err != nil {
		return nil, errors.Wrap(err, "create app")
	}
	m := a.NewMenu([]*astilectron.MenuItemOptions{
		{
			Label: astilectron.PtrStr("View"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Label: astilectron.PtrStr("DevTools"), Role: astilectron.MenuItemRoleToggleDevTools},
				{Label: astilectron.PtrStr("Minimize"), Role: astilectron.MenuItemRoleMinimize},
				{Label: astilectron.PtrStr("Close"), Role: astilectron.MenuItemRoleClose},
			},
		},
	})

	if w, err = a.NewWindow(indexPage, &astilectron.WindowOptions{
		Center: astilectron.PtrBool(true),
		Height: astilectron.PtrInt(618),
		Width:  astilectron.PtrInt(1000),
	}); err != nil {
		astilog.Fatal(errors.Wrap(err, "new window failed"))
	}
	if err = w.Create(); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating window failed"))
	}
	ws := make(map[int]*astilectron.Window)
	ws[-1] = w
	vars := make(map[int]map[string]string) //TODO
	//app := make(map[string]string)          //TODO
	idx := 1
	x := &App{a, m, w, ws, vars, app, idx, ch}
	x.addCode() //TODO
	//sm := []*astilectron.MenuItemOptions{}
	m.Create()
	var ni = m.NewItem(&astilectron.MenuItemOptions{
		Label: astilectron.PtrStr("Ext"),
		//SubMenu: sm,
		OnClick: func(e astilectron.Event) (deleteListener bool) {
			go x.NewWindow("external", 840, 500)
			x.idx++
			return false
		},
	})
	if err = m.Insert(0, ni); err != nil {
		//log.Println(err)
		panic(err)
		astilog.Fatal(errors.Wrap(err, "inserting menu item failed"))
	}
	log.Println(err)

	return x, nil
}
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
		for _, w1 := range x.ws {
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
}

func (app *App) Start() {
	app.a.Start()
}

func (app *App) Wait() {
	app.a.Wait()
}

func newApp(name string) (*astilectron.Astilectron, error) {
	var a *astilectron.Astilectron
	var err error
	if a, err = astilectron.New(astilectron.Options{
		AppName:           name,
		BaseDirectoryPath: os.Getenv("HOME") + "/lib",
	}); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating new astilectron failed"))
		return nil, errors.Wrap(err, "creating new astilectron failed")
	}
	a.HandleSignals()
	a.On(astilectron.EventNameAppClose, func(e astilectron.Event) (deleteListener bool) {
		a.Stop()
		return
	})
	// Start
	if err = a.Start(); err != nil {
		astilog.Fatal(errors.Wrap(err, "starting failed"))
	}

	return a, err
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

func (L *App) NewWindow(page string, width int, height int) {
	port := 5050 //TODO FIX
	var w1 *astilectron.Window
	var err error
	var id int
	id = L.idx
	o := observable.New()

	if w1, err = L.a.NewWindow(generateLinks(port, page, L.app), &astilectron.WindowOptions{
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
		delete(L.ws, id)
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
		L.ch <- dat
	})

	L.ws[id] = w1

}
