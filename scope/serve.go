package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/nimezhu/scope/data"
	"github.com/nimezhu/snowjs"

	"github.com/urfave/cli"
)

/* CmdServe: serve bigwigs and hic, and static html
 *
 */
func CmdServe(c *cli.Context) error {
	port := c.Int("port")
	router := mux.NewRouter()
	uri := c.String("input")
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)
	data.Load(uri, router)
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
