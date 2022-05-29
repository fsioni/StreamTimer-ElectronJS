const path = require("path");
const MyTimer = require(path.join(__dirname, "MyTimer.js"));
const Config = require(path.join(__dirname, "Config.js"));


const { ipcRenderer } = require('electron');

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
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            fn1(this.checked);
        } else {
            fn2(this.checked);
        }
    });
}


window.addEventListener("DOMContentLoaded", () => {
    btnResumeStop = document.getElementById("btResumeStopTimer")
    config = new Config();
    CheckTimerOrCreate()

    addEventToButtonWithId("btResumeStopTimer", () => {
        time.handleResumeOrStop();
    });

    let specificTimeInp = document.getElementById("specificTimeInput");
    let specificTimeBut = document.getElementById("specificTimeButton");
    let h_start = document.getElementById("timeGoalHours");
    let m_start = document.getElementById("timeGoalMinutes");
    let s_start = document.getElementById("timeGoalSeconds");

    specificTimeBut.addEventListener("click", () => {
        if (specificTimeInp.value) {
            let secondsToGoal = parseDateGoal(specificTimeInp.value);
            time.config.changeStartTime(secondsToGoal);
            time.startTimer()
        }
    });


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

    let tabCountdown = document.getElementById('tabCountdown');
    let tabUpdown = document.getElementById('tabUpdown');
    let tabSettings = document.getElementById('tabSettings');
    if (time.config.isCountdown) {
        tabClick("countdown");
    } else {
        tabClick("updown");
    }

    tabCountdown.addEventListener("click", () => {
        tabClick("countdown");
    })
    tabUpdown.addEventListener("click", () => {
        tabClick("updown");
    })
    tabSettings.addEventListener("click", () => {
        tabClick("settings");
    })
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
const parseDateGoal = (_timeGoal) => {
    _timeGoal = _timeGoal.split(":");
    let currentTime = new Date();
    let _dateGoal = new Date();
    _dateGoal.setHours(_timeGoal[0]);
    _dateGoal.setMinutes(_timeGoal[1]);
    _dateGoal.setSeconds(0);
    if ((currentTime.getHours() > _timeGoal[0]) || (currentTime.getHours() == _timeGoal[0] && currentTime.getMinutes() > _timeGoal[1])) { // if the current time is after the time goal
        _dateGoal.setDate(currentTime.getDate() + 1);
    }
    return (_dateGoal - currentTime) / 1000; // return the time remaining before goal in seconds
}

const tabClick = (tab) => {
    switch (tab) {
        case "updown":
            setCountdownTab("inactive")
            setSettingsTab("inactive")
            setUpdownTab("active")
            break;
        case "countdown":
            setUpdownTab("inactive")
            setSettingsTab("inactive")
            setCountdownTab("active")
            break;
        case "settings":
            setCountdownTab("inactive")
            setUpdownTab("inactive")
            setSettingsTab("active")
            break;

        default:
            console.error('Error');
            break;
    }
}

const setCountdownTab = (status) => {
    if (status === "active") {
        setTabActive(tabCountdown)
        setTabInactive(tabUpdown)
        setTabInactive(tabSettings)
        time.config.setIsCountdown(true);
        document.getElementById("SpecificTimeGoal").classList.remove("hidden");
        document.getElementById("TimeGoal").classList.remove("hidden");
        document.getElementById("AddTime").classList.remove("hidden");
    } else if (status === "inactive") {
        document.getElementById("SpecificTimeGoal").classList.add("hidden");
        document.getElementById("TimeGoal").classList.add("hidden");
        document.getElementById("AddTime").classList.add("hidden");
    }
}

const setUpdownTab = (status) => {
    if (status === "active") {
        setTabActive(tabUpdown)
        setTabInactive(tabCountdown)
        setTabInactive(tabSettings)
        time.config.setIsCountdown(false);
        document.getElementById("TimeGoal").classList.remove("hidden")
        document.getElementById("AddTime").classList.remove("hidden")
    } else if (status === "inactive") {
        document.getElementById("TimeGoal").classList.add("hidden");
        document.getElementById("AddTime").classList.add("hidden");
    }
}

const setSettingsTab = (status) => {
    if (status === "active") {
        setTabInactive(tabCountdown)
        setTabInactive(tabUpdown)
        setTabActive(tabSettings)
        document.getElementById("Settings").classList.remove("hidden");
    } else if (status === "inactive") {
        document.getElementById("Settings").classList.add("hidden");
    }
}

const setTabActive = (tab) => {
    tab.className = "bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-700 font-semibold";
    tab.parentNode.className = "-mb-px mr-1";
}

const setTabInactive = (tab) => {
    tab.className = "bg-white inline-block py-2 px-4 text-blue-500 hover:text-blue-800 font-semibold";
    tab.parentNode.className = "mr-1";
}