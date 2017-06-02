package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
	"github.com/gorilla/mux"
	"github.com/nimezhu/scope/data"
	"github.com/nimezhu/snowjs"
	"github.com/pkg/errors"
	"github.com/urfave/cli"
)

func CmdData(c *cli.Context) error { //serve Data Manager.
	//ch := make(chan map[string]interface{})
	port := c.Int("port")
	router := mux.NewRouter()
	//snowjs.AddHandlers(router, "")
	//AddStaticHandle(router)
	//TODO host this.
	uri := c.String("input")
	data.Load(uri, router)
	log.Print("start data manager")
	log.Println("Listening...")
	log.Println("Please open http://127.0.0.1:" + strconv.Itoa(port))
	http.ListenAndServe(":"+strconv.Itoa(port), router)
	return nil
}
func CmdDM(c *cli.Context) error {
	port := c.Int("port")
	router := mux.NewRouter()
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)

	//TODO host this.
	uri := c.String("input")
	dbmap := data.Load(uri, router)

	go http.ListenAndServe(":"+strconv.Itoa(port), router)

	/* Create App TODO: wrap into function*/
	//var a *astilectron.Astilectron
	var err error
	var w *astilectron.Window
	a, _ := NewApp("Scope Data Manager")
	defer a.Close()

	if w, err = a.NewWindow(fmt.Sprintf("http://127.0.0.1:%d/v1/dm.html", port), &astilectron.WindowOptions{
		Center: astilectron.PtrBool(true),
		Height: astilectron.PtrInt(618),
		Width:  astilectron.PtrInt(1000),
	}); err != nil {
		astilog.Fatal(errors.Wrap(err, "new window failed"))
	}
	if err = w.Create(); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating window failed"))
	}
	w.On(astilectron.EventNameWindowEventClosed, func(e astilectron.Event) (deleteListener bool) {
		a.Stop() //TODO fix javascript error
		//a.Close()
		return
	})
	data.AddAsticodeToWindow(w, dbmap)

	a.Wait()
	return nil
}
