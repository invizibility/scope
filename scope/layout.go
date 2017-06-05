package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
	"github.com/pkg/errors"
)

type App struct {
	a        *astilectron.Astilectron
	m        *astilectron.Menu
	w        *astilectron.Window         //main windows
	ws       map[int]*astilectron.Window //external windows.
	vars     map[int]map[string]string
	app      map[string]string
	server   string
	index    string
	external string
}

func (e *App) Menu() *astilectron.Menu {
	return e.m
}

/*States : get layouts states for each window
 */
func (e *App) States() {

}

func RunApp(name string, f func(*astilectron.Astilectron)) {
	a, _ := NewApp(name)
	defer a.Close()
	f(a)
	a.Wait()
}
func NewApp(name string) (*astilectron.Astilectron, error) {
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

func AddCodeToWindow(w *astilectron.Window) {

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
