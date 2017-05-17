package main

import (
	"encoding/csv"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	astilectron "github.com/asticode/go-astilectron"
	"github.com/gorilla/mux"
	"github.com/nimezhu/stream"
)

type DataManager interface {
	AddURI(uri string, key string) error
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

func AddAsticodeToWindow(w *astilectron.Window, dbmap map[string]DataManager) {
	w.On(astilectron.EventNameWindowEventMessage, func(e astilectron.Event) (deleteListener bool) {
		var m string
		var dat map[string]interface{}
		e.Message.Unmarshal(&m)
		if err := json.Unmarshal([]byte(m), &dat); err != nil {
			panic(err)
		}
		if dat["code"] == "add" {
			prefix, ok1 := dat["prefix"].(string) // prefix(dbname) start with \/
			id, ok2 := dat["id"].(string)
			uri, ok3 := dat["uri"].(string)
			//log.Println("add from web", prefix, id, uri)
			//log.Println(ok1, ok2, ok3)
			if ok1 && ok2 && ok3 {
				if dbi, ok := dbmap[prefix]; ok {
					//log.Println("adding", ok)
					dbi.AddURI(uri, id)
				}
			}
		}
		if dat["code"] == "del" {
			prefix, ok1 := dat["prefix"].(string) //prefix(dbname) start with \/
			id, ok2 := dat["id"].(string)
			//uri, ok3 := dat["uri"].(string)
			if ok1 && ok2 {
				if dbi, ok := dbmap[prefix]; ok {
					dbi.Del(id)
				}
			}
		}
		return false
	})
}
