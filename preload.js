const path = require("path");
const MyTimer = require(path.join(__dirname, "MyTimer.js"));
const {ipcRenderer, contextBridge} = require('electron');

let time;

function StartTimer() {
    console.log("Start timer");
    if (!time) {
        time = new MyTimer(65);
    }
    time.startTimer();
}

function StopTimer() {
    if (time) {
        time.stopTimer();
    }

}

function ResumeTimer() {
    if (time) {
        time.resumeTimer();
    }
}

function addEventToButtonWithId(id, fnc) {
    let btn = document.getElementById(id);
    btn.addEventListener("click", fnc);
}

window.addEventListener("DOMContentLoaded", () => {
    contextBridge.exposeInMainWorld('streamTimerAPI', {
            SelectOutputFile: () => {
                ipcRenderer.invoke('open-select-output-file-window')
            }
        }
    )

    addEventToButtonWithId("btnStartTimer", StartTimer);
    addEventToButtonWithId("btnStopTimer", StopTimer);
    addEventToButtonWithId("btnResumeTimer", ResumeTimer);

    addEventToButtonWithId("btnSelectFile", async () => {
        time.saveFile = await window['streamTimerAPI'].SelectOutputFile();
    });
})

function ChangeSavefile(_savefile) {
    time.saveFile = _savefile;
    console.log('New savefile : ' + time.saveFile)
}

