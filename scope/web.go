package main

//go:generate go-bindata-assetfs -pkg main web/...
import (
	"net/http"

	"github.com/gorilla/mux"
)

func AddStaticHandle(router *mux.Router) {
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		bytes, _ := Asset("web/index.html")
		w.Write(bytes)
	})
	router.HandleFunc("/style0/{css}", func(w http.ResponseWriter, r *http.Request) {
		ps := mux.Vars(r)
		bytes, _ := Asset("web/style/" + ps["css"])
		w.Write(bytes)
	})
	router.HandleFunc("/lib0/{js}", func(w http.ResponseWriter, r *http.Request) {
		ps := mux.Vars(r)

		bytes, _ := Asset("web/lib/" + ps["js"])
		w.Write(bytes)
	})
	router.HandleFunc("/{page}.html", func(w http.ResponseWriter, r *http.Request) {
		ps := mux.Vars(r)
		bytes, _ := Asset("web/" + ps["page"] + ".html")
		w.Write(bytes)
	})
}
