const fs = require("fs");
const path = require("path");

const defaultSaveFile = path.join(__dirname, "timer.txt");
const defaultAudioOnEnd = path.join(__dirname, "audio.mp3");
const ConfigFile = path.join(__dirname, "config.json");

class MyTimer {
    constructor(_time, _btnResumeStop) {
        let config = this.loadConfiguration()
        this.startTime = _time
        this.time = this.startTime;
        this.isPlaying = false;
        this.interval = null;
        this.saveFile = null;
        this.automaticStart = false;
        this.btnResumeStop = _btnResumeStop;
        this.audioPath = null; //path to audio file
        this.playAudioOnEnd = false;

        if (config) {
            this.startTime = config.startTime;
            this.saveFile = config.saveFile;
            this.automaticStart = config.automaticStart;
            this.textOnEnd = config.textOnEnd;
            this.audioPath = config.audioOnEnd;
            this.playAudioOnEnd = config.playAudioOnEnd;
        }

        this.saveFile = (!this.saveFile) ? this.saveFile = defaultSaveFile : this.saveFile;
        this.audioPath = (!this.audioPath) ? this.audioPath = defaultAudioOnEnd : this.audioPath;
        this.updateAudio();
        console.log("Timer created with " + _time + " seconds at " + this.saveFile);

        if (this.automaticStart) this.startTimer();
    }

    updateAudio = () => {
        if (this.audioPath) {
            this.audio = new Audio(this.audioPath);
        }
    }

    changeSavefile = (_savefile) => {
        this.saveFile = _savefile == null ? this.saveFile : _savefile;
        console.log('New savefile : ' + this.saveFile);
        this.saveConfiguration();
    }

    saveConfiguration = () => {
        let config = {
            startTime: this.startTime,
            saveFile: this.saveFile,
            automaticStart: this.automaticStart,
            textOnEnd: this.textOnEnd,
            audioPath: this.audioPath,
            playAudioOnEnd: this.playAudioOnEnd
        }

        let JsonConfiguration = JSON.stringify(config)
        console.log(JsonConfiguration)
        fs.writeFile(ConfigFile, JsonConfiguration, function (err) {
            if (err) throw err;
            console.log('Configuration saved');
        })
    }

    loadConfiguration = () => {
        try {
            const data = fs.readFileSync(ConfigFile, 'utf8');
            return JSON.parse(data)
        } catch (err) {
            return;
        }
    }


    startTimer = () => {
        console.log("Timer started");
        this.time = this.startTime;
        if (!this.isPlaying) {
            this.interval = setInterval(this.processTimer, 1000);
        }
        this.isPlaying = true;
        this.btnResumeStop.hidden = false;
        this.btnResumeStop.innerText = "Stop";
    }

    convertTimeToSeconds = (_h, _m, _s) => {
        return Number(_h) * 3600 + Number(_m) * 60 + Number(_s);
    }

    changeStartTime = (_time) => {
        console.log("New start time : " + _time);
        if (_time !== this.startTime) {
            this.startTime = _time;
            this.saveConfiguration();
        }
    }

    addTime = (_time) => {
        console.log(this.time)
        if (this.time > 0) {
            console.log("Added time : " + _time);
            this.time += _time;
            this.updateTexts()
        }
    }

    handleResumeOrStop = () => {
        if (this.isPlaying) {
            this.stopTimer();
            this.btnResumeStop.innerText = "Resume";
        } else {
            this.resumeTimer();
            this.btnResumeStop.innerText = "Stop";
        }
    }

    resumeTimer = () => {
        this.isPlaying = true;
        if (!this.interval) {
            this.interval = setInterval(this.processTimer, 1000);
        }
    }

    stopTimer = () => {
        clearInterval(this.interval);
        this.interval = null;
        this.isPlaying = false;
    }

    handleTimerEnd = () => {
        this.btnResumeStop.hidden = true;
        this.stopTimer();
        if (this.playAudioOnEnd && this.audio) {
            console.log("Playing audio");
            this.audio.play();
        }
    }


    processTimer = () => {
        if (this.time <= 0 || this.isPlaying === false) {
            this.stopTimer();
            this.updateTexts(this.textOnEnd);
            return;
        } else if (this.isPlaying) {
            this.decreaseTimer();
        }
        if (this.time <= 0) this.handleTimerEnd();

        console.log(this.time)
    }

    decreaseTimer = () => {
        this.time--;
        this.updateTexts()
    }

    getTimeString = () => {
        let seconds = this.time;
        let hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;

        if (hours < 10) hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;

        let hOutput = (hours == "00") ? "" : hours + ":";
        return hOutput + minutes + ":" + seconds;
    }

    saveToFile = (timeString) => {
        let textEnd = (this.textOnEnd) ? this.textOnEnd : "";
        timeString = (timeString !== "00:00") ? timeString : textEnd;
        fs.writeFile(this.saveFile, timeString, function (err) {
            if (err) throw err;
        })
    }

    updateTexts = () => {
        let timeString = this.getTimeString();
        if (!timeString) timeString = "";
        let elementById = document.getElementById("txtTimer");
        if (this.time > 0) {
            elementById.innerText = timeString;
        } else {
            elementById.innerText = "Time's up!";
        }
        this.saveToFile(timeString);
    }

    setAutoStart = (isChecked) => {
        if (this.automaticStart !== isChecked) {
            this.automaticStart = isChecked;
            this.saveConfiguration();
        }
    }

    setPlayAudioOnEnd = (isChecked) => {
        if (this.playAudioOnEnd !== isChecked) {
            this.playAudioOnEnd = isChecked;
            this.saveConfiguration();
        }
    }

    setTextOnEnd = (_textOnEnd) => {
        this.textOnEnd = _textOnEnd
        console.log(_textOnEnd)
        this.saveConfiguration();
    }
}

module.exports = MyTimer;