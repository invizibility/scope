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

func readBw(uri string) *BigWigReader {
	reader, err := stream.NewSeekableStreamReader(uri)
	checkErr(err)
	bwf := NewBbiReader(reader)
	bwf.InitIndex()
	log.Println("in reading idx of", uri)
	bw := NewBigWigReader(bwf)
	return bw
}

func serveBwURI(uri string, router *mux.Router, prefix string) {
	uriMap := LoadURI(uri)
	bwmap := make(map[string]*BigWigReader)
	for k, v := range uriMap {
		bwmap[k] = readBw(v)
	}
	AddBwsHandle(router, bwmap, prefix)
}
func readHic(uri string) *HiC.HiC {
	reader, err := stream.NewSeekableStreamReader(uri)
	checkErr(err)
	hic, err := HiC.DataReader(reader)
	checkErr(err)
	return hic
}

func serveHicURI(uri string, router *mux.Router, prefix string) {
	//hicExt := strings.ToLower(path.Ext(uri))
	uriMap := LoadURI(uri)
	hicmap := make(map[string]*HiC.HiC)
	hicList := []string{}
	for k, v := range uriMap {
		hicmap[k] = readHic(v)
	}
	if _, ok := hicmap["default"]; ok {
		//has default
	} else {
		hicmap["default"] = hicmap[hicList[0]]
	}
	AddHicsHandle(router, hicmap, prefix)
}

func serveStructURI(uri string, router *mux.Router, prefix string) {
	//hicExt := strings.ToLower(path.Ext(uri))
	uriMap := LoadURI(uri)
	AddBuffersHandle(router, uriMap, prefix)
}

/* CmdServe: serve bigwigs and hic, and static html
 *
 */
func CmdServe(c *cli.Context) error {
	port := c.Int("port")
	router := mux.NewRouter()
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)

	bwURI := c.String("B")
	if bwURI != "" {
		serveBwURI(bwURI, router, "/bw")
	}
	/* TODO: multi hic files */
	hicURI := c.String("H")
	//hicreader, err := stream.NewSeekableStreamReader(hicURI)
	//hic, err := HiC.DataReader(hicreader)
	if hicURI != "" {
		serveHicURI(hicURI, router, "/hic")

	}
	structURI := c.String("S")
	if structURI != "" {
		serveStructURI(structURI, router, "/3d")
	}

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
