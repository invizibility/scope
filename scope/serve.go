package main

import (
	"encoding/csv"
	"io"
	"log"
	"net/http"
	"path"
	"strconv"
	"strings"

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
	bwExt := strings.ToLower(path.Ext(uri))
	bwmap := make(map[string]*BigWigReader)
	if bwExt == ".bw" || bwExt == ".bigwig" { //Single BigWig File to Default
		bwmap["default"] = readBw(uri)
	} else if bwExt == ".txt" || bwExt == ".tsv" {
		reader, err := stream.NewSeekableStreamReader(uri)
		checkErr(err)
		r := csv.NewReader(reader)
		r.Comma = '\t'
		for {
			record, err := r.Read()
			if err == io.EOF {
				break
			}
			if err != nil {
				log.Fatal(err)
			}
			log.Println(record)
			bwmap[record[0]] = readBw(record[1])
		}
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
	hicExt := strings.ToLower(path.Ext(uri))
	hicmap := make(map[string]*HiC.HiC)
	hicList := []string{}
	if hicExt == ".hic" || hicExt == ".HiC" { //Single BigWig File to Default
		hicmap["default"] = readHic(uri) //TODO
	} else if hicExt == ".txt" || hicExt == ".tsv" {
		reader, err := stream.NewSeekableStreamReader(uri)
		checkErr(err)
		r := csv.NewReader(reader)
		r.Comma = '\t'
		for {
			record, err := r.Read()
			if err == io.EOF {
				break
			}
			if err != nil {
				log.Fatal(err)
			}
			log.Println(record)
			hicmap[record[0]] = readHic(record[1])
			hicList = append(hicList, record[0])
		}
	}
	if _, ok := hicmap["default"]; ok {
		//has default
	} else {
		hicmap["default"] = hicmap[hicList[0]]
	}
	AddHicsHandle(router, hicmap, prefix)
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
	serveBwURI(bwURI, router, "/bw")
	/* TODO: multi hic files */
	hicURI := c.String("H")
	//hicreader, err := stream.NewSeekableStreamReader(hicURI)
	//hic, err := HiC.DataReader(hicreader)
	serveHicURI(hicURI, router, "/hic")

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
