package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/nimezhu/snowjs"
	"github.com/nimezhu/stream"
	. "github.com/nimezhu/stream/bigwig"
	HiC "github.com/nimezhu/stream/hic"
	"github.com/urfave/cli"
)

/* CmdServe: serve bigwig data
 *     	     prototype serve one bigwig file now.
 */
func CmdServe(c *cli.Context) error {
	bwURI := c.String("B")
	log.Println(bwURI)
	hicURI := c.String("H")
	port := c.Int("port")
	router := mux.NewRouter()
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)
	reader, err := stream.NewSeekableStreamReader(bwURI)
	checkErr(err)
	/* TODO Multi Tracks */
	bwf := NewBbiReader(reader)
	bwf.InitIndex()
	log.Println("in reading idx")
	bw := NewBigWigReader(bwf)
	bwmap := make(map[string]*BigWigReader)
	bwmap["default"] = bw
	/* End of Test */
	AddBwsHandle(router, bwmap, "/bw")
	hicreader, err := stream.NewSeekableStreamReader(hicURI)
	hic, err := HiC.DataReader(hicreader)
	checkErr(err)
	prefix := "/hic"
	AddHicHandle(router, hic, prefix)

	log.Println("Listening...")
	log.Println("Please open http://127.0.0.1:" + strconv.Itoa(port))
	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(port), router))
	return nil
}
