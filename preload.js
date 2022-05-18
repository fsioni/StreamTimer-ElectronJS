const path = require("path");
const MyTimer = require(path.join(__dirname, "MyTimer.js"));
const {ipcRenderer} = require('electron');

let time;

function CheckTimerOrCreate() {
    if (!time) {
        time = new MyTimer(3606);
    }
}

const addEventToButtonWithId = (id, fnc) => {
    let btn = document.getElementById(id);
    btn.addEventListener("click", fnc);
}

const addEventToInputTextWithId = (id, fnc) => {
    let input = document.getElementById(id);
    input.addEventListener("input", fnc);
}

const addEventToCheckboxWithId = (id, fn1, fn2) => {
    let checkbox = document.getElementById(id);
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            fn1(this.checked);
        } else {
            fn2(this.checked);
        }
    });
}


window.addEventListener("DOMContentLoaded", () => {
    CheckTimerOrCreate()
    addEventToButtonWithId("btnStartTimer", () => {
        time.startTimer()
    });
    addEventToButtonWithId("btnStopTimer", () => {
        time.stopTimer()
    });
    addEventToButtonWithId("btnResumeTimer", () => {
        time.resumeTimer()
    });
    addEventToButtonWithId("btnSelectFile", ChangeSelectedOutput)
    addEventToInputTextWithId('txtTextOnEnd', () => {
        time.setTextOnEnd(document.getElementById('txtTextOnEnd').value)
    })
    document.getElementById('txtTextOnEnd').value = (time.textOnEnd) ? time.textOnEnd : ""

    document.getElementById('cbAutoStart').checked = time.automaticStart;
    let autoStartFnc = (_checked) => {
        time.setAutoStart(_checked)
    }
    addEventToCheckboxWithId("cbAutoStart", autoStartFnc, autoStartFnc)
})

const ChangeSelectedOutput = () => {
    return ipcRenderer.invoke('open-select-output-file-window').then(r => {
        time.changeSavefile(r);
    })
}