package main

import (
	"encoding/json"
	//"fmt"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/nimezhu/snowjs"
	"github.com/nimezhu/stream"
	HiC "github.com/nimezhu/stream/hic"
	"github.com/urfave/cli"
)

/* Serve HiC file with normalized matrix and expection matrix and normalized methods
 * for HiC data file server demo prototype
 */
func CmdServe(c *cli.Context) error {
	uri := c.String("uri")
	port := c.Int("port")
	router := mux.NewRouter()
	reader, err := stream.NewSeekableStreamReader(uri)
	hic, err := HiC.DataReader(reader)
	checkErr(err)
	snowjs.AddHandlers(router, "")
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		bytes, _ := Asset("index.html")
		w.Write(bytes)
	})
	router.HandleFunc("/list", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		/*
			io.WriteString(w, "Idx\tName\tLength\n")
			for i, v := range hic.Chr {
				s := fmt.Sprintf("%d\t%s\t%d\n", i, v.Name, v.Length)
				io.WriteString(w, s)
			}
		*/
		jsonChr, _ := json.Marshal(hic.Chr)
		w.Write(jsonChr)
	})
	router.HandleFunc("/norms", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		normidx := hic.Footer.NormTypeIdx()
		jsonNormIdx, _ := json.Marshal(normidx)
		w.Write(jsonNormIdx)
	})
	router.HandleFunc("/units", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		units := hic.Footer.Units
		a := []int{}
		for k, _ := range units {
			a = append(a, k)
		}
		jsonUnits, err := json.Marshal(a)
		if err != nil {
			log.Panic(err)
		}
		w.Write(jsonUnits)
	})
	router.HandleFunc("/bpres", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		bpres := hic.BpRes
		jsonBpres, err := json.Marshal(bpres)
		if err != nil {
			log.Panic(err)
		}
		w.Write(jsonBpres)
	})

	router.HandleFunc("/info", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		io.WriteString(w, hic.String())
	})

	router.HandleFunc("/get/{chr}:{start}-{end}/{width}/{format}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		chr := params["chr"]
		start, _ := strconv.Atoi(params["start"])
		end, _ := strconv.Atoi(params["end"])
		width, _ := strconv.Atoi(params["width"])
		m := hic.QueryOne(chr, start, end, width)
		format := params["format"]
		if format == "bin" {
			w.Header().Set("Content-Type", "application/octet-stream")
			a := matrixToBytes(m)
			w.Write(a)
		} else {
			io.WriteString(w, sprintMat64(m))
		}
	})
	router.HandleFunc("/get2d/{chr}:{start}-{end}/{chr2}:{start2}-{end2}/{resIdx}/{format}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		chr := params["chr"]
		start, _ := strconv.Atoi(params["start"])
		end, _ := strconv.Atoi(params["end"])
		resIdx, _ := strconv.Atoi(params["resIdx"])
		chr2 := params["chr2"]
		start2, _ := strconv.Atoi(params["start2"])
		end2, _ := strconv.Atoi(params["end2"])
		format := params["format"]
		m := hic.QueryTwo(chr, start, end, chr2, start2, end2, resIdx)
		if format == "bin" {
			w.Header().Set("Content-Type", "application/octet-stream")
			a := matrixToBytes(m)
			w.Write(a)
		} else {
			io.WriteString(w, sprintMat64(m))
		}
	})
	router.HandleFunc("/get2dnorm/{chr}:{start}-{end}/{chr2}:{start2}-{end2}/{resIdx}/{norm}/{unit}/{format}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		chr := params["chr"]
		start, _ := strconv.Atoi(params["start"])
		end, _ := strconv.Atoi(params["end"])
		resIdx, _ := strconv.Atoi(params["resIdx"])
		chr2 := params["chr2"]
		start2, _ := strconv.Atoi(params["start2"])
		end2, _ := strconv.Atoi(params["end2"])
		format := params["format"]
		norm, _ := strconv.Atoi(params["norm"])
		unit, _ := strconv.Atoi(params["unit"])
		m := hic.QueryTwoNormMat(chr, start, end, chr2, start2, end2, resIdx, norm, unit)
		if format == "bin" {
			w.Header().Set("Content-Type", "application/octet-stream")
			a := matrixToBytes(m)
			w.Write(a)
		} else {
			io.WriteString(w, sprintMat64(m))
		}
	})
	router.HandleFunc("/icon/{chr}/{format}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		chr := params["chr"]
		format := params["format"]
		m := hic.Icon(chr)
		if format == "bin" {
			w.Header().Set("Content-Type", "application/octet-stream")
			a := matrixToBytes(m)
			w.Write(a)
		} else {
			io.WriteString(w, sprintMat64(m))
		}
	})
	router.HandleFunc("/iconsmart/{chr}/{width}/{format}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		chr := params["chr"]
		width, _ := strconv.Atoi(params["width"])
		m := hic.IconSmart(chr, width)
		format := params["format"]
		if format == "bin" {
			w.Header().Set("Content-Type", "application/octet-stream")
			a := matrixToBytes(m)
			w.Write(a)
		} else {
			io.WriteString(w, sprintMat64(m))
		}
	})
	router.HandleFunc("/icon2smart/{chr}:{chr2}/{width}/{format}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		chr := params["chr"]
		chr2 := params["chr2"]
		width, _ := strconv.Atoi(params["width"])
		format := params["format"]
		m := hic.Icon2Smart(chr, chr2, width)
		if format == "bin" {
			w.Header().Set("Content-Type", "application/octet-stream")
			a := matrixToBytes(m)
			w.Write(a)
		} else {
			io.WriteString(w, sprintMat64(m))
		}
	})
	log.Println("Listening...")
	log.Println("Please open http://127.0.0.1:" + strconv.Itoa(port))
	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(port), router))
	return nil
}
