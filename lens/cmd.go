package main

import (
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/nimezhu/snowjs"
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
