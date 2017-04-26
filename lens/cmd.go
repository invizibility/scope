package main

import (
	"fmt"
	"os"

	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
	"github.com/gin-gonic/gin"
	"github.com/nimezhu/snowjs"
	"github.com/pkg/errors"
	"github.com/urfave/cli"
)

const (
	VERSION = "0.0.1"
)

func main() {
	app := cli.NewApp()
	app.Version = VERSION
	app.Name = "lens"
	app.Usage = "data server utils"
	app.EnableBashCompletion = true
	// global level flags
	app.Flags = []cli.Flag{
		cli.BoolFlag{
			Name:  "verbose",
			Usage: "Show more output",
		},
	}

	// Commands
	app.Commands = []cli.Command{
		{
			Name:   "start",
			Usage:  "start a server",
			Action: CmdStart,
			Flags: []cli.Flag{
				cli.IntFlag{
					Name:  "port,p",
					Usage: "data server port",
					Value: 8080,
				},
			},
		},
		{
			Name:   "app",
			Usage:  "start a electron app",
			Action: CmdApp,
			Flags: []cli.Flag{
				cli.IntFlag{
					Name:  "port,p",
					Usage: "data server port",
					Value: 8080,
				},
			},
		},
	}
	app.Run(os.Args)
}
func CmdStart(c *cli.Context) error {
	port := c.Int("port")
	router := gin.New()
	AddGET(router)
	snowjs.AddGET(router, "")
	router.Run(fmt.Sprintf(":%d", port))
	return nil
}
func CmdApp(c *cli.Context) error {
	port := c.Int("port")
	router := gin.New()
	AddGET(router)
	snowjs.AddGET(router, "")
	go router.Run(fmt.Sprintf(":%d", port))
	// Create astilectron
	var a *astilectron.Astilectron
	var err error
	if a, err = astilectron.New(astilectron.Options{BaseDirectoryPath: os.Getenv("HOME") + "/lib"}); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating new astilectron failed"))
	}
	defer a.Close()
	a.HandleSignals()
	a.On(astilectron.EventNameAppStop, func(e astilectron.Event) (deleteListener bool) {
		a.Stop()
		return
	})

	// Start
	if err = a.Start(); err != nil {
		astilog.Fatal(errors.Wrap(err, "starting failed"))
	}

	// Create window
	var w *astilectron.Window
	if w, err = a.NewWindow(fmt.Sprintf("http://127.0.0.1:%d/v1/panels", port), &astilectron.WindowOptions{
		Center: astilectron.PtrBool(true),
		Height: astilectron.PtrInt(600),
		Width:  astilectron.PtrInt(600),
	}); err != nil {
		astilog.Fatal(errors.Wrap(err, "new window failed"))
	}
	if err = w.Create(); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating window failed"))
	}

	// Blocking pattern
	a.Wait()
	return nil
}
