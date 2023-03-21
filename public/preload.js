// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");

// As an example, here we use the exposeInMainWorld API to expose the browsers
// and node versions to the main window.
// They'll be accessible at "window.versions".
process.once("loaded", () => {
  contextBridge.exposeInMainWorld("versions", process.versions);
  contextBridge.exposeInMainWorld("capture", {
    getScreens: () => ipcRenderer.send('get-screens'),
    storeScreens: (setState) => ipcRenderer.on('ALL_SOURCES', (event,sources) => {
      setState(sources)
    })
    ,
    removeEventListener: () => {
      ipcRenderer.removeAllListeners('ALL_SOURCES')
    }
  });
  contextBridge.exposeInMainWorld("path", {
    openDialog: () => ipcRenderer.send('open-file-dialog'),
    getPath: (setState) => ipcRenderer.on('getPath', (event,path) => {
      setState(path)
    })
  })
  contextBridge.exposeInMainWorld("volume", {
    getVolumes: () => ipcRenderer.send('get-initial-volume'),
    storeVolumes: (setState) => ipcRenderer.on('getInitialVolumes', (event,volumes) => {
      setState(volumes)
    })
  })
  contextBridge.exposeInMainWorld("record", {
    startRecord: (stream, path) => ipcRenderer.send('start-recording',stream, path),
    stopRecord: () => ipcRenderer.send('stop-recording'),
    saveFile: (filepath,blob) => ipcRenderer.send('save-file',filepath,blob)
    // .then((response) => { console.log(response)}).catch((err)=> {console.log(err)})
  })
});