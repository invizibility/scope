// Code generated by go-bindata.
// sources:
// index.html
// lib.js
// lib.css
// DO NOT EDIT!

package main

import (
	"github.com/elazarl/go-bindata-assetfs"
	"bytes"
	"compress/gzip"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func bindataRead(data []byte, name string) ([]byte, error) {
	gz, err := gzip.NewReader(bytes.NewBuffer(data))
	if err != nil {
		return nil, fmt.Errorf("Read %q: %v", name, err)
	}

	var buf bytes.Buffer
	_, err = io.Copy(&buf, gz)
	clErr := gz.Close()

	if err != nil {
		return nil, fmt.Errorf("Read %q: %v", name, err)
	}
	if clErr != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

type asset struct {
	bytes []byte
	info  os.FileInfo
}

type bindataFileInfo struct {
	name    string
	size    int64
	mode    os.FileMode
	modTime time.Time
}

func (fi bindataFileInfo) Name() string {
	return fi.name
}
func (fi bindataFileInfo) Size() int64 {
	return fi.size
}
func (fi bindataFileInfo) Mode() os.FileMode {
	return fi.mode
}
func (fi bindataFileInfo) ModTime() time.Time {
	return fi.modTime
}
func (fi bindataFileInfo) IsDir() bool {
	return false
}
func (fi bindataFileInfo) Sys() interface{} {
	return nil
}

var _indexHtml = []byte("\x1f\x8b\x08\x00\x00\x09\x6e\x88\x00\xff\xac\x93\xd1\x52\xf3\x20\x10\x85\xef\xf3\x14\xfc\xdc\x27\xcc\xaf\x5e\x92\xdc\xfa\x00\x3e\x01\x09\x5b\xa1\x12\x40\xd8\x46\xf3\xf6\x6e\xa1\x3a\xcd\x4c\x1d\xeb\xd4\xdc\xc0\x2c\xe7\x7c\xec\xec\x09\xd2\xe0\xec\x86\xa6\x91\x06\x94\x1e\x1a\x46\x9f\x44\x8b\x0e\x86\x47\xf0\x61\x06\xf6\x34\x85\x08\x52\xd4\x5a\x3d\x77\xd6\xbf\xb0\x04\xae\xe7\x19\x57\x07\xd9\x00\x20\x67\x26\xc1\xae\xe7\x62\xca\x59\x8c\x21\x60\xc6\xa4\x62\x37\x5b\xdf\x51\x85\x5f\xe3\x74\x76\x3c\xd7\xe6\x29\xd9\x88\x0c\xd7\x08\x3d\x47\x78\x47\xb1\x57\x8b\xaa\x55\xce\x72\x9a\xaa\x45\xe8\xfb\x6e\x79\x28\x17\xed\xc9\x2b\x45\x55\xfc\x1a\xd2\xbe\x1e\xe0\x00\xdd\x72\xf7\x07\xa8\x04\x04\xcb\xd8\x2d\xff\x6f\x85\xed\x09\x94\xd6\x5b\x29\xdb\x3c\xb6\x20\x29\x6a\xf2\x8d\x1c\x83\x5e\x69\x2d\xe4\x7f\x6d\x5b\x37\xda\x2e\xcc\x6a\xa2\x87\xc8\xd9\xe4\x54\xce\x3d\x9f\xc1\x1f\x4e\x29\xd5\x54\xd5\x08\x8e\xed\x42\xea\xf9\x9b\xd5\x68\xf8\xc0\xca\xca\xa4\x28\x47\x03\x75\x1a\x95\x2f\x9c\x93\x80\xee\xa7\xca\x65\x86\x01\xfb\x6c\x90\x20\x75\x73\x89\xf2\x29\x39\xc7\x48\x41\xbd\x0e\xdb\xae\x1d\xec\xf0\xab\xed\x29\x78\x54\xd6\x43\xe2\xdf\x1b\x66\x12\xfc\x6c\x68\xdb\xe3\xdc\xea\xbc\xae\x09\xe1\xf8\x67\x6f\xa7\xde\x1c\xe7\x5e\x5e\xde\x47\x00\x00\x00\xff\xff\x61\x16\xf4\x09\x81\x03\x00\x00")

func indexHtmlBytes() ([]byte, error) {
	return bindataRead(
		_indexHtml,
		"index.html",
	)
}

func indexHtml() (*asset, error) {
	bytes, err := indexHtmlBytes()
	if err != nil {
		return nil, err
	}

	info := bindataFileInfo{name: "index.html", size: 897, mode: os.FileMode(420), modTime: time.Unix(1485460952, 0)}
	a := &asset{bytes: bytes, info: info}
	return a, nil
}

var _libJs = []byte("\x1f\x8b\x08\x00\x00\x09\x6e\x88\x00\xff\xc4\x3b\x4b\x73\xe3\x38\xce\x77\xff\x0a\x96\x7a\x0e\x72\xa2\xd8\x49\xfa\xab\xef\xd0\xee\xec\xd6\xf4\x6b\x92\xda\x9e\xf4\x4c\xd2\xb3\x73\x70\xb9\x52\x8a\x45\xdb\xea\xc8\x92\x5b\x92\x13\x7b\x32\xfe\xef\x0b\x80\x6f\x4a\x7e\xa4\xf7\xb0\x3a\x38\x12\x09\x02\x20\x00\x82\x00\xc8\xf4\xfb\x8f\x71\xc9\x2e\xd3\xf7\xec\x82\x7e\xff\xfe\x9b\x3d\x6f\x06\x1d\xd1\xfc\x2e\x9d\xfe\x99\x4e\xa1\x47\xbe\xc8\x4e\xec\xaa\xf2\xe2\x09\x3a\xe8\x8f\x6c\xc6\xf7\x5e\x12\xd7\x31\x40\x3f\xd1\x30\xa7\xf5\x32\x1d\xcb\xa6\x4e\x38\x59\xe6\xe3\x3a\x2d\xf2\xf0\x5d\xf7\xb9\xc3\xd8\xbb\xde\x2f\xbc\x86\x4e\xdd\xfc\xc7\xcd\x55\x34\x8e\xb3\xec\x3e\x1e\x3f\x74\x19\x82\xe0\x83\x74\xc7\x45\x3e\x91\xb8\xad\xd6\x92\xc7\xc9\xda\x46\xc0\xcb\xb2\x28\xa3\x92\x57\xcb\xac\xae\xba\x0a\x01\x93\xc3\x7b\x80\x1f\xa0\xe1\xd7\xef\x18\xcf\xca\x0a\x7a\xe4\xc0\xe1\xe9\xc8\x07\xb8\x4f\xf3\x2a\xfd\x8b\xdb\x40\x67\x16\x90\xe4\x39\x14\xd0\x5d\xd9\xa1\x58\x4d\x5e\xdf\x7d\x5f\xf2\x25\xef\xd1\x6f\x78\xae\xfa\x7b\x09\x9f\xf0\x32\x4c\x5e\xf7\xbe\x55\x45\x1e\x21\x63\xec\x98\x05\xfd\x2c\xad\xea\x60\x1f\x90\xe2\xc8\x00\xc6\x4f\x71\x5a\xff\x9c\x65\x21\x89\xa5\x3b\xe8\x28\x1e\xde\xc1\xfc\xe2\xd2\x91\x34\xc8\xa6\x83\x9d\x9b\xd0\x53\x5f\xb7\xeb\x28\xea\x96\x84\x78\xdb\x2b\xf9\x14\x3e\x3f\x15\xe5\xdc\xc6\x92\x80\x92\x58\xbf\x6f\x3a\x3b\x52\x5b\x20\xce\x8e\x52\x11\xf6\x5d\x2f\xe7\xce\x77\x35\x90\x9f\x13\x81\xf1\x39\xc0\x21\xc1\x9b\xe1\x28\x0a\x2a\x4e\x2f\x1b\x8d\xcb\x63\xbd\xe2\x19\xa7\x37\x65\x21\x08\x85\x13\x00\xa0\xa1\xd0\x09\x60\x0d\xb1\x35\xbd\x38\x1d\xa4\x6f\x35\x0b\x83\xf4\xf8\x58\x1b\x05\x8e\xe8\x2d\x96\xd5\x2c\x44\xd2\xdd\x8e\x51\x58\xbf\xff\xf5\xcb\x87\x2f\xec\x46\x0d\x63\xb7\x8a\x62\x8f\xfa\x35\x03\x4a\xf0\xa2\x01\x25\x1f\x24\xe9\xa3\xa5\x39\x20\x11\xe2\x8f\x6e\xe1\x79\x0d\xba\x34\x1a\x5b\x2c\x78\x9e\x78\xa3\xd0\x98\x90\xa7\x2f\x8b\x9a\xd8\x52\x82\x00\x3b\x88\xc1\xf0\xee\xca\x38\x9f\x72\x5b\x20\x19\xcf\xa7\xf5\xcc\xac\x97\x92\xd7\xcb\x32\x67\xbf\xc6\xf5\xac\x57\x16\x4b\x20\x20\x20\xd8\x11\x3b\x67\x7d\x76\x76\xda\x45\x03\x3a\x09\xe0\xb7\x0d\xe6\xb5\x80\xb1\x28\x4b\x66\x76\x2a\xc1\x12\x4b\x8f\xc7\xe3\x99\x31\x21\x14\x6f\xc4\x52\x03\x28\x64\x0c\x06\x2d\x46\x84\xf5\x2c\xad\xba\x0d\x21\x82\xc9\xcd\x8b\x47\xae\x85\xa5\x35\x9d\x3e\x02\x23\xde\x68\x0f\x26\x4d\x00\x24\x10\x7a\xc7\x69\xa6\x56\x3f\x8c\xd7\x72\xcf\xe2\x7b\x9e\x05\xf6\x68\xa1\x96\xba\x2e\xc3\x00\x8c\x28\x00\xbe\x93\x46\x77\xcd\x57\x75\xe8\xb6\x93\x6b\xe4\x19\x32\x66\xa1\x17\x1c\xc2\x54\xc6\x59\x5c\x55\x3c\x21\x9c\xf3\x13\x70\x12\x75\x59\x64\x80\xbc\x2e\x97\xbc\x2b\xc9\xa5\x49\x83\x1a\x42\x0f\xc5\xca\x18\x09\x53\x05\x8c\xdb\x00\x86\xe9\xc8\x96\x61\xb1\x40\xe1\x37\xe7\x46\x36\x69\x2c\xde\xea\x71\x6d\xd3\x08\x43\x4e\x66\x1b\x42\xc1\xfd\x63\x9c\x2d\x39\x4c\xc0\xb8\x86\x86\xca\xd5\x23\xcd\x33\xf5\xba\x36\x5b\x30\x0b\xbb\x7c\x11\xea\xa4\xf7\x99\x06\xed\xa5\x40\x9a\x7c\x09\xde\xeb\x78\xce\x77\x61\x45\x3b\xc8\x01\x66\xe0\xb5\x89\x49\xd8\xad\xa0\xaa\x1e\xd0\x04\xe5\xe1\x72\x76\xa6\xd7\xe4\x01\x86\xa3\x5d\xcd\xea\x39\x68\x16\x79\x78\x83\x56\x8d\x5a\x1c\xa2\xf9\x4b\xbd\xf3\xe4\x2a\x4f\xf8\x6a\x44\x5c\xe2\x12\x67\x42\x0c\xbb\x81\x05\x8c\x2f\x1a\x9c\x04\x58\xf3\x4e\x12\x83\x26\x97\xe8\x41\x76\x8c\xfa\xdc\x10\x03\x3e\xc2\x8a\xd1\xed\x93\x11\xe7\x45\x02\xab\xbe\x47\x16\x85\x0b\xca\x76\x7b\xca\xd7\x75\x1c\xf9\x37\x85\xdd\xea\x24\x5a\xdd\xad\x1a\x94\xe6\x8b\x65\xfd\xf2\x61\x15\xb2\xa8\xc6\x6a\x48\x6a\xd8\xb6\x54\x68\xa1\xdb\xce\x09\x55\x55\xf1\x26\x78\x55\xaf\x33\x1e\x06\x4f\x69\x42\xf6\x1f\x9c\xfd\xff\xe9\x62\x15\x74\xd5\xfe\x24\xfc\x23\xbb\xfa\xc0\xe2\x3c\x61\x53\x88\xa4\xaa\x3a\xae\x79\xaf\xe1\x1f\x48\xb2\xca\x7f\xe8\xd8\xa4\xdb\x91\x1e\x9e\x36\x58\xb9\xc1\x57\x6e\x8c\x40\x7b\x3b\x99\xbe\xea\x2e\x70\xca\xb5\xfe\x54\xb0\x3d\xb9\x71\x92\xfd\x2f\xe7\x8e\x10\x83\x57\x7a\x03\x06\x57\x68\x6b\x57\xef\xde\x86\xb8\xd9\xc0\x99\xd8\xc1\xa1\xed\x74\x00\x7f\xde\x9a\x48\x02\x3e\x61\x1f\xb7\x16\x89\xdc\xa3\x90\x77\xcf\x21\x36\xa8\x39\x7a\xdb\x61\x78\x1a\xb8\xdf\x07\x77\x5d\x15\x19\xef\x65\xc5\x14\x1d\x67\xc4\x8c\x10\x05\xae\x15\x06\xc4\xbc\x57\x2d\xb2\x14\x66\x7b\x62\x29\x52\xce\x4b\xc8\xde\x5d\xd4\xc8\x64\xf0\x06\xd9\x8e\xdc\x76\x50\x62\x59\x43\xcf\xf1\x0a\xc2\x50\xaf\x0f\x8c\x4b\xf4\x58\xb1\xe7\xc6\x0e\x5d\x5c\x6d\xb5\x28\xf8\x7a\xe9\x04\x70\x77\x18\xc0\xc9\x41\x71\x39\x5d\xce\x61\x13\xa8\x7a\x72\x21\xff\x93\x85\x7a\xd0\x05\xbb\x8b\x04\xa2\x2e\x7b\x63\xab\xc2\x10\x90\x31\xf4\xc1\xb8\x11\xde\x45\x8b\x2d\x02\xa3\x1c\x46\x3d\x56\x9c\x8a\xc1\xa9\xf1\xd7\x97\x14\xcb\x91\xc9\x81\x22\xc9\x7a\xa4\x54\x82\xeb\x2f\xd7\x1f\x03\x25\xbc\xe0\xdf\xef\xed\xf7\xbb\xdb\xdf\x6f\xbe\x9a\x86\x7f\xdd\x98\xf7\x5f\xfe\xbc\xb3\x3f\xaf\xae\xbf\x7e\xbc\xb9\xf3\x00\x6c\x64\x02\xc0\x6e\xf9\xfc\xe5\xe7\x0f\x1f\x3f\x04\xf0\x39\x92\xbc\x2d\xf3\x94\x42\xa7\x61\xf0\xee\x37\x5c\xc5\x9f\x6e\x7e\xfe\x25\x18\xfd\xcf\x63\xba\xba\xa8\xe3\xec\xb3\xf2\xd8\x9a\xae\xb4\x1c\x37\xf9\xca\x68\x11\x76\x5c\x9b\x86\xc5\xf3\xd1\x89\xf3\xca\xc6\xf6\x99\xb1\xe3\x0b\x16\x1e\x97\x10\x5a\xc0\xa6\x76\x42\xaf\x64\xde\x96\x13\x72\xa6\x97\x11\x83\xf0\x73\x79\x48\x66\xb8\x23\x03\x54\x49\x9a\xe1\x27\x9d\x30\xd1\xd7\x65\xf5\xac\x84\xec\x95\x3e\x06\x3b\x53\xcc\x2d\x59\xa3\x6c\x56\x46\xd7\x48\x1a\x65\xbf\x52\x7c\x23\x5f\x6c\xcf\x39\xcf\x9b\xdd\xe7\x69\xb2\x6a\xe1\x07\x07\x36\xc5\xdf\x8c\x5e\x5c\x44\xc3\x64\x84\x5b\x95\x2f\x79\x95\xdf\x2e\x4a\x27\xb9\x7d\xad\xb9\x69\x4b\x6d\x05\x43\xdb\xd2\xda\xed\x39\x2b\x89\x2c\xd8\x0f\x47\xa2\x3b\x00\xce\x49\x94\x77\xa4\xca\x38\x39\x1b\xae\x25\x53\xde\x90\xd5\xb5\xe4\xc9\xb8\x03\x4c\xa6\xda\x15\x99\x74\x53\x7f\x4c\x44\xe2\x6b\x96\xfb\x15\x6e\xff\x11\x79\x25\x7a\xd5\x9d\x3b\x72\x59\xa3\x38\x93\x47\x59\xe1\xfc\x91\x95\x10\x99\xf8\x49\x66\xcf\x66\x84\x13\xaa\x78\x69\xc7\x14\x7c\xc2\x22\x88\x28\xe7\x70\x30\xf8\xe9\x90\x08\x8b\x83\x6b\xe8\x8a\xb3\xf4\x2f\x9e\xb0\x5f\x79\x3d\x2b\x12\x4b\x82\x7a\x6a\x72\x17\x3d\x38\xe5\x71\xa9\x6b\x34\x07\x64\x2e\xcc\x4e\xa8\xc5\xe2\x6b\x03\x69\xcf\x62\xd8\xfe\x44\x86\xfd\x48\x2e\xc3\x4c\x6e\xd0\xec\x6d\xe4\x1b\xec\x05\x29\x87\xc1\x4c\x53\x85\xd5\xbb\x93\xc0\x0e\x3d\xfe\xe1\x2d\x26\x6d\xa1\xff\x9d\xee\x34\x9a\xc3\x74\x47\x93\x37\xfa\xa3\x15\xbe\x0d\x6c\xab\x0e\xa9\x77\xbf\x1e\x05\xd8\x0f\xe8\x12\x9f\xed\xfa\xc4\xa7\x4d\xa7\x44\xee\x05\x7a\xb5\xa8\x90\x18\x5a\x75\xdb\x42\x0c\xb7\x30\x23\x3c\x15\x49\x5d\x5c\xb0\xb3\xad\xa4\x8c\x92\x16\x65\xb1\xe0\x65\xbd\x46\xdf\x50\xc5\xf7\x19\x4f\x54\xfd\xa1\xc5\xae\x2c\x27\x2f\x62\x3b\xca\x2c\x1c\xbf\xe8\x47\x26\xcf\x01\xd2\x0a\xde\x18\x8a\x76\x38\x1d\x05\x68\xc5\x10\xbb\x5a\x4b\xde\xee\x6f\x52\x94\x05\xbd\x83\xa3\x49\x84\x77\xa3\x49\x6c\x19\xb8\x71\xb1\x89\x27\x21\xb0\x3f\xa2\xc2\xf7\xfb\x38\x7f\x8c\x2b\x76\x03\x26\xc5\x21\x6e\xf8\x2d\x2e\x21\xb3\x05\xf3\xab\x64\xfd\xaf\xa2\x5d\x04\x33\xac\x3f\x31\x0f\x63\x97\x3c\x9d\xce\xc0\xb9\xaf\x8a\xc9\x04\x33\xa1\x88\xad\xe5\xdb\x51\x5f\x6c\x21\x02\x61\xab\xac\xfa\x47\x0b\x83\x1f\x73\x1c\x09\x4c\x43\xf1\xc1\x4d\x62\x46\x14\xec\xc8\x84\x32\x40\xbb\x41\x12\xb7\x9b\xd6\xcd\x26\x60\x7c\xd0\xd9\x46\x79\x96\x8e\x45\xd1\xd4\xa1\x6d\x55\x67\x55\x13\x6d\x9e\x76\x03\x6a\xd0\xfe\x46\x8d\x5b\x74\xe2\x65\x5d\xb0\xac\x88\x93\x56\xf4\xd5\x55\xb2\xb2\x07\xcf\xd3\xdc\xf9\x8c\xdd\xde\xb8\x76\x48\x8f\x79\x96\xdd\xc2\x8e\x64\xb7\x89\x79\xbb\x60\x24\x55\xcd\x93\x99\xd8\x6d\x5d\xa6\xf9\xd4\xd6\x4d\xe1\x2e\x1d\x69\x27\x05\x06\x4d\x18\x3a\x50\xe9\xa4\x10\x41\xab\x0e\xb0\x0b\x8c\x67\x3b\xf6\x52\x79\x59\x48\xad\xe0\x9d\xb0\x5a\x50\x3f\x38\xb4\xc6\x67\x6f\x78\x4d\x0c\x76\x9b\xd3\xcb\x5a\x98\x9f\xf2\x9c\x97\xb0\xc8\x7f\x5f\xf2\x72\xfd\x47\x99\xf9\x65\x7e\x8f\xf7\x98\x62\x45\x62\x77\x98\x40\xe8\x3b\xf2\xfa\xef\x9d\xfe\xb3\x46\xff\x92\x28\x04\xfd\x29\xaf\xcf\x13\xb4\xa8\x3e\x4a\xd6\xd6\x52\x18\x53\x4a\xd3\x6c\xbf\xb7\xdb\xd1\x9e\xf4\x27\xe2\xd1\x1f\x68\x96\xf4\x81\x9e\x39\x68\x0a\x01\x38\x68\x11\x43\x49\x7e\x00\x52\xa8\x32\x5d\xd9\x22\x10\x26\xa5\x97\xbd\x5e\xf5\x11\xda\x68\xa4\x0d\x13\xde\x8a\xac\x28\x6f\x21\x6a\xe6\x4d\xa1\x8d\x6b\xc4\x29\x50\x29\xf7\x07\x02\x78\x0f\x1b\x2c\xed\xd4\xe7\x10\x62\xd9\xf6\xa0\xab\x20\x2b\x51\x05\x59\xb1\xb7\x48\x4e\x7a\x3d\xf8\x76\xcb\x20\xde\xa0\xb5\x18\xb4\x16\x83\x40\x47\x7a\xdc\xba\x6d\x1c\x3e\xc0\x60\x6f\x92\xc2\x54\xb0\xf2\x84\xac\xea\xc9\x84\x88\x62\x35\x1a\xae\x47\x5d\xbf\x7c\x67\x0f\xbc\xc1\x82\x8f\x72\x8d\xc7\xc0\xf0\x91\x25\x9a\xb5\x6e\x5f\x3b\xed\xcd\xb7\x06\x8d\x4d\xa7\xf9\xde\x54\x5b\xbb\xd3\xd5\xd2\xc7\xc9\xc8\xca\x14\x4e\xe9\x73\x31\x05\xf9\x27\xc5\x3c\x4e\xf3\x70\x08\x8e\x08\x18\x3b\xeb\x9d\xa2\x46\x57\x23\x88\xb6\xa9\xde\x38\x0c\x5e\x7d\xfa\xf4\x11\xf3\xf6\x57\x9f\xce\xce\x83\x91\x5f\xff\x33\x12\xda\xb1\x60\xf0\xc1\xcd\x3b\xad\xae\xe3\x6b\xe8\xdc\x59\x64\x26\x8c\xe1\xa9\xbf\x2d\x6f\x18\xcf\x2a\xbe\x7f\x60\xe3\xb8\xc2\x15\x5d\x8b\x0b\x52\x5e\x47\xd5\xa8\x3d\x90\x07\xdf\x4b\xb5\xd5\xe6\xb2\x46\x4d\xce\x83\xfd\x86\xb9\xe7\x00\xfe\x10\xec\xb7\x6d\x06\xa8\x8c\x5d\x3a\xf5\x61\x3a\x6a\xb3\x36\x65\xdd\x0a\xea\x5b\x2b\x94\xbd\x94\xfd\xf5\x8b\xb6\xe9\x18\x24\xad\xe3\x6a\xf8\x30\xda\xb2\x96\x5b\xf0\x3f\xa0\xfb\x3d\x7b\xa9\xa5\xe2\xa6\x78\xd3\x5a\xb4\xa8\x5a\xaa\x16\xea\xb1\x6b\x90\x0a\xc8\x03\x41\x03\xbe\x60\x57\x90\xa4\x83\xe3\x5b\xfb\x9d\x31\x4a\xf5\x64\x6b\x6f\x6d\xd5\x5e\x6d\x09\x12\xa5\xe6\x7e\x84\xee\x6a\x6b\x84\x6b\x1d\xc7\xc2\x52\xab\xab\x47\x88\xa9\x2a\x7e\x53\x3c\x55\x34\xae\xdb\x9b\xc7\x0b\x6b\x6b\x2b\x9e\xb6\x07\xca\xaa\x9c\x59\x3c\xb9\x83\x28\x66\xdc\x19\x5f\x13\x17\x58\xcc\x3f\x76\xcb\xb9\xcd\x07\x17\x26\xca\xee\x1f\xec\x71\x37\x46\x92\x14\x09\xf9\x71\x07\xd4\x66\x1f\xa9\x18\xbd\xf8\x21\xa4\x48\x65\x3f\x4a\x4a\x4a\xee\xb1\x6d\x61\xd0\xd8\x56\x37\xde\xde\xea\x96\xc0\xe9\x3c\xbb\x0d\x0c\xad\x48\x54\xba\xc5\x91\xb7\xbf\x30\x7c\x83\xb5\x91\x06\x20\xd8\x08\x66\x0c\x8e\x16\xdf\x70\xf2\x3e\xb8\x3c\xf5\x78\x1f\x67\x99\x8c\xd6\xd9\x27\x69\x0f\x3e\x37\x62\xe5\x87\x0e\x97\x46\x58\x56\x9c\xfb\xb5\xb8\x11\x11\xc4\xd6\x8d\x43\x0d\xc0\x4b\x2f\x54\x58\x05\xf6\x42\x8a\xc7\x23\x19\xa8\xfb\x7c\x2a\xb7\x6a\x45\x83\x3a\x04\x6c\x01\x5d\xa4\x2b\x3a\x37\xce\x58\x9f\x3d\xf9\x13\x31\x31\xb3\xef\x84\xf1\x69\x73\xc4\x14\xad\xeb\x8d\xbe\xd5\x27\xe3\x83\x96\x48\xa0\xe0\x61\x61\x14\x31\xb1\x6b\x19\x4a\x16\x52\x88\x32\x1b\x1e\x4f\x3d\xf7\x25\x8f\x1f\x5a\xad\x6a\x87\x8b\x54\xcc\x48\x12\x6f\xd9\xe9\xb6\xcd\x51\x49\x61\x0f\x32\xe5\xbd\x01\xf4\x09\x44\x1a\xa2\x5c\xc5\x4c\x05\x8a\x91\xaf\x04\xb9\x89\xb4\xf9\x3f\x93\x5e\x20\xe1\x5e\x43\x01\x5b\xe3\xf5\xed\xe9\xbf\xa4\x26\xd6\x89\xf8\x68\xdb\x5b\xd4\xc6\x74\x61\xe6\x73\xc4\xc2\xf0\x38\xc1\x58\x1f\x94\x90\xc8\x40\x7f\xdf\xe4\x1a\x8b\x4e\x1f\x10\x21\x78\xcb\xf2\x20\xeb\x85\xe4\xed\x83\x97\x7e\xfb\xc7\x6d\xcd\xc0\xc1\xe9\x5e\xc4\x69\xe9\x89\xf4\xf0\xb0\xe1\x65\x41\x03\x91\x12\xf2\x1c\xa6\x11\xfb\xe6\xc9\xc0\xd8\x87\x79\xd3\xc6\xe4\xb9\x01\xb5\x4e\x23\xe6\xae\x70\xf0\x3d\x8c\x9c\xcf\x53\x0a\xa9\x1d\xf5\x51\x45\x40\x56\x1f\x4c\x66\xad\x29\x38\xbe\xad\x9a\x63\xf6\x28\x88\x06\x91\x7c\x31\x5c\xda\x57\x61\x82\x57\xf7\x8b\x1b\xac\x55\x8b\x7a\x92\xab\x5b\xe9\x02\x1d\x41\x7f\xa7\x5d\x76\x5b\x1d\x5e\xa0\x67\x56\x96\xf5\x0c\x89\xed\xe6\xcd\x33\x59\xcf\xe6\xe4\x19\xac\x69\x43\x6d\xe7\xaa\xf1\x5c\xb4\x9e\x43\xb3\xa0\x0b\x2f\x38\x12\xfe\x60\x46\x05\x7f\xb0\x28\x18\xd7\x46\x9a\x42\x01\x07\xad\x01\x93\xf9\xf9\xe9\xa6\x1f\xb7\x7e\x37\xb5\x7c\x11\x6c\x88\x5a\x3e\x0c\x36\x70\x96\x71\x7f\x37\x25\x7d\x1d\x60\x69\xf7\x6f\xdb\xf6\xae\x0a\x3c\x88\x4a\x7f\xb1\xb4\x52\xc5\x99\xb4\x86\xd6\x89\xb3\xf6\x75\x8d\x47\xc3\x3b\xdd\x6a\x01\x85\x0d\x16\xfa\x47\xf2\x45\x14\xb9\xda\x56\x5a\xf3\xfe\xa3\x8d\xd0\xb2\x61\x53\xd1\xf2\xa9\xe8\x9a\x8b\xa0\x22\xac\xf8\x25\xc5\x34\x31\xc2\x2d\xa7\xc9\xb2\x94\x26\x22\x70\x8b\xc5\xf0\x02\xd4\x34\xc0\xc5\x2c\xca\x5b\x1e\xe2\x95\x76\xbc\x07\xa3\x96\x43\x5c\xe4\xaa\x54\xe6\xa1\x5f\xbf\x1c\xfd\xba\x0d\xfd\xba\x1d\x7d\xcb\x6d\x8a\xc3\x8e\xda\xab\xb6\x83\xf6\xca\x47\x9f\x7b\xf7\x30\xf7\xe1\x46\x78\x17\x31\x15\xf1\x3c\xac\x54\x31\x79\x01\x56\x84\x77\xb1\x52\x29\xd0\xc3\xaa\x4e\x16\x0f\x46\x4b\x03\x5c\xbc\xa2\x06\xe9\x21\x16\xc7\xb2\x07\xa3\x05\x70\x17\x29\x96\x47\x35\x4a\x77\x39\x75\xc4\xdd\x18\xfb\x76\xec\x65\x3a\xa6\xab\xb1\xd6\xfd\x83\xe4\x75\xf4\x53\x74\xab\x2f\x21\x5c\x02\x37\xb7\x0a\x56\xdd\x6f\x7d\xa7\x1b\xc5\xf5\x5a\xd5\x7e\x5f\x50\x06\x68\x79\x7e\x6c\xa1\xc3\x0c\xba\x9e\x32\x2e\x16\x5c\x1d\xfd\x8a\xda\xe2\x02\x3e\x11\xc6\x3b\xe3\x33\x77\x8a\x02\x80\x91\xa7\x21\xe6\x04\x07\x0f\x6f\xe2\x14\x7c\xad\x39\xbe\x11\x85\x55\x4a\x64\x76\xe3\x43\xa0\x43\x11\x66\x7c\x52\xef\x45\x88\x40\x87\x20\x84\x89\x34\xce\xb2\xac\x3b\x99\xf2\x46\x94\x3a\xdf\x92\x5f\x1d\xab\x56\x4e\xe1\xb7\xc1\x51\x2d\xe2\xdc\xe5\xc4\x8c\xd9\x47\x4b\xb8\x3d\x4d\x4c\x7d\x76\xec\x5a\xfd\x5e\x72\xde\x28\xbd\x7d\xa0\x84\xf5\x30\xd1\x4a\x40\x3f\x81\x9b\xcc\x13\xc8\x8c\xc1\x91\xe0\x25\xef\xb0\xf5\xdc\x85\x7a\xe8\x4e\x87\x42\x2c\xda\xb6\x9c\x3d\xf4\x0d\x69\xff\x9e\x5b\xf0\x4a\xb7\xeb\xf3\x34\x32\x41\xed\xdf\x0d\x47\xd4\x12\x62\xbd\xf9\xfc\xf4\xd4\x81\xd5\xc2\x30\xc0\xa2\x89\xa0\x5f\x2b\x60\x59\xff\x14\xe2\x51\x97\xdb\x2c\x6a\x4a\x72\x52\x68\x91\x83\x5d\x71\x47\x92\x93\x17\xe4\x5a\x01\x8f\x59\x80\x97\xe5\x5a\xc0\x5b\x48\x32\x17\x9a\xda\x84\xc2\x6d\xbe\x64\xaf\xc0\x6f\x77\xbb\xac\xd9\xb1\x1f\xf5\xeb\x9b\x76\x96\xca\xe4\xf9\x0c\xd5\xc0\x67\xe9\x38\x50\xf6\x94\x8e\xdf\xd7\x65\x36\x30\x9f\x78\xf1\xfa\x42\xbb\x01\xd9\xff\x81\xf4\x87\xcb\xa9\x71\x39\xd1\x64\xb7\x3b\x01\x3b\x74\x00\x86\x97\x06\xad\x73\xa1\x62\xa2\x6f\xe2\x61\x78\x8b\x47\x44\x11\xab\x67\x3c\x57\xf5\x55\x0a\x2c\x9a\xd8\xf4\xd7\xfd\xb2\xae\x0b\x63\xfb\xf2\xf0\x35\xa8\x96\xf7\xf3\x54\x98\xbf\x5c\x46\x76\x0b\xdd\x82\xcd\xd2\xf1\x43\x10\xd9\xff\x9e\xe0\x8b\x52\x4e\x5d\x1c\x45\x86\xdd\x6e\x03\xc0\xcc\x5a\x6d\xbf\x0a\x4a\x4a\x0e\x24\xe1\x21\xd1\xbd\x66\xbf\x6e\xc3\x32\xd0\x70\x2a\x7c\x54\xc7\x7c\x2a\x20\xc3\xcd\x08\x77\x18\xf5\x89\xdb\x2b\x72\x4c\x2f\xaa\x11\x77\x47\x6a\xc4\x17\xd5\x48\x5b\x5b\x28\x15\x2d\xbe\x54\x97\x0c\x5d\xc2\x73\x55\x0c\x56\x51\x8b\xd5\x22\x56\xa3\x65\xa5\x27\xff\xa7\xfb\xe4\xe2\xb3\x6d\xd4\xea\x55\xb3\x73\x6a\x13\xde\x6d\x47\x9a\x63\x5b\x4f\x0b\xbf\x00\xe0\xc4\xb4\xa1\x05\x2f\x69\xca\x95\x2f\xff\xc1\x41\x1e\x54\x89\x8b\xa8\xa6\x88\x7f\x29\x54\xf4\x5b\x9c\x73\xf7\x10\x0a\x8b\x4a\xd2\x9b\x49\xf2\xe8\xc3\xf0\x90\x57\xb5\xe1\x38\xa1\x1c\x44\x8e\xc5\x7d\xfd\x0f\x18\x0e\x0c\xac\x0a\xc1\x84\xfc\x16\xec\x19\xcd\xd3\x9e\x6d\xfe\xa9\x05\x10\xe1\x95\x2b\x71\xf6\x4e\x57\xe7\xcd\x65\x4a\x95\x6d\x39\x4b\x4e\x20\x37\x4d\xea\xde\x1d\xdd\x6a\xa3\xab\x6c\xcd\xa9\x22\x0c\xfd\x3f\x54\x18\x04\x91\x23\xba\x0d\x06\x1a\xdf\x28\x51\x8a\xd4\x25\xc8\xff\x04\x00\x00\xff\xff\xbf\x60\x2b\xee\xbf\x35\x00\x00")

func libJsBytes() ([]byte, error) {
	return bindataRead(
		_libJs,
		"lib.js",
	)
}

func libJs() (*asset, error) {
	bytes, err := libJsBytes()
	if err != nil {
		return nil, err
	}

	info := bindataFileInfo{name: "lib.js", size: 13759, mode: os.FileMode(420), modTime: time.Unix(1485544531, 0)}
	a := &asset{bytes: bytes, info: info}
	return a, nil
}

var _libCss = []byte("\x1f\x8b\x08\x00\x00\x09\x6e\x88\x00\xff\x8c\x90\x5d\x6a\xc3\x30\x10\x84\xdf\x7d\x0a\x41\x28\x85\x80\x89\x2b\xea\x06\x9c\x37\x83\x4f\xd0\x13\xac\x2d\x45\x5e\xaa\x1f\x23\x29\x6d\x68\xc9\xdd\x2b\x7b\x65\x5c\x4a\x28\xd5\x9b\xbe\x65\x76\x66\x67\xa7\xe5\x39\xb2\xaf\x82\xa5\xf7\x81\x22\x8e\x0d\xe3\x55\x35\x5d\x4f\x0b\x99\x5c\xc0\x88\xce\x36\x0c\xfa\xe0\xf4\x25\x4a\xe2\xb3\xa8\x61\x15\x7d\xa2\x9b\x92\xa8\xa6\xcf\x28\x51\x8d\x69\xf6\x54\x55\x0f\x44\x7a\x18\xde\x94\x77\x17\x2b\xca\xc1\x69\xe7\x1b\xb6\x6b\xdb\xf6\x54\xdc\x8a\x62\x67\x00\x6d\x36\x37\x68\xcb\x55\x7c\xdc\x12\xdc\x51\x77\x5d\x47\x33\x03\x5e\x25\x15\x85\xf9\x91\xfa\xb0\x67\xaf\x60\x24\x83\xb0\x04\x7d\x0c\x74\x19\xdb\x1f\x16\xd3\x94\xf7\x8e\x27\xaf\xff\xb0\xe4\x2f\x75\xd7\x1e\x69\x4c\x6c\x4b\x91\x5b\xdb\x0e\x7e\x97\x3e\xe2\x00\xba\x04\x8d\x2a\x55\x67\x50\x08\x9d\x8b\x8b\xf2\x1a\x57\xee\x67\x63\xc2\x67\x67\x63\x19\xf0\x53\xa6\x3d\x3c\x57\x0f\x42\xa0\x55\xa5\x5f\xfb\xfc\xd7\x75\x1a\x7a\xa9\xe9\xba\x75\x01\xd5\xf3\x9c\xe5\xbf\xd6\xf2\x19\xdf\x8a\xef\x00\x00\x00\xff\xff\xe9\xf4\xef\xcc\x06\x02\x00\x00")

func libCssBytes() ([]byte, error) {
	return bindataRead(
		_libCss,
		"lib.css",
	)
}

func libCss() (*asset, error) {
	bytes, err := libCssBytes()
	if err != nil {
		return nil, err
	}

	info := bindataFileInfo{name: "lib.css", size: 518, mode: os.FileMode(420), modTime: time.Unix(1485462180, 0)}
	a := &asset{bytes: bytes, info: info}
	return a, nil
}

// Asset loads and returns the asset for the given name.
// It returns an error if the asset could not be found or
// could not be loaded.
func Asset(name string) ([]byte, error) {
	cannonicalName := strings.Replace(name, "\\", "/", -1)
	if f, ok := _bindata[cannonicalName]; ok {
		a, err := f()
		if err != nil {
			return nil, fmt.Errorf("Asset %s can't read by error: %v", name, err)
		}
		return a.bytes, nil
	}
	return nil, fmt.Errorf("Asset %s not found", name)
}

// MustAsset is like Asset but panics when Asset would return an error.
// It simplifies safe initialization of global variables.
func MustAsset(name string) []byte {
	a, err := Asset(name)
	if err != nil {
		panic("asset: Asset(" + name + "): " + err.Error())
	}

	return a
}

// AssetInfo loads and returns the asset info for the given name.
// It returns an error if the asset could not be found or
// could not be loaded.
func AssetInfo(name string) (os.FileInfo, error) {
	cannonicalName := strings.Replace(name, "\\", "/", -1)
	if f, ok := _bindata[cannonicalName]; ok {
		a, err := f()
		if err != nil {
			return nil, fmt.Errorf("AssetInfo %s can't read by error: %v", name, err)
		}
		return a.info, nil
	}
	return nil, fmt.Errorf("AssetInfo %s not found", name)
}

// AssetNames returns the names of the assets.
func AssetNames() []string {
	names := make([]string, 0, len(_bindata))
	for name := range _bindata {
		names = append(names, name)
	}
	return names
}

// _bindata is a table, holding each asset generator, mapped to its name.
var _bindata = map[string]func() (*asset, error){
	"index.html": indexHtml,
	"lib.js": libJs,
	"lib.css": libCss,
}

// AssetDir returns the file names below a certain
// directory embedded in the file by go-bindata.
// For example if you run go-bindata on data/... and data contains the
// following hierarchy:
//     data/
//       foo.txt
//       img/
//         a.png
//         b.png
// then AssetDir("data") would return []string{"foo.txt", "img"}
// AssetDir("data/img") would return []string{"a.png", "b.png"}
// AssetDir("foo.txt") and AssetDir("notexist") would return an error
// AssetDir("") will return []string{"data"}.
func AssetDir(name string) ([]string, error) {
	node := _bintree
	if len(name) != 0 {
		cannonicalName := strings.Replace(name, "\\", "/", -1)
		pathList := strings.Split(cannonicalName, "/")
		for _, p := range pathList {
			node = node.Children[p]
			if node == nil {
				return nil, fmt.Errorf("Asset %s not found", name)
			}
		}
	}
	if node.Func != nil {
		return nil, fmt.Errorf("Asset %s not found", name)
	}
	rv := make([]string, 0, len(node.Children))
	for childName := range node.Children {
		rv = append(rv, childName)
	}
	return rv, nil
}

type bintree struct {
	Func     func() (*asset, error)
	Children map[string]*bintree
}
var _bintree = &bintree{nil, map[string]*bintree{
	"index.html": &bintree{indexHtml, map[string]*bintree{}},
	"lib.css": &bintree{libCss, map[string]*bintree{}},
	"lib.js": &bintree{libJs, map[string]*bintree{}},
}}

// RestoreAsset restores an asset under the given directory
func RestoreAsset(dir, name string) error {
	data, err := Asset(name)
	if err != nil {
		return err
	}
	info, err := AssetInfo(name)
	if err != nil {
		return err
	}
	err = os.MkdirAll(_filePath(dir, filepath.Dir(name)), os.FileMode(0755))
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(_filePath(dir, name), data, info.Mode())
	if err != nil {
		return err
	}
	err = os.Chtimes(_filePath(dir, name), info.ModTime(), info.ModTime())
	if err != nil {
		return err
	}
	return nil
}

// RestoreAssets restores an asset under the given directory recursively
func RestoreAssets(dir, name string) error {
	children, err := AssetDir(name)
	// File
	if err != nil {
		return RestoreAsset(dir, name)
	}
	// Dir
	for _, child := range children {
		err = RestoreAssets(dir, filepath.Join(name, child))
		if err != nil {
			return err
		}
	}
	return nil
}

func _filePath(dir, name string) string {
	cannonicalName := strings.Replace(name, "\\", "/", -1)
	return filepath.Join(append([]string{dir}, strings.Split(cannonicalName, "/")...)...)
}


func assetFS() *assetfs.AssetFS {
	assetInfo := func(path string) (os.FileInfo, error) {
		return os.Stat(path)
	}
	for k := range _bintree.Children {
		return &assetfs.AssetFS{Asset: Asset, AssetDir: AssetDir, AssetInfo: assetInfo, Prefix: k}
	}
	panic("unreachable")
}
