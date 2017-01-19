package main

import (
	"os"

	"github.com/urfave/cli"
)

const (
	VERSION = "0.0.1"
)

var (
	testFile = "http://genome.compbio.cs.cmu.edu:9000/hg19/hic/test.hic"
)

func main() {
	app := cli.NewApp()
	app.Version = VERSION
	app.Name = "icedata"
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
			Name:   "serve",
			Usage:  "start data server",
			Action: CmdServe,
			Flags: []cli.Flag{
				cli.StringFlag{
					Name:  "uri,f",
					Usage: "URI HiC file",
				},
				cli.IntFlag{
					Name:  "port,p",
					Usage: "data server port",
					Value: 6060,
				},
			},
		},
	}
	app.Run(os.Args)
}
