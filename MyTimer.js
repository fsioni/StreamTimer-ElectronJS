const fs = require("fs");
const path = require("path");

const defaultSaveFile = path.join(__dirname, "timer.txt");
const ConfigFile = path.join(__dirname, "config.txt");

class MyTimer {
    constructor(_time, _textOnEnd) {
        let config = this.loadConfiguration()
        this.startTime = _time
        this.time = this.startTime;
        this.isPlaying = false;
        this.interval = null;
        this.saveFile = null;
        this.changeSavefile(defaultSaveFile)
        this.automaticStart = false;
        this.textOnEnd = _textOnEnd;

        if (config) {
            this.startTime = config.startTime;
            this.changeSavefile(config.saveFile);
            this.automaticStart = config.automaticStart;
            this.textOnEnd = config.textOnEnd;
        }

        console.log("Timer created with " + _time + " seconds at " + this.saveFile);

        if (this.automaticStart) this.startTimer();
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
            textOnEnd: this.textOnEnd
        }

        let JsonConfiguration = JSON.stringify(config)
        fs.writeFile(ConfigFile, JsonConfiguration, function (err) {
            if (err) throw err;
        })

        console.log("Configuration saved");
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
    }

    resumeTimer = () => {
        this.isPlaying = true;
        if (!this.interval) {
            this.interval = setInterval(this.processTimer, 1000);
        }
    }

    stopTimer = () => {
        clearInterval(this.interval);
        this.isPlaying = false;
    }

    processTimer = () => {
        if (this.time <= 0 || this.isPlaying === false) {
            this.stopTimer();
            this.updateTexts(this.textOnEnd);
            return;
        }

        this.decreaseTimer();
        console.log(this.time)
    }

    decreaseTimer = () => {
        this.time--;
        this.updateTexts(this.getTimeString())
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
        fs.writeFile(this.saveFile, timeString, function (err) {
            if (err) throw err;
        })
    }

    updateTexts = (timeString) => {
        console.log(timeString)
        if (!timeString) timeString = "";
        document.getElementById("txtTimer").innerText = timeString;
        this.saveToFile(timeString);
    }

    setAutoStart = (isChecked) => {
        if (this.automaticStart !== isChecked) {
            this.automaticStart = isChecked;
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