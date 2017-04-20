package main

//go:generate go-bindata-assetfs -pkg main web/... templates/... tmpl/...
import (
	"html/template"
	"log"

	"github.com/gin-gonic/gin"
)

func AddGET(router *gin.Engine) {
	router.GET("/", func(c *gin.Context) {
		bytes, _ := Asset("web/index.html")
		//c.String(400, bytes)
		c.Writer.Write(bytes)
	})
	router.GET("/v1/:page", func(c *gin.Context) {
		page := c.Param("page")
		b, _ := Asset("tmpl/" + page + ".tmpl")
		tmpl := template.New("html")
		tmpl, err := tmpl.Parse(string(b))
		dir, _ := AssetDir("templates")
		for _, d := range dir {
			b, err1 := Asset("templates/" + d)
			if err1 != nil {
				log.Panicf("Unable to parse: template=%s, err=%s", d, err)
			}
			tmpl.New(d).Parse(string(b))
		}
		if err != nil {
			log.Println("error parse template")
		}
		err = tmpl.Execute(c.Writer, gin.H{"Version": "test"}) //constant
		if err != nil {
			log.Println("error executing template")
		}
	})
}
