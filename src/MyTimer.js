const fs = require("fs");

class MyTimer {
    constructor(_btnResumeStop, config) {
        this.config = config;
        this.time = this.config.startTime;
        this.isPlaying = false;
        this.interval = null;
        this.btnResumeStop = _btnResumeStop;
        this.isDone = false;
        this.audio = null;
        this.txtTimer = document.getElementById("txtTimer");
        this.txtTimer.parentNode.classList.add("hidden");
        this.updateTexts();

        this.updateAudio();
        console.log("Timer created with " + this.time + " seconds at " + this.config.saveFile);

        if (this.config.automaticStart) this.startTimer();
    }

    updateAudio = () => {
        if (this.config.audioPath) {
            console.log("Loading audio file " + this.config.audioPath);
            this.audio = new Audio(this.config.audioPath);
        }
    }


    startTimer = () => {
        console.log("Timer started");
        this.time = (this.config.isCountdown) ? this.config.startTime : 0;
        this.isDone = false;
        if (!this.isPlaying) {
            this.interval = setInterval(this.processTimer, 1000);
        }
        this.isPlaying = true;
        this.btnResumeStop.hidden = false;
        this.btnResumeStop.innerText = "Stop";
        this.txtTimer.parentNode.classList.remove("hidden");

    }

    convertTimeToSeconds = (_h, _m, _s) => {
        return Number(_h) * 3600 + Number(_m) * 60 + Number(_s);
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
        this.txtTimer.parentNode.classList.add("hidden");
    }

    handleTimerEnd = () => {
        this.btnResumeStop.hidden = true;
        this.isDone = true;
        this.stopTimer();
        if (this.config.playAudioOnEnd && this.audio) {
            console.log("Playing audio");
            this.audio.play();
        }
    }


    processTimer = () => {
        if (this.isPlaying) {
            if (this.config.isCountdown) {
                this.decreaseTimer();
            } else if (!this.config.isCountdown) {
                this.increaseTimer();
            }
        }
        if ((this.time <= 0 && this.config.isCountdown) || (this.time >= this.config.startTime && !this.config.isCountdown)) this.handleTimerEnd();

        this.updateTexts()
        console.log(this.time)
    }

    decreaseTimer = () => {
        this.time--;
    }

    increaseTimer = () => {
        this.time++;
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

        return this.getStringToOutputStyle(hours, minutes, seconds);
    }

    getStringToOutputStyle = (hours, minutes, seconds) => {
        let output = this.config.outputStyle;
        output = output.replace("{{hh}}", hours);
        output = output.replace("{{min}}", minutes);
        output = output.replace("{{sec}}", seconds);
        return output;
    }

    saveToFile = (timeString) => {
        let textEnd = (this.config.textOnEnd) ? this.config.textOnEnd : "";
        timeString = (!this.isDone) ? timeString : textEnd;
        console.log(timeString);
        fs.writeFile(this.config.saveFile, timeString, function (err) {
            if (err) throw err;
        })
    }

    updateTexts = () => {
        let timeString = this.getTimeString();
        if (!timeString) timeString = "";
        if (!this.isDone) {
            this.txtTimer.innerText = timeString;
        } else {
            this.txtTimer.innerText = "Time's up!";
        }
        this.saveToFile(timeString);
    }
}

module.exports = MyTimer;