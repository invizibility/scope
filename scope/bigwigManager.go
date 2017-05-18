package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/nimezhu/stream"
	. "github.com/nimezhu/stream/bigwig"
)

func readBw(uri string) *BigWigReader {
	reader, err := stream.NewSeekableStreamReader(uri)
	checkErr(err)
	bwf := NewBbiReader(reader)
	bwf.InitIndex()
	//log.Println("in reading idx of", uri)
	bw := NewBigWigReader(bwf)
	return bw
}

/*BigWigManager implement DataManager Inteface */
type BigWigManager struct {
	uriMap map[string]string
	bwMap  map[string]*BigWigReader
	dbname string
}

func (m *BigWigManager) AddURI(uri string, key string) error {
	m.uriMap[key] = uri
	m.bwMap[key] = readBw(uri)
	log.Println("add uri", uri, key)
	return nil
}
func (m *BigWigManager) Del(key string) error {
	delete(m.uriMap, key)
	delete(m.bwMap, key)
	return nil
}
func (m *BigWigManager) Get(key string) (string, bool) {
	v, ok := m.uriMap[key]
	return v, ok
}
func (m *BigWigManager) Move(key1 string, key2 string) bool {
	v, ok1 := m.uriMap[key1]
	d, ok2 := m.bwMap[key1]
	if ok1 && ok2 {
		m.uriMap[key2] = v
		m.bwMap[key2] = d
		delete(m.uriMap, key1)
		delete(m.bwMap, key1)
	}
	return ok1 && ok2
}
func (m *BigWigManager) List() []string {
	keys := []string{}
	for k, _ := range m.uriMap {
		keys = append(keys, k)
	}
	return keys
}
func (m *BigWigManager) ServeTo(router *mux.Router) {
	prefix := "/" + m.dbname
	router.HandleFunc(prefix+"/ls", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		jsonHic, _ := json.Marshal(m.uriMap)
		w.Write(jsonHic)
	})
	AddBwsHandle(router, m.bwMap, prefix)
}

func NewBigWigManager(uri string, dbname string) *BigWigManager {
	//prefix := "/" + dbname
	uriMap := LoadURI(uri)
	bwmap := make(map[string]*BigWigReader)
	for k, v := range uriMap {
		bwmap[k] = readBw(v)
	}
	m := BigWigManager{
		uriMap,
		bwmap,
		dbname,
	}
	//m.ServeTo(router)
	return &m
}

func InitBigWigManager(dbname string) *BigWigManager {
	uriMap := make(map[string]string)
	bwMap := make(map[string]*BigWigReader)
	m := BigWigManager{
		uriMap,
		bwMap,
		dbname,
	}
	return &m
}
