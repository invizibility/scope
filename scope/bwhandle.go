package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	. "github.com/nimezhu/stream/bigwig"
)

func AddBwHandle(router *mux.Router, bw *BigWigReader, prefix string) {
	router.HandleFunc(prefix+"/get/{chr}:{start}-{end}/{width}", func(w http.ResponseWriter, r *http.Request) {
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
	router.HandleFunc(prefix+"/getjson/{chr}:{start}-{end}/{width}", func(w http.ResponseWriter, r *http.Request) {
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
	router.HandleFunc(prefix+"/getbin/{chr}:{start}-{end}/{binsize}", func(w http.ResponseWriter, r *http.Request) {
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
	router.HandleFunc(prefix+"/list", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		j, err := json.Marshal(bw.Genome)
		checkErr(err)
		io.WriteString(w, string(j))
	})
	router.HandleFunc(prefix+"/binsize/{length}/{width}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		length, _ := strconv.Atoi(params["length"])
		width, _ := strconv.Atoi(params["width"])
		binsize := bw.GetBinsize(length, width)
		j, err := json.Marshal(binsize)
		checkErr(err)
		io.WriteString(w, string(j))
	})
	router.HandleFunc(prefix+"/binsizes", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		j, err := json.Marshal(bw.Binsizes())
		checkErr(err)
		io.WriteString(w, string(j))
	})
}
