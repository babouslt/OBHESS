// Module to control the application lifecycle and the native browser window.
const { app, BrowserWindow, protocol, ipcMain, ipcRenderer, Notification } = require("electron");
const path = require("path");
const url = require("url");
const { desktopCapturer, dialog } = require('electron')



// Create the native browser window.
function createWindow() {
  const mainWindow = new BrowserWindow({
    // width: 800,
    // height: 600,
    fullscreen: true,
    // Set the path of an additional "preload" script that can be used to
    // communicate between node-land and browser-land.
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      })
    : "http://localhost:3000";
  mainWindow.loadURL(appURL);

  // Automatically open Chrome's DevTools in development mode.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}

// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).
function setupLocalFilesNormalizerProxy() {
  protocol.registerHttpProtocol(
    "file",
    (request, callback) => {
      const url = request.url.substr(8);
      callback({ path: path.normalize(`${__dirname}/${url}`) });
    },
    (error) => {
      if (error) console.error("Failed to register protocol");
    }
  );
}

// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  setupLocalFilesNormalizerProxy();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// If your app has no need to navigate or only needs to navigate to known pages,
// it is a good idea to limit navigation outright to that known scope,
// disallowing any other kinds of navigation.
const allowedNavigationDestinations = "https://my-electron-app.com";
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (!allowedNavigationDestinations.includes(parsedUrl.origin)) {
      event.preventDefault();
    }
  });
});

ipcMain.on('get-screens', async (event, arg) => {
  desktopCapturer.getSources({ types: ['window', 'screen', 'camera'] }).then(async sources => {
    event.reply('ALL_SOURCES', sources)
  })
})

ipcMain.on('open-file-dialog', event => {
  var path;
  dialog.showOpenDialog({
    properties: ['openDirectory'],
    title :'Select a path',
    buttonLabel: 'Confirm',
  }).then(result => {
    path= result.filePaths
    event.reply('getPath', path)
  })
})

//const volume = require('electron-volume-control');

ipcMain.on('get-initial-volume', event => {
  const currentMicroVolume = volume.getMicrophoneVolume();
  const currentSpeakerVolume = volume.getSpeakerVolume();
  const currentVolumes = {currentMicroVolume,currentSpeakerVolume}
  event.reply('getInitialVolume', currentVolumes)
})


ipcMain.on('start-recording', (event,stream, path) => {
  const chunks = [];
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  const test = new MediaRecorder()
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    ipcRenderer.send('recording-complete', blob, path);
  };

  mediaRecorder.start();
  return mediaRecorder;
})

ipcMain.on('stop-recording', (event,mediaRecorder) => {
  mediaRecorder.stop();
})


const fs = require('fs');
ipcMain.on('save-file', (event,filepath,arrayBuffer) => {
  const blob = Buffer.from(arrayBuffer)
  const fileStream = fs.createWriteStream(filepath);
  fileStream.write(blob);
  new Notification({title: 'OBHESS', body:'Record done!'}).show()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.