package main

import (
	"os"

	"github.com/urfave/cli"
)

const (
	VERSION = "0.0.1"
)

var (
	testFile  = "http://genome.compbio.cs.cmu.edu:9000/hg19/bigwig/rnaseq.bw"
	indexFile = "test.bw.index"
)

func main() {
	app := cli.NewApp()
	app.Version = VERSION
	app.Name = "scope"
	app.Usage = "system biology data scope"
	app.EnableBashCompletion = true //TODO
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
			Usage:  "start application in localhost",
			Action: CmdServe,
			Flags: []cli.Flag{
				cli.StringFlag{
					Name:  "bw,B",
					Usage: "bigwig data file URI",
				},
				cli.StringFlag{
					Name:  "hic,H",
					Usage: "hic data file",
				},
				cli.StringFlag{
					Name:  "struct,S",
					Usage: "3d structure file",
				},
				cli.IntFlag{
					Name:  "port,p",
					Usage: "data server port",
					Value: 5050,
				},
			},
		},
		{
			Name:   "http",
			Usage:  "simple http server for development",
			Action: CmdHttp,
			Flags: []cli.Flag{
				cli.IntFlag{
					Name:  "port,p",
					Usage: "http server port",
					Value: 5050,
				},
			},
		},
	}
	app.Run(os.Args)
}
