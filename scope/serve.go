package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
	"github.com/gorilla/mux"
	"github.com/nimezhu/snowjs"
	"github.com/nimezhu/stream"
	. "github.com/nimezhu/stream/bigwig"
	HiC "github.com/nimezhu/stream/hic"
	"github.com/pkg/errors"
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
func addData(c *cli.Context, router *mux.Router) error {
	entry := []string{}
	bwURI := c.String("B")
	if bwURI != "" {
		serveBwURI(bwURI, router, "/bw")
		entry = append(entry, "bw")
	}
	/* TODO: multi hic files */
	hicURI := c.String("H")
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
	return nil
}

func CmdServe(c *cli.Context) error {
	port := c.Int("port")
	router := mux.NewRouter()
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)
	addData(c, router)

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

func CmdApp(c *cli.Context) error {
	port := c.Int("port")
	router := mux.NewRouter()
	snowjs.AddHandlers(router, "")
	AddStaticHandle(router)
	addData(c, router)
	log.Println("Listening...")
	go http.ListenAndServe(":"+strconv.Itoa(port), router)
	log.Println("Please open http://127.0.0.1:" + strconv.Itoa(port))
	// Create astilectron
	log.Print("start app")
	var a *astilectron.Astilectron
	var err error
	if a, err = astilectron.New(astilectron.Options{BaseDirectoryPath: os.Getenv("HOME") + "/lib"}); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating new astilectron failed"))
	}
	defer a.Close()
	a.HandleSignals()
	a.On(astilectron.EventNameAppStop, func(e astilectron.Event) (deleteListener bool) {
		a.Stop()
		return
	})

	// Start
	if err = a.Start(); err != nil {
		astilog.Fatal(errors.Wrap(err, "starting failed"))
	}

	// Create window
	var w *astilectron.Window
	if w, err = a.NewWindow(fmt.Sprintf("http://127.0.0.1:%d/v1/index.html", port), &astilectron.WindowOptions{
		Center: astilectron.PtrBool(true),
		Height: astilectron.PtrInt(618),
		Width:  astilectron.PtrInt(1000),
	}); err != nil {
		astilog.Fatal(errors.Wrap(err, "new window failed"))
	}
	if err = w.Create(); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating window failed"))
	}
	w.On(astilectron.EventNameWindowEventResize, func(e astilectron.Event) (deleteListener bool) {
		astilog.Info("Window resized")
		w.Send("resize")
		return
	})
	w.On(astilectron.EventNameWindowEventMessage, func(e astilectron.Event) (deleteListener bool) {
		var m string
		e.Message.Unmarshal(&m)
		astilog.Infof("Received message %s", m)
		return
	})
	// Blocking pattern
	a.Wait()
	return nil
}
