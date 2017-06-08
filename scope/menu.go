package main

import astilectron "github.com/asticode/go-astilectron"

func scopeMenu(a *astilectron.Astilectron) *astilectron.Menu {
	var m = a.NewMenu([]*astilectron.MenuItemOptions{
		{
			Label: astilectron.PtrStr("Admin"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Label: astilectron.PtrStr("Data Manager")},
				{Label: astilectron.PtrStr("Add External Window")},
				//{Label: astilectron.PtrStr("Add Window From Server")},
				{Label: astilectron.PtrStr("Quit"), Role: astilectron.MenuItemRoleClose},
				{Type: astilectron.MenuItemTypeSeparator},
				{Label: astilectron.PtrStr("About"), Role: astilectron.MenuItemRoleAbout},
			},
		}, {
			Label: astilectron.PtrStr("Layout"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Label: astilectron.PtrStr("Load")},
				{Label: astilectron.PtrStr("Save")},
			},
		}, {
			Label: astilectron.PtrStr("Genome"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Checked: astilectron.PtrBool(true), Label: astilectron.PtrStr("Human - hg19"), Type: astilectron.MenuItemTypeRadio},
				{Label: astilectron.PtrStr("Mouse - mm10"), Type: astilectron.MenuItemTypeRadio},
			},
		},
		{
			Label: astilectron.PtrStr("View"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Label: astilectron.PtrStr("DevTools"), Role: astilectron.MenuItemRoleToggleDevTools},
				{Label: astilectron.PtrStr("Minimize"), Role: astilectron.MenuItemRoleMinimize},
				{Label: astilectron.PtrStr("Close"), Role: astilectron.MenuItemRoleClose},
			},
		},
	})
	return m
}
