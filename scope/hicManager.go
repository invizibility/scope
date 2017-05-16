package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/nimezhu/stream"
	"github.com/nimezhu/stream/hic"
)

/*HicManager implement DataManager Inteface */
type HicManager struct {
	uriMap  map[string]string
	dataMap map[string]*hic.HiC
	prefix  string
}

func (m *HicManager) AddURI(uri string, key string) error {
	m.uriMap[key] = uri
	m.dataMap[key] = readhic(uri)
	log.Println("add uri", uri, key)
	return nil
}
func (m *HicManager) Del(key string) error {
	delete(m.uriMap, key)
	delete(m.dataMap, key)
	return nil
}
func (m *HicManager) Get(key string) (string, bool) {
	v, ok := m.uriMap[key]
	return v, ok
}
func (m *HicManager) List() []string {
	keys := []string{}
	for k, _ := range m.uriMap {
		keys = append(keys, k)
	}
	return keys
}
func (m *HicManager) ServeTo(router *mux.Router) {
	router.HandleFunc(m.prefix+"/ls", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		jsonHic, _ := json.Marshal(m.uriMap)
		w.Write(jsonHic)
	})
	AddHicsHandle(router, m.dataMap, m.prefix)
}

func NewHicManager(uri string, prefix string) *HicManager {
	uriMap := LoadURI(uri)
	dataMap := make(map[string]*hic.HiC)
	dataList := []string{}
	for k, v := range uriMap {
		dataMap[k] = readhic(v)
		dataList = append(dataList, k)
	}
	if _, ok := dataMap["default"]; ok {
		//has default
	} else {
		dataMap["default"] = dataMap[dataList[0]]
	}
	m := HicManager{
		uriMap,
		dataMap,
		prefix,
	}
	//m.ServeTo(router)
	return &m
}

func readhic(uri string) *hic.HiC {
	reader, err := stream.NewSeekableStreamReader(uri)
	checkErr(err)
	vhic, err := hic.DataReader(reader)
	checkErr(err)
	return vhic
}
