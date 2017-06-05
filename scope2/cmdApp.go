package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/nimezhu/scope/data"
	"github.com/nimezhu/scope/layout"
	"github.com/nimezhu/snowjs"

	"github.com/urfave/cli"
)

func CmdApp(c *cli.Context) error {
	router := mux.NewRouter()
	port := c.Int("port")
	uri := c.String("input")
	/* add Socket */
	chatroom := "scope"
	//managers := data.Load(uri, router)
	data.Load(uri, router)
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)
	log.Println("Listening...")
	go http.ListenAndServe(":"+strconv.Itoa(port), router)
	log.Println("Please open http://127.0.0.1:" + strconv.Itoa(port))
	vars := make(map[string]string)
	app, _ := layout.NewApp("scope2", vars)
	AddSocket(chatroom, router, app.Window())
	app.Start()

	a := app.App()
	a.Wait()
	return nil
}
