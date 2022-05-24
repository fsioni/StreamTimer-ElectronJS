const path = require("path");
const MyTimer = require(path.join(__dirname, "MyTimer.js"));
const Config = require(path.join(__dirname, "Config.js"));


const {ipcRenderer} = require('electron');

let time;
let config;
let btnResumeStop;

function CheckTimerOrCreate() {
    if (!time) {
        time = new MyTimer(btnResumeStop, config);
    }
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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

const eventChangeIsUpdown = () => {
    time.config.setIsCountdown(document.getElementById('radIsCountdown').checked)
}

window.addEventListener("DOMContentLoaded", () => {
    btnResumeStop = document.getElementById("btResumeStopTimer")
    config = new Config();
    CheckTimerOrCreate()

    addEventToButtonWithId("btResumeStopTimer", () => {
        time.handleResumeOrStop();
    });

    let h_start = document.getElementById("timeGoalHours");
    let m_start = document.getElementById("timeGoalMinutes");
    let s_start = document.getElementById("timeGoalSeconds");

    let startTime = config.startTime;
    h_start.value = Math.floor(startTime / 3600);
    startTime -= h_start.value * 3600;
    m_start.value = Math.floor(startTime / 60);
    startTime -= m_start.value * 60;
    s_start.value = startTime;

    h_start.addEventListener("change", () => {
        h_start.value = Math.max(h_start.value, 0);
    });
    m_start.addEventListener("change", () => {
        m_start.value = clamp(m_start.value, 0, 59);
    });
    s_start.addEventListener("change", () => {
        s_start.value = clamp(s_start.value, 0, 59);
    });

    addEventToButtonWithId("btnStartTimer", () => {
        time.config.changeStartTime(time.convertTimeToSeconds(h_start.value, m_start.value, s_start.value));
        time.startTimer()
    });

    let h_add = document.getElementById("timeAddHours");
    let m_add = document.getElementById("timeAddMinutes");
    let s_add = document.getElementById("timeAddSeconds");

    h_add.addEventListener("change", () => {
        h_add.value = Math.max(h_add.value, 0);
    });
    m_add.addEventListener("change", () => {
        m_add.value = clamp(m_add.value, 0, 59);
    });
    s_add.addEventListener("change", () => {
        s_add.value = clamp(s_add.value, 0, 59);
    });

    addEventToButtonWithId("btnAddTime", () => {
        time.addTime(time.convertTimeToSeconds(h_add.value, m_add.value, s_add.value));
    });

    addEventToButtonWithId("btnSelectFile", ChangeSelectedOutput)
    addEventToButtonWithId("btnSelectSound", ChangeSelectedSound)
    addEventToInputTextWithId('txtTextOnEnd', () => {
        time.config.setTextOnEnd(document.getElementById('txtTextOnEnd').value)
    })
    document.getElementById('txtTextOnEnd').value = (config.textOnEnd) ? config.textOnEnd : ""
    addEventToInputTextWithId('txtOutputStyle', () => {
        time.config.setOutputStyle(document.getElementById('txtOutputStyle').value)
    })
    document.getElementById('txtOutputStyle').value = (config.outputStyle) ? config.outputStyle : ""


    document.getElementById('cbAutoStart').checked = config.automaticStart;
    addEventToCheckboxWithId("cbAutoStart", time.config.setAutoStart, time.config.setAutoStart)

    document.getElementById('cbPlayAudio').checked = config.playAudioOnEnd;
    addEventToCheckboxWithId("cbPlayAudio", time.config.setPlayAudioOnEnd, time.config.setPlayAudioOnEnd)

    let radIsCountdown = document.getElementById('radIsCountdown');
    let radIsUpdown = document.getElementById('radIsUpdown');
    radIsCountdown.addEventListener("change", () => {
        eventChangeIsUpdown();
    })
    radIsUpdown.addEventListener("change", () => {
        eventChangeIsUpdown();
    })
 
    radIsCountdown.checked = config.isCountdown;
    radIsUpdown.checked = !config.isCountdown;
})

const ChangeSelectedOutput = () => {
    return ipcRenderer.invoke('open-select-output-file-window').then(r => {
        time.config.changeSavefile(r);
    })
}

const ChangeSelectedSound = () => {
    return ipcRenderer.invoke('open-select-sound-window').then(r => {
        time.config.changeSound(r);
        time.updateAudio();
    })
}