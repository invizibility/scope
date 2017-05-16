package main

import (
	"encoding/csv"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/nimezhu/stream"
)

type DataManager interface {
	AddURI(string, string) error
	Del(string) error
	ServeTo(*mux.Router)
	List() []string
	Get(string) (string, bool)
}
type Entry struct {
	Name string
	URI  string
}

func IterEntry(d DataManager) chan Entry {
	ch := make(chan Entry)
	go func() {
		for _, k := range d.List() {
			v, ok := d.Get(k)
			if ok {
				ch <- Entry{k, v}
			}
		}
		close(ch)
	}()
	return ch
}

func newDataManager(prefix string, uri string, format string) DataManager {
	switch format {
	case "file":
		return NewFileManager(uri, prefix)
	case "bigwig":
		return NewBigWigManager(uri, prefix)
	case "hic":
		return NewHicManager(uri, prefix)
	}
	return NewFileManager(uri, prefix)
}

func AddDataManagers(uri string, router *mux.Router) map[string]DataManager {
	m := map[string]DataManager{}
	reader, err := stream.NewSeekableStreamReader(uri)
	checkErr(err)
	entry := []string{}
	r := csv.NewReader(reader)
	r.Comma = '\t'
	r.Comment = '#'
	lines, err := r.ReadAll()
	checkErr(err)
	for i, line := range lines {
		if i == 0 {
			continue
		}
		prefix, uri, format := line[0], line[1], line[2]
		log.Println(prefix, uri, format)
		entry = append(entry, strings.Replace(prefix, "/", "", 1))
		a := newDataManager(prefix, uri, format)
		a.ServeTo(router)
		m[prefix] = a
	}
	router.HandleFunc("/list", func(w http.ResponseWriter, r *http.Request) {
		e, _ := json.Marshal(entry)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Write(e)
	})

	return m
}
