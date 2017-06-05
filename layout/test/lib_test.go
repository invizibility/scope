package test

import "testing"
import . "github.com/nimezhu/scope/layout"

func TestApp(t *testing.T) {
	a, _ := NewApp("test", make(map[string]string))
	a.Start()
	a.Wait()
}
