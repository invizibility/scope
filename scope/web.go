package main

//go:generate go-bindata-assetfs -pkg main web/...
import (
	"html/template"
	"log"
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
	router.HandleFunc("/dev/{page}.html", func(w http.ResponseWriter, r *http.Request) {
		ps := mux.Vars(r)
		bytes, _ := Asset("web/dev/" + ps["page"] + ".html")
		w.Write(bytes)
	})
	router.HandleFunc("/web/{page}.html", func(w http.ResponseWriter, r *http.Request) {
		ps := mux.Vars(r)
		bytes, _ := Asset("web/" + ps["page"] + ".html")
		w.Write(bytes)
	})
	router.HandleFunc("/v1/{page}.html", func(w http.ResponseWriter, r *http.Request) {
		ps := mux.Vars(r)
		bytes, _ := Asset("tmpl/" + ps["page"] + ".tmpl")
		tmpl := template.New("html")
		tmpl, err := tmpl.Parse(string(bytes))
		dir, _ := AssetDir("templates")
		for _, d := range dir {
			bytes, err1 := Asset("templates/" + d)
			if err1 != nil {
				log.Panicf("Unable to parse: template=%s, err=%s", d, err)
			}
			tmpl.New(d).Parse(string(bytes))
		}
		if err != nil {
			log.Println("error parse template")
		}
		err = tmpl.Execute(w, Env) //constant
		if err != nil {
			log.Println("error executing template")
		}
	})
}
