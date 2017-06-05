package layout

import (
	"fmt"
	"log"

	astilectron "github.com/asticode/go-astilectron"
	astilog "github.com/asticode/go-astilog"
	"github.com/pkg/errors"
)

func NewApp(name string, app map[string]string) (*App, error) {
	port := 5050                                                        //TODO FIX
	indexPage := fmt.Sprintf("http://127.0.0.1:%d/v1/index.html", port) //TODO FIX
	var w *astilectron.Window
	ch := make(chan map[string]interface{})
	a, err := newApp(name)
	if err != nil {
		return nil, errors.Wrap(err, "create app")
	}
	m := a.NewMenu([]*astilectron.MenuItemOptions{
		{
			Label: astilectron.PtrStr("View"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Label: astilectron.PtrStr("DevTools"), Role: astilectron.MenuItemRoleToggleDevTools},
				{Label: astilectron.PtrStr("Minimize"), Role: astilectron.MenuItemRoleMinimize},
				{Label: astilectron.PtrStr("Close"), Role: astilectron.MenuItemRoleClose},
			},
		},
	})

	if w, err = a.NewWindow(indexPage, &astilectron.WindowOptions{
		Center: astilectron.PtrBool(true),
		Height: astilectron.PtrInt(618),
		Width:  astilectron.PtrInt(1000),
	}); err != nil {
		astilog.Fatal(errors.Wrap(err, "new window failed"))
	}
	if err = w.Create(); err != nil {
		astilog.Fatal(errors.Wrap(err, "creating window failed"))
	}
	ws := make(map[int]*astilectron.Window)
	ws[-1] = w
	vars := make(map[int]map[string]string) //TODO Manage Vars for each Window.
	//app := make(map[string]string)          //TODO
	//idx := 1
	x := &App{a, m, w, ws, vars, app, ch}
	x.addCode() //TODO
	//sm := []*astilectron.MenuItemOptions{}
	m.Create()
	var ni = m.NewItem(&astilectron.MenuItemOptions{
		Label: astilectron.PtrStr("Ext"),
		//SubMenu: sm,
		OnClick: func(e astilectron.Event) (deleteListener bool) {
			go x.NewWindow("external", 1000, 618, x.app, -100)
			//x.idx++
			return false
		},
	})
	if err = m.Insert(0, ni); err != nil {
		//log.Println(err)
		panic(err)
		astilog.Fatal(errors.Wrap(err, "inserting menu item failed"))
	}
	log.Println(err)

	/* Debug Button */
	debugBtn := m.NewItem(&astilectron.MenuItemOptions{
		Label: astilectron.PtrStr("Debug"),
		//SubMenu: sm,
		OnClick: func(e astilectron.Event) (deleteListener bool) {
			//go x.NewWindow("external", 1000, 618, x.app, -100)
			//x.idx++ //TODO
			for k, _ := range x.ws {
				log.Println(k)
			}
			return false
		},
	})
	if err = m.Insert(2, debugBtn); err != nil {
		//log.Println(err)
		panic(err)
		astilog.Fatal(errors.Wrap(err, "inserting menu item failed"))
	}
	log.Println(err)
	/******************************/

	return x, nil
}

func (app *App) Start() {
	app.a.Start()
}

func (app *App) Wait() {
	app.a.Wait()
}
