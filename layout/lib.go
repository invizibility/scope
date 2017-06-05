package layout

import (
	"fmt"
	"os"
	"strings"

	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
	"github.com/pkg/errors"
)

func newApp(name string) (*astilectron.Astilectron, error) {
	var a *astilectron.Astilectron
	var err error
	if a, err = astilectron.New(astilectron.Options{
		AppName:           name,
		BaseDirectoryPath: os.Getenv("HOME") + "/lib",
	}); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating new astilectron failed"))
		return nil, errors.Wrap(err, "creating new astilectron failed")
	}
	a.HandleSignals()
	a.On(astilectron.EventNameAppClose, func(e astilectron.Event) (deleteListener bool) {
		a.Stop()
		return
	})
	// Start
	if err = a.Start(); err != nil {
		astilog.Fatal(errors.Wrap(err, "starting failed"))
	}

	return a, err
}

func closeAll(ws map[int]*astilectron.Window) {
	keys := []int{}
	for k, _ := range ws {
		keys = append(keys, k)
	}
	for i := 0; i < len(keys); i++ {
		go func(j int) {
			ws[keys[j]].Close()
		}(i)
	}
	return
}

func generateLinks(port int, name string, app map[string]string) string {
	url := fmt.Sprintf("http://127.0.0.1:%d/v1/%s.html?", port, name)
	for k, v := range app {
		url += k + "=" + v + "&"
	}
	url = strings.Trim(url, "?")
	url = strings.Trim(url, "&")
	fmt.Println("url", url)
	return url
}
