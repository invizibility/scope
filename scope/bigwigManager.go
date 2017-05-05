package main

import (
	"log"

	"github.com/gorilla/mux"
	"github.com/nimezhu/stream"
	. "github.com/nimezhu/stream/bigwig"
)

func readBw(uri string) *BigWigReader {
	reader, err := stream.NewSeekableStreamReader(uri)
	checkErr(err)
	bwf := NewBbiReader(reader)
	bwf.InitIndex()
	log.Println("in reading idx of", uri)
	bw := NewBigWigReader(bwf)
	return bw
}

/*BigWigManager implement DataManager Inteface */
type BigWigManager struct {
	uriMap map[string]string
	bwMap  map[string]*BigWigReader
	prefix string
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
func (m *BigWigManager) List() []string {
	keys := []string{}
	for k, _ := range m.uriMap {
		keys = append(keys, k)
	}
	return keys
}
func (m *BigWigManager) ServeTo(router *mux.Router) {
	AddBwsHandle(router, m.bwMap, m.prefix)
}

func NewBigWigManager(uri string, router *mux.Router, prefix string) *BigWigManager {
	uriMap := LoadURI(uri)
	bwmap := make(map[string]*BigWigReader)
	for k, v := range uriMap {
		bwmap[k] = readBw(v)
	}
	m := BigWigManager{
		uriMap,
		bwmap,
		prefix,
	}
	m.ServeTo(router)
	return &m
}
