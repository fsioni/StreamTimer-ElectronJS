const windowStateKeeper = require("electron-window-state");
const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const path = require("path");

class MyWindow {
    win = null;
    mainWindowState = null;

    async openWindowSelectTextFile() {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            filters: [{ name: 'Text files', extensions: ['txt'] }],
            properties: [
                'openFile'
            ]

        })
        if (canceled) {
            return null;
        } else {
            return filePaths[0]
        }
    }

    async openWindowSelectSoundFile() {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            filters: [{ name: 'Sound files', extensions: ['mp3', 'wav'] }],
            properties: [
                'openFile'
            ]

        })
        if (canceled) {
            return null;
        } else {
            return filePaths[0]
        }
    }

    createWindow = () => {
        console.log("createWindow");
        this.mainWindowState = windowStateKeeper({
            defaultWidth: 300,
            defaultHeight: 300
        })

        this.win = new BrowserWindow({
            x: this.mainWindowState.x,
            y: this.mainWindowState.y,
            width: 400,
            height: 800,
            resizable: false,
            title: "Stream Timer",
            autoHideMenuBar: true,
            icon: path.join(__dirname, '../public/icon.png'),
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        this.win.webContents.openDevTools();

        this.win.loadFile(path.join(__dirname, '../public/index.html'));
    }

    initWindow = () => {
        this.mainWindowState.manage(this.win);

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') app.quit()
        });

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) this.createWindow()
        });

        ipcMain.handle('open-select-output-file-window', this.openWindowSelectTextFile);
        ipcMain.handle('open-select-sound-window', this.openWindowSelectSoundFile);
    }
}

module.exports = MyWindow;