package main

import (
	"encoding/json"
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
	hicMap := make(map[string]*HiC.HiC)
	hicList := []string{}
	for k, v := range uriMap {
		log.Println("key", k, "URI", v)
		hicMap[k] = readHic(v)
		hicList = append(hicList, k)
	}

	if _, ok := hicMap["default"]; ok {
		//has default
	} else {
		hicMap["default"] = hicMap[hicList[0]]
	}
	AddHicsHandle(router, hicMap, prefix)
}

func serveBufferURI(uri string, router *mux.Router, prefix string) {
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
	entry := []string{}

	bwURI := c.String("B")
	if bwURI != "" {
		serveBwURI(bwURI, router, "/bw")
		entry = append(entry, "bw")
	}
	/* TODO: multi hic files */
	hicURI := c.String("H")
	//hicreader, err := stream.NewSeekableStreamReader(hicURI)
	//hic, err := HiC.DataReader(hicreader)
	if hicURI != "" {
		serveHicURI(hicURI, router, "/hic")
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
