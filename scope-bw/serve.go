package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/boltdb/bolt"
	"github.com/gorilla/mux"
	"github.com/nimezhu/snowjs"
	"github.com/nimezhu/stream"
	. "github.com/nimezhu/stream/bigwig"
	"github.com/urfave/cli"
)

/* CmdServe: serve bigwig data
 *     	     prototype serve one bigwig file now.
 */
func CmdServe(c *cli.Context) error {
	uri := c.String("uri")
	port := c.Int("port")
	router := mux.NewRouter()
	snowjs.AddHandlers(router, "")
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		bytes, _ := Asset("index.html")
		w.Write(bytes)
	})
	reader, err := stream.NewSeekableStreamReader(uri)
	checkErr(err)
	bwf := NewBbiReader(reader)
	if idx := c.String("idx"); idx != "" {
		f, _ := os.Open(idx)
		defer f.Close()
		bwf.ReadIndex(f)
		fmt.Println("in reading idx")
	} else if dbname := c.String("db"); dbname != "" {
		fmt.Println("in reading db")
		db, err := bolt.Open(dbname, 0600, &bolt.Options{Timeout: 1 * time.Second})
		checkErr(err)
		bucketName := "bigwigIndex"
		checkErr(err)
		defer db.Close()
		tx, err := db.Begin(true)
		checkErr(err)
		bucket := tx.Bucket([]byte(bucketName))
		buff := bucket.Get([]byte(uri))
		bwf.ReadIndex(bytes.NewReader(buff))
	} else {
		fmt.Println("in init index")
		bwf.InitIndex()
	}
	bw := NewBigWigReader(bwf)
	router.HandleFunc("/get/{chr}:{start}-{end}/{width}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		chr := params["chr"]
		start, _ := strconv.Atoi(params["start"])
		end, _ := strconv.Atoi(params["end"])
		width, _ := strconv.Atoi(params["width"])
		if iter, err := bw.Query(chr, start, end, width); err == nil {
			for i := range iter {
				io.WriteString(w, fmt.Sprintln(i.From, "\t", i.To, "\t", i.Sum))
			}
		}
	})
	router.HandleFunc("/getjson/{chr}:{start}-{end}/{width}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		chr := params["chr"]
		start, _ := strconv.Atoi(params["start"])
		end, _ := strconv.Atoi(params["end"])
		width, _ := strconv.Atoi(params["width"])
		arr := []*BbiQueryType{}
		if iter, err := bw.Query(chr, start, end, width); err == nil {
			for i := range iter {
				arr = append(arr, i)
				//io.WriteString(w, fmt.Sprintln(i.From, "\t", i.To, "\t", i.Sum))
			}
		}
		j, err := json.Marshal(arr)
		checkErr(err)
		io.WriteString(w, string(j))
	})
	router.HandleFunc("/getbin/{chr}:{start}-{end}/{binsize}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		chr := params["chr"]
		start, _ := strconv.Atoi(params["start"])
		end, _ := strconv.Atoi(params["end"])
		binsize, _ := strconv.Atoi(params["binsize"])
		arr := []*BbiQueryType{}
		if iter, err := bw.QueryBin(chr, start, end, binsize); err == nil {
			for i := range iter {
				arr = append(arr, i)
				//io.WriteString(w, fmt.Sprintln(i.From, "\t", i.To, "\t", i.Sum))
			}
		}
		j, err := json.Marshal(arr)
		checkErr(err)
		io.WriteString(w, string(j))
	})
	router.HandleFunc("/list", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		j, err := json.Marshal(bw.Genome)
		checkErr(err)
		io.WriteString(w, string(j))
	})
	router.HandleFunc("/binsize/{length}/{width}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		length, _ := strconv.Atoi(params["length"])
		width, _ := strconv.Atoi(params["width"])
		binsize := bw.GetBinsize(length, width)
		j, err := json.Marshal(binsize)
		checkErr(err)
		io.WriteString(w, string(j))
	})
	log.Println("Listening...")
	log.Println("Please open http://127.0.0.1:" + strconv.Itoa(port))
	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(port), router))
	return nil
}
