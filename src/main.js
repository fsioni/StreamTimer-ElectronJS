const {app} = require('electron')
const path = require("path");

const MyWindow = require(path.join(__dirname, "MyWindow.js"));

app.whenReady().then(() => {
    const window = new MyWindow();
    window.createWindow();
    window.initWindow();
})

