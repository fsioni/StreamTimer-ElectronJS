const fs = require("fs");
const path = require("path");

class MyTimer {
    constructor(_time, _saveFile = path.join(__dirname, "timer.txt")) {
        this.startTime = _time
        this.time = this.startTime;
        this.isPlaying = false;
        this.interval = null;
        this.saveFile = _saveFile;
        console.log("Timer created with " + _time + " seconds");
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
        if (this.time <= 0 || this.isPlaying == false) {
            this.stopTimer();
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

        return hours + ":" + minutes + ":" + seconds;
    }

    saveToFile = (timeString) => {
        fs.writeFile(this.saveFile, timeString, function (err) {
            if (err) throw err;
        })
    }

    updateTexts = (timeString) => {
        document.getElementById("txtTimer").innerText = timeString;
        this.saveToFile(timeString);
    }
}

module.exports = MyTimer;