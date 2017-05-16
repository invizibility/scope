package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
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
	AddDataManagers(uri, router)
	// Create astilectron

	log.Print("start data manager")
	//var err error
	log.Println("Listening...")
	http.ListenAndServe(":"+strconv.Itoa(port), router)
	log.Println("Please open http://127.0.0.1:" + strconv.Itoa(port))
	return nil
}
