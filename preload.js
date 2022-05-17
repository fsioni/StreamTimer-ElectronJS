const path = require("path");
const MyTimer = require(path.join(__dirname, "MyTimer.js"));
const {ipcRenderer} = require('electron');

let time;
let savefile = undefined;

function StartTimer() {
    console.log("Start timer");
    if (!time) {
        time = new MyTimer(65, savefile);
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

const addEventToButtonWithId = (id, fnc) => {
    let btn = document.getElementById(id);
    btn.addEventListener("click", fnc);
}

window.addEventListener("DOMContentLoaded", () => {
    addEventToButtonWithId("btnStartTimer", StartTimer);
    addEventToButtonWithId("btnStopTimer", StopTimer);
    addEventToButtonWithId("btnResumeTimer", ResumeTimer);
    addEventToButtonWithId("btnSelectFile", ChangeSelectedOutput)
})

const ChangeSelectedOutput = () => {
    return ipcRenderer.invoke('open-select-output-file-window').then(r => {
        ChangeSavefile(r);
    })
}

const ChangeSavefile = (_savefile) => {
    savefile = _savefile;
    if (time) time.changeSavefile(_savefile)
    console.log('New savefile : ' + savefile)
}