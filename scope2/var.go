package main

type V struct {
	Version string
}

var Env = V{
	VERSION,
}

type Message struct {
	Code string `json:"code"`
	Data string `json:"data"`
}
