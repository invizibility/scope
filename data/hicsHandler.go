package data

import (
	"encoding/json"
	//"fmt"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	. "github.com/nimezhu/stream/hic"
)

func AddHicsHandle(router *mux.Router, hicMap map[string]*HiC, prefix string) {
	router.HandleFunc(prefix+"/list", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		/*
		   io.WriteString(w, "Idx\tName\tLength\n")
		   for i, v := range hic.Chr {
		     s := fmt.Sprintf("%d\t%s\t%d\n", i, v.Name, v.Length)
		     io.WriteString(w, s)
		   }
		*/
		keys := []string{}
		for key, _ := range hicMap {
			keys = append(keys, key)
		}
		jsonHic, _ := json.Marshal(keys)
		w.Write(jsonHic)
	})

	router.HandleFunc(prefix+"/{id}/list", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		/*
		   io.WriteString(w, "Idx\tName\tLength\n")
		   for i, v := range hic.Chr {
		     s := fmt.Sprintf("%d\t%s\t%d\n", i, v.Name, v.Length)
		     io.WriteString(w, s)
		   }
		*/
		params := mux.Vars(r)
		id := params["id"]
		jsonChr, _ := json.Marshal(hicMap[id].Chr)
		w.Write(jsonChr)
	})
	router.HandleFunc(prefix+"/{id}/norms", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		id := params["id"]
		normidx := hicMap[id].Footer.NormTypeIdx()
		jsonNormIdx, _ := json.Marshal(normidx)
		w.Write(jsonNormIdx)
	})
	router.HandleFunc(prefix+"/{id}/units", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		id := params["id"]
		log.Println(id)
		units := hicMap[id].Footer.Units
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
	router.HandleFunc(prefix+"/{id}/bpres", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		id := params["id"]
		bpres := hicMap[id].BpRes
		jsonBpres, err := json.Marshal(bpres)
		if err != nil {
			log.Panic(err)
		}
		w.Write(jsonBpres)
	})

	router.HandleFunc(prefix+"/{id}/info", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		id := params["id"]
		io.WriteString(w, hicMap[id].String())
	})

	router.HandleFunc(prefix+"/{id}/get/{chr}:{start}-{end}/{width}/{format}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		id := params["id"]
		chr := params["chr"]
		start, _ := strconv.Atoi(params["start"])
		end, _ := strconv.Atoi(params["end"])
		width, _ := strconv.Atoi(params["width"])
		m := hicMap[id].QueryOne(chr, start, end, width)
		format := params["format"]
		if format == "bin" {
			w.Header().Set("Content-Type", "application/octet-stream")
			a := matrixToBytes(m)
			w.Write(a)
		} else {
			io.WriteString(w, sprintMat64(m))
		}
	})
	router.HandleFunc(prefix+"/{id}/get2d/{chr}:{start}-{end}/{chr2}:{start2}-{end2}/{resIdx}/{format}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		id := params["id"]
		chr := params["chr"]
		start, _ := strconv.Atoi(params["start"])
		end, _ := strconv.Atoi(params["end"])
		resIdx, _ := strconv.Atoi(params["resIdx"])
		chr2 := params["chr2"]
		start2, _ := strconv.Atoi(params["start2"])
		end2, _ := strconv.Atoi(params["end2"])
		format := params["format"]
		m := hicMap[id].QueryTwo(chr, start, end, chr2, start2, end2, resIdx)
		if format == "bin" {
			w.Header().Set("Content-Type", "application/octet-stream")
			a := matrixToBytes(m)
			w.Write(a)
		} else {
			io.WriteString(w, sprintMat64(m))
		}
	})
	router.HandleFunc(prefix+"/{id}/get2dnorm/{chr}:{start}-{end}/{chr2}:{start2}-{end2}/{resIdx}/{norm}/{unit}/{format}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		id := params["id"]
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
		m := hicMap[id].QueryTwoNormMat(chr, start, end, chr2, start2, end2, resIdx, norm, unit)
		if format == "bin" {
			w.Header().Set("Content-Type", "application/octet-stream")
			a := matrixToBytes(m)
			w.Write(a)
		} else {
			io.WriteString(w, sprintMat64(m))
		}
	})
	router.HandleFunc(prefix+"/{id}/corrected/{chr}：{start}-{end}/{resIdx}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		//chr := params["chr"]
		id := params["id"]
		start, _ := strconv.Atoi(params["start"])
		end, _ := strconv.Atoi(params["end"])
		resIdx, _ := strconv.Atoi(params["resIdx"])
		s, e := hicMap[id].Corrected(start, end, resIdx)
		j, _ := json.Marshal([]int{s, e})
		w.Write(j)
	})
	router.HandleFunc(prefix+"/{id}/icon/{chr}/{format}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		id := params["id"]
		chr := params["chr"]
		format := params["format"]
		m := hicMap[id].Icon(chr)
		if format == "bin" {
			w.Header().Set("Content-Type", "application/octet-stream")
			a := matrixToBytes(m)
			w.Write(a)
		} else {
			io.WriteString(w, sprintMat64(m))
		}
	})
	router.HandleFunc(prefix+"/{id}/iconsmart/{chr}/{width}/{format}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		id := params["id"]
		chr := params["chr"]
		width, _ := strconv.Atoi(params["width"])
		m := hicMap[id].IconSmart(chr, width)
		format := params["format"]
		if format == "bin" {
			w.Header().Set("Content-Type", "application/octet-stream")
			a := matrixToBytes(m)
			w.Write(a)
		} else {
			io.WriteString(w, sprintMat64(m))
		}
	})
	router.HandleFunc(prefix+"/{id}/icon2smart/{chr}:{chr2}/{width}/{format}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		id := params["id"]
		chr := params["chr"]
		chr2 := params["chr2"]
		width, _ := strconv.Atoi(params["width"])
		format := params["format"]
		m := hicMap[id].Icon2Smart(chr, chr2, width)
		if format == "bin" {
			w.Header().Set("Content-Type", "application/octet-stream")
			a := matrixToBytes(m)
			w.Write(a)
		} else {
			io.WriteString(w, sprintMat64(m))
		}
	})
}
