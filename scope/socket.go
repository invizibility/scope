package main

import (
	"log"
	"net/http"

	astilectron "github.com/asticode/go-astilectron"
	"github.com/googollee/go-socket.io"
	"github.com/gorilla/mux"
)

func AddSocket(chatroom string, router *mux.Router, w *astilectron.Window) {
	server, err := socketio.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}
	server.On("connection", func(so socketio.Socket) {
		log.Println("on connection")
		so.Join(chatroom)
		so.On("data", func(msg string) {
			//data := msg
			//so.BroadcastTo(chatroom, "data", len(data))
			w.Send("data " + msg)
		})
		so.On("callback", func(msg string) string {
			return msg
		})
		so.On("disconnection", func() {
			log.Println("on disconnect")
		})
	})
	server.On("error", func(so socketio.Socket, err error) {
		log.Println("error:", err)
	})

	router.HandleFunc("/socket.io/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*:*")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		server.ServeHTTP(w, r)
	})
}
