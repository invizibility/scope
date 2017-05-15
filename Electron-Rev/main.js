const {app, BrowserWindow,ipcMain} = require('electron')
const path = require('path')
const url = require('url')
var io = require("socket.io-client")("http://localhost:5050/")
 io.on('connect', function(){
   console.log("connect")
   //io.emit("aha","1")
 })
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 900, height: 800, webPreferences: {
        preload: './preload.js'
    }})

  // and load the index.html of the app.
  win.loadURL("http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&pix=800")

  // Open the DevTools.
  win.webContents.openDevTools();

  win.webContents.on("did-navigate",(event,url) => {
    console.log("did navigate event")
    let code =`console.log("server message");var p = document.getElementById("position");console.log(p.value);var ipcRenderer=require("electron").ipcRenderer;console.log(ipcRenderer);ipcRenderer.send("msg",p.value)`
    //ipcRenderer.sendSync("coord",p.vlaue),2000`
    win.webContents.executeJavaScript(code);
  })
  win.webContents.on("did-navigate-in-page",(event,url) => {
    console.log("did navigate in page event")
    let code =`console.log("server message");var p = document.getElementById("position");console.log(p.value);var ipcRenderer=require("electron").ipcRenderer;console.log(ipcRenderer);ipcRenderer.send("msg",p.value)`
    //ipcRenderer.sendSync("coord",p.vlaue),2000`
    win.webContents.executeJavaScript(code);

  })
  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
ipcMain.on("msg",function(event,d){
  console.log("msg!!!",d)
  //console.log(io,d)
  io.emit("data",d)
})
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
