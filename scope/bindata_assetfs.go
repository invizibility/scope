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

var _libJs = []byte("\x1f\x8b\x08\x00\x00\x09\x6e\x88\x00\xff\xc4\x3c\x5d\x53\xe3\x48\x92\xef\xfe\x15\x15\xea\x7d\x90\x40\xd8\x40\xdf\xed\x43\x33\xec\xc5\x40\x37\x03\x71\x3d\xf4\x2c\xf4\xdc\xdc\x1d\xe1\x20\x84\x25\x6c\x75\xcb\x96\x47\x92\xc1\x5e\xd6\xff\xfd\x32\xb3\xbe\x4b\x25\x7f\xcc\xdd\xc4\xe9\xa1\x91\xaa\xb2\xb2\xb2\xb2\xb2\xb2\xf2\xcb\x3d\x18\xbc\x24\x15\xbb\xce\x2f\xd9\x39\xfd\xfb\xcf\x7f\xb2\xb7\xf5\x59\x8f\x37\x5f\xe4\xe3\xdf\xf2\x31\xf4\x88\x17\xd1\x89\x5d\xf5\xac\x7c\x85\x0e\xfa\x23\x9a\xf1\xbd\x9f\x26\x4d\x02\xd0\xaf\x34\xcc\x6a\xbd\xce\x47\xa2\xa9\x17\x3e\x2f\x66\xa3\x26\x2f\x67\xe1\x45\xf4\xd6\x63\xec\xa2\xff\x53\xd6\x40\xa7\x6a\xfe\xf5\xee\x26\x1e\x25\x45\xf1\x94\x8c\xbe\x47\x0c\x41\xf0\xc1\x79\x47\xe5\xec\x59\xe0\x36\x5a\xab\x2c\x49\x57\x26\x82\xac\xaa\xca\x2a\xae\xb2\x7a\x51\x34\x75\x24\x11\x30\x31\xbc\x0f\xf8\x01\x1a\xfe\x75\x3b\x46\x93\xaa\x86\x1e\x31\xf0\xe1\x78\xe8\x02\x3c\xe5\xb3\x3a\xff\x47\x66\x02\x9d\x18\x40\x82\xe6\x90\x43\x47\xa2\x43\x92\x9a\xbe\x7f\xfc\x7d\x91\x2d\xb2\x3e\xfd\x1b\x9e\xca\xfe\x7e\x9a\x3d\x67\x55\x98\xbe\xef\x7f\xab\xcb\x59\x8c\x84\xb1\x43\x16\x0c\x8a\xbc\x6e\x82\x6d\x40\x92\x22\x0d\x98\xbc\x26\x79\xf3\x63\x51\x84\xc4\x96\xe8\xac\x27\x69\xb8\xe8\x8f\x92\xd9\x4b\x52\x9b\x9c\x02\xe6\xf4\x24\x1b\x27\x59\x3e\x9e\x34\xea\xf3\x35\x4f\x9b\x49\x4f\xf3\x78\x0c\xf0\xb5\xfa\x5e\xaa\xb7\x95\x7a\x03\x9a\xce\x83\x40\x7d\x3e\x25\xd5\x35\xa1\x84\x09\xff\xf5\x58\xcf\xc3\xa9\xd0\x60\x7c\x05\x3d\x0d\xd0\x94\x4d\x52\x7c\xce\x66\xe3\x66\x62\xd2\x2a\x48\xd0\x12\xc1\xa1\x0b\x80\x39\x3e\x53\x4d\x02\xaa\xff\x5c\x56\x9f\x92\xd1\x44\x0b\x5b\x15\xb3\xdc\x1c\x8b\x4f\xc1\x0e\xcf\x59\x78\x58\xf5\xb3\x59\x1a\xb1\x23\x7a\xad\x9b\xa4\x6a\x22\x05\xb6\x8e\x0c\xd4\xcd\xa2\x9a\xb1\x42\x70\xb4\x67\x30\x67\x96\x66\xd5\x1d\xcd\x6c\x52\x3c\x6a\x96\x31\x5b\x96\xcf\xcf\x75\xd6\xc4\x6c\x25\x5f\x38\x89\xd0\x53\x83\xc4\x64\xd0\x21\xfe\x8e\xca\xa2\xac\x34\x89\x83\x81\xe0\x57\xb3\x04\xa4\x9c\x6b\xfd\x59\x99\x66\x61\xd4\x1f\x67\xcd\x65\x39\x6b\xb2\x65\x13\x06\xa7\x69\x10\xe9\xf5\x0f\x06\x20\x7d\x75\x59\x64\xfd\xa2\x1c\x87\xd3\x04\xe6\x83\x7f\xfa\x05\xb1\x33\xea\x29\x38\xe0\x0f\x0b\x11\x7d\x4e\xfc\x83\x3f\x3f\x08\xc2\x04\x2c\x34\x1d\x1e\xba\x0c\x03\x5a\xfa\xcf\x79\x51\xdc\x37\xab\x22\x43\xaa\x90\x64\x0b\x82\x84\xe3\x04\xba\xf8\xea\xc4\xae\x3d\xe4\xc3\xfe\x55\x55\x4e\xa3\x36\xec\xa9\x0f\xf6\x6b\xd9\x86\x04\x79\x22\x99\x44\xf8\x53\xd8\xac\xe5\x89\x0f\x64\x22\x45\x6e\xe5\xe2\xfc\x39\x59\xb6\x91\xae\x90\x54\x2d\xa9\x47\x1a\x85\x77\xdd\x77\xd9\xa8\x09\x97\x70\xf2\xc4\xae\xe2\xdb\x09\xec\x20\xfc\x5d\xa9\x96\x15\xb4\x48\x62\x63\x8d\xd0\xd8\xa4\x75\x4f\xff\x8b\x54\x3c\x72\x09\x7a\x6c\x2b\x31\xa9\x67\x5c\xa9\x9f\xe6\x28\x69\x37\xa0\x67\x66\x79\xb3\x3a\xb3\xfb\x12\x14\x98\x23\x7f\x27\x67\x35\x2a\x81\x87\xa1\xdd\xc1\xe9\xf7\xf4\xc8\x95\x81\x9c\x58\xed\x1d\xcd\xf2\xf8\x42\x87\x71\x92\xd5\xf1\xdd\x7e\x52\x53\x57\xea\x48\x1d\x31\x3c\xa9\x61\xaa\x8f\x6a\x2a\x8e\x6a\xc4\x0e\xb8\xb2\x62\x03\x35\x61\x6b\x38\xad\x1a\x50\x80\x02\xa5\xd7\xcf\xf9\x2c\x4b\x2a\x38\x49\x69\x39\x4d\xf2\x59\xf8\x80\xa8\x39\xbe\x98\xc9\x69\x86\x51\xbf\x4a\x66\xe3\x2c\x7c\x38\x8e\xd9\xeb\xd0\x96\x1e\xc1\xc8\xfe\x7c\x51\x4f\x42\x7a\x77\xfa\x05\x3f\x39\x00\xff\xb0\x21\xa4\xc0\x9c\xb3\x57\xbf\xba\xa1\x9d\x6f\xf3\x27\xa9\x2a\x97\x43\xd0\xb4\x03\x1f\xf1\xc9\x9f\x19\xac\x0e\xce\x02\xfb\x1b\x0a\x8a\x0f\x04\x1f\x2e\x43\x04\xd8\xea\x5f\x6f\x40\xfa\x03\x4a\x66\x27\x52\x12\xda\x5d\x90\xae\xbd\x0a\x98\x84\x71\xeb\x4e\xc2\x2c\xa8\xf3\x96\xd6\xee\xa9\x23\x3e\xb4\xd1\x91\x02\x33\xb0\x7d\xa9\xd2\x7c\x96\x14\x21\x7d\x4f\xb2\x69\x76\x99\x34\xd9\xb8\xac\x56\x27\xc7\x91\x7d\x90\xf0\xa6\x1f\x57\xe5\x62\x96\xc2\xf0\xe0\xdd\xa7\xab\x4f\x81\x8d\x79\x2f\xb5\xed\x2a\x56\x8d\xbd\x05\x22\x74\x10\x68\x9d\x98\x69\x1d\xc3\x57\x17\x99\x16\x8b\xba\x05\x96\xf1\x2a\xe6\x90\x1e\xc0\x4e\x31\x93\xd7\x54\xeb\xd6\x34\xaf\x3b\xeb\x8e\xab\x41\xcd\x76\xde\x73\xa2\xd3\xbc\xeb\xc2\x3c\xb2\xf6\xd9\xaf\x15\x2d\x7b\xc5\x51\x83\xbf\xd3\xd6\xf9\xed\xaa\x7d\x34\xcc\xef\x5d\xf6\x15\xec\x18\x18\x28\x83\x00\x3e\x52\xb4\x0f\xb1\xf1\x03\xff\x22\x6d\x81\xdf\x47\xfc\x1b\x88\xa5\x21\xf8\x25\x8c\x1a\xaf\x14\xff\xae\x4d\x34\xa9\xf7\x23\x67\xe5\xdb\x17\x5e\x48\xf3\x68\xa3\x8a\x45\xc8\x45\x55\x70\x6b\xd7\xb4\x17\x89\x48\x81\x43\xd2\xac\x0d\x3e\x57\x7e\x82\x5f\xef\x3e\x07\x31\x20\xd2\x98\x05\xa3\x42\x68\x8c\x59\x37\x5f\xc5\x74\xb8\x4b\x67\xf6\x85\x6a\xa2\xbf\xb8\xb9\xbd\xbf\xf9\xef\x4f\x41\xdc\x62\x1b\x3e\x82\x49\xa1\x79\x7f\x9a\x0c\x1b\x4d\x70\x1f\x0c\x5e\xd5\x59\x91\xd1\x5b\xf4\x06\xe6\x90\xfa\x62\x79\x2d\x8e\xa3\x44\xa4\xec\x61\x05\x23\x7b\xec\x29\x8d\x79\xfa\x4b\x73\xa6\x47\x58\xaf\x34\x0b\x93\x6a\xbc\x98\x66\x33\x38\x49\x82\xaf\xff\xc6\xc2\xe5\x39\x7b\x8c\xf9\xc0\x88\x7d\x60\xcb\x33\x0b\xd5\x6a\x1f\x54\x2b\x1b\xd5\xca\x46\x25\x76\x7e\x1f\x84\x62\x88\x8d\x56\x34\xda\xc8\xa5\xd5\xb5\x33\x6a\x1a\x60\x23\xa6\x26\x1b\xad\xb2\xd4\x76\xc6\xcb\x47\xd8\x88\x79\x9b\x8d\x99\x3b\x78\x3b\xa3\x45\xbf\xc5\xc2\x09\x0d\x36\x42\xd3\x95\xd9\x19\xad\x1a\x64\x23\x57\xcd\x72\x0a\x81\x82\x00\x7a\x28\x6c\xeb\xd0\x71\xa6\xa3\xc8\x72\x9b\xef\xc9\xa5\xbd\x17\x9b\x7e\x55\x56\x53\x93\x2c\x3c\x83\x20\xf6\xba\xb3\x27\xee\x23\x70\x6e\x7b\xa6\x33\x77\xbb\x98\x5a\xdf\x74\x2c\xf0\xf3\x99\x63\x7c\x0b\x70\x48\xf0\xe1\x61\x18\x07\x75\x46\x2f\x6b\x85\xab\xf3\xc8\x09\x05\x80\x50\xb8\x00\x6d\x4d\x02\x56\xee\x6f\x9c\x1f\x9f\xe5\x3f\x28\x12\xce\xd0\xcb\x90\x4a\x03\x47\x70\x7b\x09\xa7\x36\x0f\xf9\x60\xf0\xf5\xcb\xc7\x2f\xec\x4e\x0e\x63\xf7\x72\xc6\x3e\xf5\x2b\x02\xa4\x1b\xcc\x1b\x50\xc9\x06\x69\xfe\x62\xf8\xd1\x30\x45\x88\xff\xa8\x16\xd8\x36\x3c\xea\xca\x7f\x9e\xcf\xe1\xf0\x3b\xa3\xd0\xb5\x47\x9a\xbe\xcc\x1b\x22\x4b\x32\x02\x6e\x8d\x04\x6e\xcf\x47\x32\x34\x4c\x86\x08\x7f\x4b\xa9\x43\xb1\xc9\x3f\x27\xcd\xa4\x4f\xd7\xba\x80\x00\xdb\xf5\x14\xec\x56\xb0\x2e\xd4\x4d\xe2\x83\x79\xcf\x61\x8c\x99\x05\x31\x1b\x37\xc1\x60\x4b\x3f\xb3\x2e\x40\x64\x6f\xeb\x66\x1f\x0c\xd0\xea\xa1\x11\x61\x33\xc9\xeb\xa8\xc5\x44\x10\xb9\x69\xf9\x92\x85\xa6\x82\x26\x36\xe4\x2f\xc2\x86\x32\x46\x3b\x30\x39\xd9\x49\x7c\xdf\x71\x99\xb9\xd1\x0f\xe3\x15\xdf\x8b\xe4\x29\x2b\x82\xc8\x31\x10\xfb\x49\xd3\x54\x61\x00\x42\x14\x00\xdd\x69\xab\x9b\x6c\x2a\xbb\x9d\xcc\xfe\x0c\x2f\x3f\x13\x3d\xa7\x10\x96\x32\x2a\x92\xba\xce\x52\xc2\x39\x3d\x82\xfb\xa8\xa9\xca\x02\x90\x37\xd5\x22\x8b\xc4\x74\x79\xda\x9a\x0d\xa1\x1f\xf8\xc9\x18\x0a\xdb\x3f\x2b\xba\x00\xd0\xed\x34\x78\x58\xce\x91\xf9\xed\xb5\x91\x4c\x6a\x89\x37\x7a\x6c\xd9\xd4\xcc\x10\x8b\xe9\x42\xc8\xa9\x7f\x49\x8a\x45\x16\x98\xd7\xb3\xc7\x98\xe3\x8f\x10\xcf\xdc\xe9\x5a\x77\x60\xe6\x72\xb9\x17\xea\xb4\xcf\x8d\x94\xad\x33\xd0\x4e\xee\x83\xf7\x36\x99\x66\x9b\xb0\xa2\x1c\xcc\x00\xe6\xcc\x69\x13\x61\x0e\xa3\x15\xb6\xaa\x0f\x73\xc2\xe6\xe1\x71\x0e\x36\x19\x36\x0c\x87\xa3\x5c\x4d\x9a\x29\xec\x2c\xd2\x40\x66\x21\xee\xe2\x03\x8a\xbf\xd8\xf7\x2c\xbd\x01\x4b\x62\x39\x24\x2a\xf1\x88\x33\xce\x86\xcd\xc0\x9f\x45\xb4\xc6\x9e\x11\x17\x81\x2e\xc5\xa6\x29\xce\xda\x54\x72\x3b\x71\xcb\x5c\xee\x38\x2e\xc5\xa8\xf6\x49\x88\x85\xff\x42\x12\x85\x07\xca\x54\x7b\x52\xd7\xf5\x2c\xfe\xb7\x99\xed\x55\x12\x5e\x75\x2b\x07\xe5\xb3\xf9\xa2\xd9\x7f\x58\x8d\x24\xca\xb1\x0a\x92\x1a\xba\x8e\x0a\x1d\x74\x53\x39\xe1\x56\xd5\x59\x1b\xbc\x46\xff\x2c\x0c\xc8\x9c\xc1\x21\x27\x7f\x3d\x9e\x2f\x83\x48\xde\x4f\x5c\x3f\xb2\x9b\x8f\x2c\x01\x6f\x00\x9c\x07\x06\x5e\x42\x93\xf5\x5b\xfa\x81\x38\x2b\xf5\x87\x8a\x14\x13\xdb\x50\xc3\x77\x5a\x75\x11\xbf\xdb\x49\xf4\x65\x77\x89\x4b\x6e\xd4\xa7\x84\xed\x8b\x8b\x93\xe4\x7f\x31\xb5\x98\x18\xbc\x53\x17\x30\xa8\x42\x73\x77\x0d\x1f\x44\x4e\xae\x2f\xf0\x8e\x88\x21\x5e\xe3\x6e\xb4\x50\xdc\x51\x48\xbb\xa3\x10\x5b\xb3\x59\xfb\xb6\x41\xf0\x14\xb0\x1d\xe3\x04\xcc\x31\xab\x33\xdb\xeb\x59\x92\x55\xdf\xaf\xe7\x45\x0e\xab\x3d\x0a\xda\x4e\x21\xf1\xde\x3e\xd4\x48\x64\xf0\x01\xc9\x8e\xed\x76\x72\xf5\xa0\xe7\x70\xf9\x70\x3c\x74\xfa\x40\xb8\x78\x8f\x91\x09\xb0\xfc\x13\x7b\xb7\x3c\x1b\x7c\xbb\x98\xee\x6f\xb8\xc3\x20\x9f\xe9\x4e\x5b\xa1\x27\x10\x19\x8d\x9d\x71\x23\xbc\x8d\x16\x5b\x38\xc6\x0e\x3b\x15\x8d\x53\xad\xaf\xaf\xc9\x96\x23\x91\x83\x8d\x24\xe9\x11\x5c\x09\x6e\xbf\xdc\x82\x8b\x27\xbf\xfe\xe3\xd2\x7c\x7f\xbc\xff\xfb\xdd\x57\xdd\xf0\xef\x77\xfa\xfd\xa7\xdf\x1e\xcd\xcf\x9b\xdb\xaf\x9f\xee\x1e\x1d\x00\x13\x19\x07\x30\x5b\x3e\x7f\xf9\xf1\xe3\xa7\x8f\x18\x9d\x19\x0a\xda\x16\xb3\x9c\x07\x3a\x83\x8b\x5f\xf0\x14\x5f\xdd\xfd\xf8\x53\x30\xfc\x7f\xb7\xe9\x76\x4d\x7c\xb4\xd2\x1e\x7b\x24\x3d\xb6\xa6\x3c\xd4\xdd\x69\xa4\x3b\xd6\xa8\x97\xae\x77\xc9\xd3\x6d\xc8\xc7\xb5\x43\xd9\x18\x36\xa4\xbe\x88\x35\x93\xaa\x7c\x65\xf4\x71\x66\xac\xb2\x9d\xf0\xeb\xc8\xe1\x89\x66\x29\x74\xad\x14\x9e\xe8\x97\x1b\xdf\xca\xde\xf9\x33\x80\xa7\xed\xee\xd3\x3c\x5d\x7a\xe8\xc1\x81\x9e\x38\x53\x8b\xfd\x36\xa2\x87\x74\x88\x57\x95\xcb\x79\x99\x6d\x9c\x57\x56\xaa\xf1\xbd\xa2\xc6\x97\x68\xe4\x04\x75\x07\xc3\xba\x22\x5c\xc4\xb2\x60\x3b\x1c\xb1\x6e\x07\x38\x2b\x6d\xb9\x21\x71\x89\x8b\x33\xe1\x3c\x79\xcb\x35\x49\x5d\xcb\xd9\xa4\x3b\x70\xf4\x3c\x56\xaa\x48\xbb\x9b\xea\xe3\x99\x3b\xbe\xfa\xb8\xdf\xe0\xf5\x1f\x93\x56\xa2\x57\xd5\xb9\x29\x7c\xa4\xa8\xd3\x7e\x94\x61\xce\x1f\x18\x0e\x91\xb6\x9f\x84\xf7\xac\x47\x58\xa6\x8a\xe3\x76\x60\x88\x77\x1e\xc4\xe4\x73\x58\x18\x5c\x77\x88\x9b\xc5\xc1\x2d\x74\x25\x45\xfe\x8f\x2c\x65\x3f\x67\xcd\xa4\x4c\x0d\x0e\xaa\xa5\x89\x5b\x74\x67\x97\xc7\x9e\x5d\xa1\xd9\xc1\x73\x61\xa6\x43\xcd\x0f\x9f\x0f\xc4\xef\xc5\xb0\xed\x8e\x0c\xfb\x23\xbe\x0c\xd3\xbe\x41\xbb\xb7\xe5\x6f\xb0\x3d\x5c\x0e\x8d\x99\x96\x0a\xa7\x77\xe3\x04\x1b\xf6\xf1\x57\xe7\x30\x29\x09\xfd\xdf\xed\x9d\x42\xb3\xdb\xde\xd1\xe2\xf5\xfe\xd1\x09\xef\x02\xeb\xdc\x43\xea\xdd\xbe\x8f\x1c\xec\x0f\xec\x25\x3e\xdd\xfb\x89\x8f\x6f\x4f\x69\xba\x3d\xf6\xd5\x98\x85\xd8\xe0\xdd\x5b\xcf\x64\x94\xf9\x52\xcc\x93\x96\xd4\xf9\x39\x3b\xe9\x9c\x4a\x6f\xd2\xbc\x2a\xe7\x59\xd5\xac\x50\x37\xd4\xc9\x53\x91\xa5\x32\xfe\xe0\x91\x2b\x43\xc9\x73\xdb\x8e\x3c\x0b\x7f\x8e\x40\xac\xe4\x2d\xc0\xb9\x82\x0f\x7a\x46\xd3\x9c\x8e\x03\x94\x62\xb0\x5d\x8d\x23\x6f\xf6\xb7\x67\x14\x01\xbd\x9d\xad\x49\x84\xb7\xad\x49\x6c\xe9\x8c\x7b\x82\x61\x7f\x40\x65\x48\x97\x3c\x2e\x7f\x47\x41\xf8\x98\xfd\x92\x54\xe0\xd9\x82\xf8\xd5\x22\xfe\x57\xd3\x2d\x82\x1e\xd6\x6f\x14\x9a\xe6\xf1\x54\x95\x86\x62\x2a\x07\xc5\x0e\x06\xfc\x0a\x69\x17\xbe\xe8\x32\x8b\x83\xb9\xc6\x8f\x3e\x8e\x00\xa6\xa1\xf8\xe8\xda\x18\xd3\x32\xe1\x01\x6d\xa3\x41\x4c\x6e\x36\xad\xda\x4d\x18\x5a\xee\x75\xcd\x3c\xc9\x47\x3c\x68\x6a\xcd\x6d\x44\x67\x65\x13\x5d\x9e\x66\x03\xee\xa0\xf9\x8d\x3b\x6e\xcc\x93\x2c\x9a\x92\x15\x65\x92\x7a\xd1\xd7\x37\xe9\xd2\x1c\x3c\xcd\x67\xd6\x67\x62\xf7\x26\x8d\x35\xf5\x28\x2b\x8a\x7b\xb8\x91\xcc\x36\x91\x0e\xb4\xc0\x44\xe6\xa5\xb5\xb0\xfb\xa6\xca\x67\x63\x73\x6f\x4a\xfb\xe8\x08\x39\x29\xad\xf4\x5b\xe9\xa4\xdf\x4a\xb4\x67\x7b\xe6\x51\xd9\xb7\x96\xc8\x5b\x4d\xb4\x67\x3d\xd1\x4e\x15\x45\x8e\x0e\xb1\xaa\x8a\x6c\xe2\xc7\xd9\x2c\xab\xe0\x90\xff\x7d\x91\x55\xab\x5f\x29\x8f\xd7\x15\x91\x42\xf0\x84\x6c\x45\x22\xf7\x21\x05\xd3\x77\xe8\xf4\x3f\x59\xfd\x27\xad\x7e\x9e\x29\xa4\x9c\xe7\x69\x8a\x12\x45\x69\x41\x73\x97\xc2\x24\x52\xe9\x42\xab\xfd\xc9\x6c\x47\x79\x52\x9f\x88\x47\x7d\xa0\x58\xd2\x07\x6a\xe6\xa0\xcd\x04\xa0\xc0\xc3\x06\x9e\x8c\x03\x17\xaa\xca\xad\xec\x1b\x17\x29\x5f\x85\x15\x95\x3d\x49\xc1\x14\xc9\xe6\x7b\x2a\xd1\x68\x31\x6d\xbf\x34\xbd\x11\x05\x59\xf2\x28\x08\x95\x3c\xa8\x02\x2b\xf8\x6e\x17\x4d\x19\x83\x56\x7c\xd0\x8a\x0f\x82\x3d\x52\xe3\x56\xbe\x71\xf8\x78\x4b\xae\x68\x31\x58\xdd\xf5\xb0\x1c\x3e\xac\x86\x91\x1b\xbe\x33\x07\xf2\x7a\x01\x5d\xaf\x04\xae\xa7\x66\x8d\x51\xb5\x64\xb5\xb7\xdf\x5a\x73\x98\x15\x1b\xeb\xce\x6d\xeb\x4a\x62\xfb\xcb\x2f\x3e\x97\x63\xbb\x92\x03\x08\x3b\xe9\x1f\x3b\xf5\x1c\xc1\xbb\xab\xab\x4f\xe8\xb7\xbf\xbb\x3a\x39\x0d\x86\x6e\xfc\x4f\x73\x68\xc3\x81\xc1\x07\x2f\xef\xbc\xbe\x4d\x6e\xa1\x73\x63\x90\x99\x57\x2b\x1c\xbb\xd7\xf2\x9a\x65\x45\x9d\x6d\x1f\xd8\x4a\x57\xd8\xac\xf3\xa8\x20\xa9\x75\x64\x8c\xda\x01\xf9\xee\x6a\x29\x5f\x6c\xae\xf0\x56\xf0\x19\xb0\xdf\xd0\xf7\x3c\x83\x3f\x04\xfb\xad\x4b\x00\xa5\xb0\xeb\x1a\x0f\x9f\xb4\x49\xe9\x96\x50\xdf\xbc\x50\xe6\x51\x76\xcf\x2f\xca\xa6\x25\x90\x74\x8e\xeb\x87\xef\xc3\x8e\xb3\xec\xc1\xff\x1d\xd5\xef\xc9\xbe\x92\x8a\x97\xe2\x9d\x37\x68\x51\x7b\x0b\xf0\xf8\x63\xc6\x20\x25\x90\x03\x62\x57\xe9\xb9\x9d\x76\x99\x5e\xab\xd7\x2d\xc5\x93\x1c\xec\x28\xd7\x41\x75\xd5\x69\xe1\x1a\xe9\x58\x38\x6a\x4d\xfd\x02\x36\x55\x9d\xdd\x95\xaf\x35\x8d\x8b\xfa\xd3\x64\x6e\x5c\x6d\xe5\x6b\xb7\xa1\x2c\xc3\x99\xe5\xab\x3d\x88\x6c\xc6\x8d\xf6\x35\x51\x81\xc1\xfc\x43\x3b\x9c\xdb\x7e\xf0\x60\x22\xef\xfe\xc6\x5e\x36\x63\x24\x4e\x11\x93\x5f\x36\x40\xb5\x0b\xd6\x9c\xa9\xa8\x70\x6d\x97\xa9\x68\xcb\xfe\xe8\x54\x82\x73\x2f\xbe\x83\x41\x63\xbd\x6a\xdc\xdf\x6a\x87\xc0\x29\x9f\xed\x03\x43\x29\xe2\x91\x6e\x9e\xf2\x76\x0f\x86\x2b\xb0\x56\x59\x0e\x16\xd2\xc1\x8a\x41\xd1\xca\x92\x3a\x17\x5c\x64\x3d\x2e\x93\xa2\x10\xd6\x3a\xbb\x12\xf2\xe0\x52\xd3\x2e\xe2\x31\x99\x65\xd8\xb9\x5f\xcb\x3b\x6e\x41\x74\x5e\x1c\x72\x00\x96\x84\x52\x60\x15\xc8\x0b\x45\x25\xdc\xc4\xa9\x6e\xd3\xd0\xc5\xb6\x62\x29\x0d\x3a\xcf\x97\x94\x37\x2e\xd8\x80\xbd\xba\x0b\xd1\x36\xb3\xab\x84\xf1\xf1\x29\x62\xb2\xd6\x37\x55\x55\xf3\x07\x25\x91\x40\x41\xc3\xc2\x28\x22\x62\xd3\x31\x14\x24\xe4\x60\x65\xb6\x34\x9e\x7c\x9e\xaa\x2c\xf9\xee\x95\xaa\x0d\x2a\x52\x12\x23\xa6\xf8\x81\x1d\x77\x5d\x8e\x92\x0b\x5b\x90\x49\xed\x0d\xa0\xaf\xc0\xd2\x10\xf9\xca\x57\xca\x51\x0c\xdd\x4d\xf0\x96\x22\xf3\xc7\x2e\x3c\xee\xb7\x36\xa0\xbb\xe6\xaf\x53\x39\x6e\x2d\xd4\x35\xc1\xf0\x82\x51\xeb\x39\x60\x21\xd6\x21\x63\xe5\xdf\x91\xac\x08\x8c\xb6\x2d\xae\x75\xe8\x54\x82\x08\xc1\x3d\xc7\x83\xa4\x17\x9c\xb7\x8f\x8e\xfb\xed\xfb\x25\x84\x6d\x38\x58\xdd\xf3\x24\xaf\x1c\x96\xee\x6e\x36\xec\x67\x34\xd0\x54\x9c\x9f\x0f\x79\xcc\xbe\x39\x3c\xd0\xf2\xa1\xdf\x94\x30\x39\x6a\x40\x9e\x53\x55\xeb\x2a\x4e\x38\xfe\x3c\x82\x94\xcf\x6b\x0e\xae\x1d\x2f\x51\xc3\x88\x80\x88\x3e\x68\xcf\x5a\xcd\x60\xe9\xb6\x7a\x8a\xde\x23\x9f\x34\x88\xc5\x8b\xa6\xd2\x2c\x85\x09\xde\x3d\xcd\xef\x30\x56\xcd\xe3\x49\xf6\xde\x0a\x15\x68\x31\x7a\x73\x51\x2a\x47\xcf\x0c\x2f\xeb\x0d\x1c\xdb\xf5\x87\x37\x92\x9e\xf5\xd1\x1b\x48\xd3\x9a\xda\x4e\x65\xe3\x29\x6f\x3d\x85\x66\x3e\x2f\xbc\xe0\x48\xf8\x83\x1e\x15\xfc\xc1\xa0\x60\xd2\x68\x6e\xf2\x0d\xd8\xe9\x0c\x68\xcf\xcf\x75\x37\x5d\xbb\xd5\x28\x92\xe5\xc6\x06\x8f\xe5\x5b\x75\xa1\xfe\x3a\x57\x65\x60\x29\xf5\x6f\xca\xf6\xfe\x05\x9c\x2c\x6f\xa0\xf5\xd9\x3a\xfb\xdd\xc5\x9c\xf4\xc8\x03\x14\xb6\x48\x18\x1c\x88\x17\x1e\xe4\xf2\x9d\xb4\xf6\xaf\xd1\x4c\x84\x86\x0c\xeb\x88\x96\x3b\x8b\x8a\xb9\xfc\x79\xc5\x8f\x7f\x5a\xbd\xa6\xaa\x7d\x55\x8a\x77\xf7\x0a\x58\x3e\xc4\xa9\x83\x15\x71\x31\x07\xfd\x6a\x7f\xf4\x2b\x1f\xfa\x95\x1f\xfd\x9f\x54\x23\x2b\xd1\xcf\x9c\x3a\xcc\x6d\xb8\x11\xde\x46\x4c\x41\x3c\x07\x2b\x45\x4c\xf6\xc0\x8a\xf0\x36\x56\x0a\x05\x3a\x58\x65\x66\x71\xf7\x5a\x56\x1c\xe0\xd4\xb1\x52\x0c\xd2\x41\xfc\x7f\x58\x79\xeb\x1e\xa7\x1e\xaf\x8d\x31\xab\x63\xaf\xf3\x11\x95\xc6\x1a\xf5\x07\xe9\xfb\xf8\x2f\xf1\xbd\x2a\x42\xb8\x06\x6a\xee\x25\xac\xac\x6f\xbd\x50\x8d\xbc\xbc\x56\xb6\x3f\x95\xe4\x01\x1a\x9a\x1f\x5b\x28\x99\xc1\x7f\x42\x54\xce\x33\x99\xfa\xe5\xb1\xc5\x39\xfe\x52\x03\x60\x9c\x1c\x9f\xae\x29\x0a\x00\x46\x64\x43\x74\x06\x07\x93\x37\x49\x0e\xba\x56\xa7\x6f\x78\x60\x95\x1c\x99\xcd\xf8\x10\x68\x57\x84\x45\xf6\xdc\x6c\x45\x88\x40\xbb\x20\x84\x85\xb4\x72\x59\x46\x4d\xa6\xa8\x88\x92\xf9\x2d\xf1\xd5\x33\x62\xe5\x64\x7e\x6b\x1c\xf5\x3c\x99\xd9\x94\xe8\x31\xdb\xe6\xe2\x6a\x4f\x4d\x26\x3f\x7b\x66\xac\x7e\xeb\x74\xce\x28\x75\x7d\x20\x87\xd5\x30\xde\x4a\x40\x7f\x01\x35\x39\x4b\xc1\x33\x06\x45\x82\x3f\x52\x08\xbd\x79\x17\xea\xa1\x9a\x0e\x89\x98\xb7\x75\xe4\x1e\x06\x7a\x6a\xb7\xce\x2d\x78\xa7\xda\x55\x3e\x8d\x44\x50\xe9\x77\x4d\x11\xb5\x84\x18\x6f\x3e\x3d\x3e\xb6\x60\x15\x33\x34\x30\x6f\x22\xe8\xf7\x12\x58\xc4\x3f\x39\x7b\x64\x71\x9b\x31\x9b\xe4\x9c\x60\x5a\x6c\x61\x97\xd4\x11\xe7\x44\x81\x9c\x17\xf0\x90\x05\x58\x2c\xe7\x01\xf7\x4c\xc9\x6c\x68\x6a\xe3\x1b\x6e\xd2\x25\x7a\x39\x7e\xb3\xdb\x26\xcd\xb4\xfd\xa8\x5f\x55\xda\x19\x5b\x26\xf2\x33\x14\x03\x9f\xe4\xa3\x40\xca\x53\x3e\xba\x6c\xaa\xe2\x4c\x7f\x62\xe1\xf5\xb9\x52\x03\xa2\xff\x23\xed\x1f\x1e\xa7\x56\x71\xa2\xf6\x6e\x37\x02\x0a\xc8\x24\x4d\x2f\x27\xd5\x2f\x55\xf6\x6c\x87\xbb\x2b\x5e\xd8\x4f\x46\x2f\x76\x2d\x6a\xcc\x9b\x60\x39\x4a\xcc\xfe\xf3\xbf\xd8\xd3\x62\x4c\x8b\x25\x55\xa5\xcd\x7c\xef\xef\x02\x55\x79\xb8\xa8\x82\x93\x05\x6e\xc2\x85\x89\x79\x51\x1b\x39\x36\x31\x2f\x8a\xa3\x7f\x0f\xe9\x27\x50\xb2\xb8\x8d\xff\x11\x4a\x5a\xd6\xb5\x0d\x0e\xa8\xea\xd1\x48\x6c\x95\xcf\xaa\x94\x10\xed\x73\xcc\x71\xc5\xac\x99\x64\x33\x19\x20\x26\xcb\xa8\xcd\x0e\xf5\xf5\xb4\x68\x9a\x52\x1f\x5e\x91\x3d\x0e\xea\xc5\xd3\x34\xe7\xe7\x57\xe8\x01\xb3\x85\xca\x78\x8b\x7c\xf4\x3d\x88\xcd\x1f\xbb\xbb\xb2\x20\xf6\x8e\xe7\x52\x43\xf1\x6b\x34\x3b\xb0\x27\xb7\x4d\xda\x0f\x12\x4a\x6c\x3d\x70\xda\x41\xa2\x7a\xb5\xc1\xe1\xc3\x72\xa6\xe0\xa4\xfd\x2b\xf3\x94\xd2\xa2\xc4\xdb\x14\xaf\x48\xf9\x89\xf6\x01\x52\x4c\x2f\xb2\x11\xaf\x77\x6a\xc4\x17\xd9\x48\x77\x73\x28\x24\x95\x7f\xc9\x2e\x61\x7b\x85\xa7\x32\x9a\x2d\xcd\x2e\xa3\x85\xab\x13\xe3\x98\x1d\xfd\x8b\xea\x13\xda\xc3\x3c\x64\x47\x27\xc7\xaa\x5b\x2e\xcf\x8a\xae\x38\xf5\x9a\xb4\x48\x5f\x8f\x87\x60\x00\xb0\xac\xf2\xd0\x80\x97\x10\x22\x06\x45\xfa\x9b\x42\x51\xe2\x3f\xac\xf8\x5a\x96\xc2\x0a\xa7\xdb\x1d\xc3\x45\x17\x8a\xc5\xc4\xdc\x00\xa4\x6a\x89\x0b\xef\xaf\xec\x15\xfd\xf5\x58\x2a\x55\x15\x60\x72\x57\x1c\x3b\xfc\x89\xd4\xda\xcd\x03\xac\x18\x21\x18\x24\x14\xad\xf8\x3d\x89\xce\x0b\x9a\xed\x4f\xaf\xe2\x02\xe9\x99\x89\x94\x6b\x2e\x65\xbf\x24\xb3\xcc\x4e\x04\x62\x60\x4f\xdc\x28\x82\x81\x78\x8f\x60\xa2\x5d\xb6\xe1\x38\x2e\x5f\x38\x23\x26\x58\xd4\x8f\x60\x2c\x18\xd0\x4c\x9c\x02\xf1\x2d\x4f\xb8\x14\x5e\xb2\x9b\xf4\x0f\x8b\x00\x11\x96\xbd\xf1\xfa\x07\xfa\xf9\x82\x2e\x68\x95\x1e\xaf\xa5\xf6\x38\x72\xdd\x24\x6b\x1f\xa9\xb2\x90\xca\x09\xdb\x4b\x45\x18\xfa\x1f\x42\x60\xb3\x62\x6b\xf3\xd7\x68\xec\x7d\x23\x67\x35\x96\x85\xa8\xff\x13\x00\x00\xff\xff\x20\xc4\xa8\xfb\xd1\x44\x00\x00")

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

	info := bindataFileInfo{name: "lib.js", size: 17617, mode: os.FileMode(420), modTime: time.Unix(1485548629, 0)}
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
