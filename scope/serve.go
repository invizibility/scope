package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

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

type bwManager struct {
	uriMap map[string]string
	bwMap  map[string]*BigWigReader
	prefix string
	router *mux.Router
}

func (m *bwManager) AddURI(uri string, key string) error {
	m.uriMap[key] = uri
	m.bwMap[key] = readBw(uri)
	log.Println("add uri", uri, key)
	return nil
}
func (m *bwManager) Del(key string) error {
	delete(m.uriMap, key)
	delete(m.bwMap, key)
	return nil
}

func (m *bwManager) Serve() {
	AddBwsHandle(m.router, m.bwMap, m.prefix)
}

func NewBwManager(uri string, router *mux.Router, prefix string) *bwManager {
	uriMap := LoadURI(uri)
	bwmap := make(map[string]*BigWigReader)
	for k, v := range uriMap {
		bwmap[k] = readBw(v)
	}
	AddBwsHandle(router, bwmap, prefix)

	m := bwManager{
		uriMap,
		bwmap,
		prefix,
		router,
	}
	return &m
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
func addData(c *cli.Context, router *mux.Router) (*bwManager, error) {
	entry := []string{}
	bwURI := c.String("B")
	var bwM *bwManager
	if bwURI != "" {
		//serveBwURI(bwURI, router, "/bw")
		bwM = NewBwManager(bwURI, router, "/bw")
		log.Println("bw manager", bwM)
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
	return bwM, nil
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
	bwManager, _ := addData(c, router) //TODO.
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
	a.SetProvisioner(astilectron.NewDisembedderProvisioner(Asset, "vendor/astilectron-v0.1.0.zip", "vendor/electron-v1.6.5.zip"))
	defer a.Close()
	a.HandleSignals()
	a.On(astilectron.EventNameAppClose, func(e astilectron.Event) (deleteListener bool) {
		a.Stop()
		return
	})

	// Start
	if err = a.Start(); err != nil {
		astilog.Fatal(errors.Wrap(err, "starting failed"))
	}

	// Create window
	// w1 := createNewWindow(a, port, 800, 600, "ucsc") //simple monitor 1
	ws := make(map[int]*astilectron.Window)
	idx := 0
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
		//var m map[string]interface{}
		e.Message.Unmarshal(&m)
		astilog.Infof("Received message %s", m)
		/*

		 */
		var dat map[string]interface{}
		if err := json.Unmarshal([]byte(m), &dat); err != nil {
			panic(err)
		}
		if dat["code"] == "openExt" {
			go createNewWindow(a, port, 1000, 700, "external", ws, idx)
			idx++
			astilog.Infof("window %d", idx)
		}

		//go createNewWindow(a, port)
		//w1.Send(m)
		if dat["code"] == "brush" || dat["code"] == "update" {
			for _, w1 := range ws {
				w1.Send(m)
			}
		}
		if dat["code"] == "loadBw" {
			d, _ := dat["data"].(string)
			fmt.Println("window message : load bigwig ", d)
			a := strings.Split(d, "/")
			bwManager.AddURI(d, a[len(a)-1])
		}

		return
	})

	w.On(astilectron.EventNameWindowEventClosed, func(e astilectron.Event) (deleteListener bool) {

		a.Stop() //TODO fix javascript error
		return

	})
	// Blocking pattern

	//createNewWindow(a, port)

	a.Wait()
	return nil
}

func createNewWindow(a *astilectron.Astilectron, port int, width int, height int, page string, ws map[int]*astilectron.Window, idx int) error {
	var w1 *astilectron.Window
	var err error
	id := idx
	if w1, err = a.NewWindow(fmt.Sprintf("http://127.0.0.1:%d/v1/%s.html", port, page), &astilectron.WindowOptions{
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
		w1.Send("w1 resize") // TODO
		return
	})
	w1.On(astilectron.EventNameWindowEventClosed, func(e astilectron.Event) (deleteListener bool) {
		astilog.Info("w1 Window close") //TODO?
		delete(ws, id)
		return
	})
	ws[id] = w1

	return nil
}
