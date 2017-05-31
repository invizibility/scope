package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

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
	Move(key1 string, key2 string) bool
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

func newDataManager(dbname string, uri string, format string) DataManager {
	switch format {
	case "file":
		return NewFileManager(uri, dbname)
	case "bigwig":
		return NewBigWigManager(uri, dbname)
	case "hic":
		return NewHicManager(uri, dbname)
	case "map":
		return NewMapManager(uri, dbname)
	}
	return nil
}
func initDataManager(dbname string, format string) DataManager {
	switch format {
	case "file":
		return InitFileManager(dbname)
	case "bigwig":
		return InitBigWigManager(dbname)
	case "hic":
		return InitHicManager(dbname)
	case "map":
		return InitMapManager(dbname)
	}
	return nil
}
func ReadJsonToManagers(uri string, router *mux.Router) map[string]DataManager {
	m := map[string]DataManager{}
	r, err := stream.NewSeekableStreamReader(uri)
	checkErr(err)
	var dat map[string]interface{}
	byt, err := ioutil.ReadAll(r)
	checkErr(err)
	if err = json.Unmarshal(byt, &dat); err != nil {
		panic(err)
	}
	data := dat["data"].([]interface{})
	meta := dat["meta"].([]interface{})
	jdata := []map[string]string{}
	entry := []string{}
	for i, v := range meta {
		fmt.Println(i, v, data[i])
		v1 := v.(map[string]interface{})
		format, _ := v1["format"].(string)
		dbname, _ := v1["dbname"].(string)
		dm := initDataManager(dbname, format)
		m[dbname] = dm
		jdata = append(jdata, map[string]string{
			"dbname": dbname,
			"uri":    "null",
			"format": format,
		})
		entry = append(entry, dbname)
		for k, v := range data[i].(map[string]interface{}) {
			fmt.Println("add", v.(string), "as", k, "in db", dbname)
			dm.AddURI(v.(string), k)
		}
		dm.ServeTo(router)
	}
	router.HandleFunc("/list", func(w http.ResponseWriter, r *http.Request) {
		e, _ := json.Marshal(entry)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Write(e)
	})
	router.HandleFunc("/ls", func(w http.ResponseWriter, r *http.Request) {
		e, _ := json.Marshal(jdata)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Write(e)
	})
	//TODO Load Data Manager (loadDataManager)
	return m
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
	jdata := []map[string]string{}
	for i, line := range lines {
		if i == 0 {
			continue
		}
		dbname, uri, format := line[0], line[1], line[2]
		log.Println(dbname, uri, format)
		entry = append(entry, dbname)
		a := newDataManager(dbname, uri, format)
		jdata = append(jdata, map[string]string{
			"dbname": dbname,
			"uri":    uri,
			"format": format,
		})
		a.ServeTo(router)
		m[dbname] = a
	}
	router.HandleFunc("/list", func(w http.ResponseWriter, r *http.Request) {
		e, _ := json.Marshal(entry)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Write(e)
	})
	router.HandleFunc("/ls", func(w http.ResponseWriter, r *http.Request) {
		e, _ := json.Marshal(jdata)
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
			dbname, ok1 := dat["dbname"].(string) // prefix(dbname) start with \/
			id, ok2 := dat["id"].(string)
			uri, ok3 := dat["uri"].(string)
			//log.Println("add from web", prefix, id, uri)
			//log.Println(ok1, ok2, ok3)
			if ok1 && ok2 && ok3 {
				if dbi, ok := dbmap[dbname]; ok {
					//log.Println("adding", ok)
					dbi.AddURI(uri, id)
				}
			}
		}
		if dat["code"] == "del" {
			dbname, ok1 := dat["dbname"].(string) //prefix(dbname) start with \/
			id, ok2 := dat["id"].(string)
			//uri, ok3 := dat["uri"].(string)
			if ok1 && ok2 {
				if dbi, ok := dbmap[dbname]; ok {
					dbi.Del(id)
				}
			}
		}
		if dat["code"] == "move" {
			log.Println(dat)
			dbname, ok1 := dat["dbname"].(string) //prefix(dbname) start with \/
			id1, ok2 := dat["from"].(string)
			id2, ok3 := dat["to"].(string)
			if ok1 && ok2 && ok3 {
				if dbi, ok := dbmap[dbname]; ok {
					dbi.Move(id1, id2)
				}
			}
		}
		return false
	})
}
