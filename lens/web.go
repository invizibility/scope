package main

//go:generate go-bindata-assetfs -pkg main web/...
import (
	"github.com/gin-gonic/gin"
)

func AddGET(router *gin.Engine) {
	router.GET("/", func(c *gin.Context) {
		bytes, _ := Asset("web/index.html")
		//c.String(400, bytes)
		c.Writer.Write(bytes)
	})
}
