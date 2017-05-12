package main

import "github.com/gorilla/mux"

type DataManager interface {
	AddURI(string, string) error
	Del(string) error
	ServeTo(*mux.Router)
	List() []string
	Get(string) (string, bool)
}
