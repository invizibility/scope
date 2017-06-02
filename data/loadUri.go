package data

import (
	"encoding/csv"
	"io"
	"log"
	"path"
	"strings"

	"github.com/nimezhu/stream"
)

func LoadURI(uri string) map[string]string {
	ext := strings.ToLower(path.Ext(uri))
	uriMap := make(map[string]string)
	if ext == ".txt" || ext == ".tsv" {
		reader, err := stream.NewSeekableStreamReader(uri)
		checkErr(err)
		r := csv.NewReader(reader)
		r.Comma = '\t'
		for {
			record, err := r.Read()
			if err == io.EOF {
				break
			}
			if err != nil {
				log.Fatal(err)
			}
			log.Println(record)
			uriMap[record[0]] = record[1]
		}
	} else {
		uriMap["default"] = uri
	}
	return uriMap
}
