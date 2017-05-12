package main

import "github.com/gorilla/mux"

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
