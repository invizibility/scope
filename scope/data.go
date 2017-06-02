package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
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
	var a *astilectron.Astilectron
	var err error
	var w *astilectron.Window
	if a, err = astilectron.New(astilectron.Options{
		AppName:           "Scope",
		BaseDirectoryPath: os.Getenv("HOME") + "/lib",
	}); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating new astilectron failed"))
	}
	defer a.Close()
	a.HandleSignals()
	a.On(astilectron.EventNameAppClose, func(e astilectron.Event) (deleteListener bool) {
		a.Stop()
		return
	})
	if err = a.Start(); err != nil {
		astilog.Fatal(errors.Wrap(err, "starting failed"))
	}
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

	a.On(astilectron.EventNameAppCmdStop, func(e astilectron.Event) bool {
		return false
	})
	a.Wait()
	return nil
}
