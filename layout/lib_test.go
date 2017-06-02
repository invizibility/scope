package layout

import "testing"

func TestApp(t *testing.T) {
	a, _ := NewApp("test", make(map[string]string))
	a.Start()
	a.Wait()
}
