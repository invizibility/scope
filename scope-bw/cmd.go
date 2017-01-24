package main

import (
	"github.com/urfave/cli"
	"os"
)

const (
	VERSION = "0.0.1"
)

var (
	testFile  = "http://genome.compbio.cs.cmu.edu:9000/hg19/bigwig/rnaseq.bw"
	indexFile = "test.bw.index"
)

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
func main() {
	app := cli.NewApp()
	app.Version = VERSION
	app.Name = "scope-bw"
	app.Usage = "bigwig bigbed data server utils"
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
			Usage:  "bigwig data server",
			Action: CmdServe,
			Flags: []cli.Flag{
				cli.StringFlag{
					Name:  "uri,f",
					Usage: "bigwig data file URI",
					Value: testFile,
				},
				cli.StringFlag{
					Name:  "index,idx",
					Usage: "index file",
				},
				cli.StringFlag{
					Name:  "db",
					Usage: "bolt index db file",
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
