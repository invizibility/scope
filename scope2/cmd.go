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
			Name:   "app",
			Usage:  "start application",
			Action: CmdApp,
			Flags: []cli.Flag{
				cli.StringFlag{
					Name:  "input,I",
					Usage: "data manager tsv",
				},
				cli.IntFlag{
					Name:  "port,p",
					Usage: "data server port",
					Value: 5050,
				},
			},
		},
	}
	app.Run(os.Args)
}
