const fs = require("fs");
const path = require("path");

const ConfigFile = path.join(__dirname, "../public/config.json");
const defaultSaveFile = path.join(__dirname, "../public/timer.txt");
const defaultAudioOnEnd = path.join(__dirname, "../public/audio.mp3");
const defaultOutputStyle = "{{hh}}:{{min}}:{{sec}}";

class Config {

    constructor() {
        this.startTime = 60;
        this.isCountdown = true;
        this.automaticStart = false;
        this.textOnEnd = null;
        this.playAudioOnEnd = false;
        this.saveFile = defaultSaveFile;
        this.audioPath = defaultAudioOnEnd;
        this.outputStyle = defaultOutputStyle;

        this.loadConfiguration()
    }

    saveConfiguration = () => {
        let config = {
            startTime: this.startTime,
            isCountdown: this.isCountdown,
            saveFile: this.saveFile,
            automaticStart: this.automaticStart,
            textOnEnd: this.textOnEnd,
            audioPath: this.audioPath,
            playAudioOnEnd: this.playAudioOnEnd,
            outputStyle: this.outputStyle
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
            if (data) {
                let jsonData = JSON.parse(data)
                this.startTime = jsonData.startTime;
                this.isCountdown = jsonData.isCountdown;
                this.saveFile = jsonData.saveFile;
                this.automaticStart = jsonData.automaticStart;
                this.textOnEnd = jsonData.textOnEnd;
                this.audioPath = jsonData.audioPath;
                this.playAudioOnEnd = jsonData.playAudioOnEnd;
                this.outputStyle = jsonData.outputStyle;
            }
        } catch (err) {
            return;
        }
    }

    changeSavefile = (_savefile) => {
        this.saveFile = _savefile == null ? this.saveFile : _savefile;
        console.log('New savefile : ' + this.saveFile);
        this.saveConfiguration();
    }

    changeSound = (_path) => {
        this.audioPath = _path == null ? this.audioPath : _path;
        console.log('New sound : ' + this.audioPath);
        this.saveConfiguration();
    }

    changeStartTime = (_time) => {
        console.log("New start time : " + _time);
        if (_time !== this.startTime) {
            this.startTime = _time;
            this.saveConfiguration();
        }
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

    setOutputStyle = _outputStyle => {
        this.outputStyle = _outputStyle
        console.log(_outputStyle)
        this.saveConfiguration();
    }

    setIsCountdown = value => {
        this.isCountdown = value;
        this.saveConfiguration();
    }
}


module.exports = Config;