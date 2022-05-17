const {app, BrowserWindow, dialog, ipcMain} = require('electron')
const path = require("path");

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
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
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit()
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });

    ipcMain.handle('open-select-output-file-window', openWindowSelectFile);
}

async function openWindowSelectFile() {
    const {canceled, filePaths} = await dialog.showOpenDialog({properties: ['openFile']})
    if (canceled) {
        return null;
    } else {
        return filePaths[0]
    }
}
