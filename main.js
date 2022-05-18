const {app, BrowserWindow, dialog, ipcMain} = require('electron')
const windowStateKeeper = require('electron-window-state');
const path = require("path");

let win;
let mainWindowState

const createWindow = () => {
    mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800
    })

    win = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        resizable: false,
        title: "Stream Timer",
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.webContents.openDevTools();

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    initWindow();
})

const initWindow = () => {
    mainWindowState.manage(win);

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit()
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });

    ipcMain.handle('open-select-output-file-window', openWindowSelectFile);
}

async function openWindowSelectFile() {
    const {canceled, filePaths} = await dialog.showOpenDialog({
        filters: [{name: 'Text files', extensions: ['txt']}],
        properties: [
            'openFile']

    })
    if (canceled) {
        return null;
    } else {
        return filePaths[0]
    }
}
