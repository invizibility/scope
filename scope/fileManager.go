package main

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/nimezhu/stream"
)

/*
 * implement Files (loaded URL in webpage?)
 * Data Manager interface
 *    type DataManager interface {
 	      AddURI(string, string) error
 	      Del(string) error
 	      ServeTo(*mux.Router)
 	      List() []string
 	      Get(string) (string, bool)
      }
*/
type FileManager struct {
	uri map[string]string
	//data   map[string]io.ReadSeeker
	dbname string
}

func (m *FileManager) AddURI(uri string, key string) error {
	_, ok := m.uri[key]
	if ok {
		return errors.New("duplicated key string")
	}
	/*
		  f, err := stream.NewSeekableStreamReader(uri)
			if err != nil {
				return err
			}
	*/
	m.uri[key] = uri
	//m.data[key] = f
	return nil
}

func (m *FileManager) Del(key string) error {
	_, ok := m.uri[key]
	if !ok {
		return errors.New("key not found")
	}
	//delete(m.data, key)
	delete(m.uri, key)
	return nil
}

func (m *FileManager) ServeTo(router *mux.Router) {
	//TODO File Handler
	prefix := "/" + m.dbname
	m.initBuffersHandle(router) //TODO change buffermap into m.
	router.HandleFunc(prefix+"/ls", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		jsonHic, _ := json.Marshal(m.uri)
		w.Write(jsonHic)
	})
}

func (m *FileManager) List() []string {
	keys := []string{}
	for k, _ := range m.uri {
		keys = append(keys, k)
	}
	return keys
}
func (m *FileManager) Get(key string) (string, bool) {
	v, ok := m.uri[key]
	return v, ok
}

func (m *FileManager) initBuffersHandle(router *mux.Router) {
	bufferMap := make(map[string][]byte)
	prefix := "/" + m.dbname
	router.HandleFunc(prefix+"/list", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		keys := []string{}
		for key, _ := range m.uri {
			keys = append(keys, key)
		}
		jsonBuffers, _ := json.Marshal(keys)
		w.Write(jsonBuffers)
	})
	router.HandleFunc(prefix+"/get/{id}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		params := mux.Vars(r)
		id := params["id"]
		content, ok := bufferMap[id]
		if ok {
			w.Write(content)
		} else {
			//w.Write([]byte("can not find " + id))
			f, ok := m.uri[id]
			if ok {
				r, err := stream.NewSeekableStreamReader(f)
				if err != nil {
					log.Println("error load " + id)
				} else {
					bufferMap[id], _ = ioutil.ReadAll(r)
					w.Write(bufferMap[id])
				}
			} else {
				w.Write([]byte("file not found"))
			}
		}
	})

}

func NewFileManager(uri string, dbname string) *FileManager {
	uriMap := LoadURI(uri)
	m := FileManager{
		uriMap,
		dbname,
	}
	return &m
}
