package main

//go:generate go-bindata-assetfs -pkg main index.html lib.js lib.css
import (
	//"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func AddStaticHandle(router *mux.Router) {
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		bytes, _ := Asset("index.html")
		w.Write(bytes)
	})
	router.HandleFunc("/lib.css", func(w http.ResponseWriter, r *http.Request) {
		bytes, _ := Asset("lib.css")
		w.Write(bytes)
	})
	router.HandleFunc("/lib.js", func(w http.ResponseWriter, r *http.Request) {
		bytes, _ := Asset("lib.js")
		w.Write(bytes)
	})
}
