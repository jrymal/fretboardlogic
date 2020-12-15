"use strict";

const INSTRUMENTS = {
    "banjo5":["G:5", "D", "G", "B", "D"],
    "bass4":["E", "A", "D", "G"],
    "bass5":["B", "E", "A", "D", "G"],
    "bass6":["B", "E", "A", "D", "G", "C"],
    "guitar":["E", "A", "D", "G", "B", "E"],
    "guitar7":["B", "E", "A", "D", "G", "B", "E"],
    "guitar8T":["E","B", "E", "A", "D", "G", "B", "E"],
    "mandolin":["G", "D", "A", "E"],
    "ukuleleBar":["D", "G", "B", "E"],
    "ukuleleSup":["G", "C", "E", "A"],
};

const SCALES = {
    /*
     * notes - list of degrees in scale; acts as a filter for the degrees in the scale
     * intervals - the intervals for each note in sequence in the scale
     */
    "maj":{
        "notes":STD_SCALE_DEGREES,
        "intervals":STD_SCALE_INTERVAL
    },
    "n-min":{
        "notes":STD_SCALE_DEGREES,
        "intervals":[ 2, 1, 2, 2, 1, 2, 2]
    },
    "h-min":{
        "notes":STD_SCALE_DEGREES,
        "intervals":[ 2, 1, 2, 2, 1, 3, 1]
    },
    "h-min-b5":{
        "notes":[1, 2, 3, 4, 5, 6, 7, 8],
        "intervals":[ 2, 1, 2, 1, 1, 1, 3, 1]
    },
    "m-min":{
        "notes":STD_SCALE_DEGREES,
        "intervals":[ 2, 1, 2, 2, 2, 2, 1]
    },
    "pent-maj":{
        "notes":[1, 2, 3, 5, 6],
        "intervals":STD_SCALE_INTERVAL
    },
    "pent-min":{
        "notes":[1, 3, 4, 5, 7],
        "intervals":[ 2, 1, 2, 2, 1, 2, 2]
    },
    "whole":{
        "notes":[1, 2, 3, 4, 5, 6],
        "intervals":[2, 2, 2, 2, 2, 2]
    },
    "blues6":{
        "notes":[1, 2, 3, 4, 5, 6],
        "intervals":[3, 2, 1, 1, 3, 2]
    },
    "blues9":{
        "notes":[1, 2, 3, 4, 5, 6, 7, 8, 9],
        "intervals":[2, 1, 1, 1, 2, 2, 1, 1, 1]
    },
    "egyptian-pent":{
        "notes":[1, 2, 4, 5, 7],
        "intervals":[2, 2, 1, 2, 2, 1, 2]
    },
    "dorian-sharp4":{
        "notes":[1, 2, 3, 4, 5, 6, 7],
        "intervals":[2, 1, 3, 1, 2, 1, 2]
    },
    "phrygian-dom":{
        "notes":[1, 2, 3, 4, 5, 6, 7],
        "intervals":[1, 3, 1, 2, 1, 2, 2]
    },
    "hirajoshi":{
        "notes":[1, 2, 4, 5, 7],
        "intervals":[ 1, 3, 1, 1, 3, 1, 2]
    },
    "aolean-dom":{
        "notes":[1, 2, 3, 4, 5, 6, 7],
        "intervals":[ 2, 2, 1, 2, 1, 2, 2]
    },
    "diminished-2":{
        "notes":[1, 2, 3, 4, 5, 6, 7, 8],
        "intervals":[ 2, 1, 2, 1, 2, 1, 2, 1]
    },
    "diminished-b2":{
        "notes":[1, 2, 3, 4, 5, 6, 7, 8],
        "intervals":[ 1, 2, 1, 2, 1, 2, 1, 2]
    },
    "persian":{
        "notes":[1, 2, 3, 4, 5, 6, 7],
        "intervals":[ 1, 3, 1, 1, 2, 3, 1]
    },
    "doubleharmonic":{
        "notes":[1, 2, 3, 4, 5, 6, 7],
        "intervals":[ 1, 3, 1, 2, 1, 3, 1]
    },
    "doubleharmonic-min":{
        "notes":[1, 2, 3, 4, 5, 6, 7],
        "intervals":[ 2, 1, 3, 1, 1, 3, 1]
    },
    "enigmatic":{
        "notes":[1, 2, 3, 4, 5, 6, 7],
        "intervals":[ 1, 3, 2, 2, 2, 1, 1]
    },
    "ionian-maj":{
        "notes":STD_SCALE_DEGREES,
        "intervals":STD_SCALE_INTERVAL
    },
    "dorian-maj":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(STD_SCALE_INTERVAL, 1)
    },
    "phyrigian-maj":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(STD_SCALE_INTERVAL, 2)
    },
    "lydian-maj":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(STD_SCALE_INTERVAL, 3)
    },
    "mixolydian-maj":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(STD_SCALE_INTERVAL, 4)
    },
    "aeolian-maj":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(STD_SCALE_INTERVAL, 5)
    },
    "locrian-maj":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(STD_SCALE_INTERVAL, 6)
    },
    "ionian-min":{
        "notes":STD_SCALE_DEGREES,
        "intervals":MIN_SCALE_INTERVAL
    },
    "dorian-min":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(MIN_SCALE_INTERVAL, 1)
    },
    "phyrigian-min":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(MIN_SCALE_INTERVAL, 2)
    },
    "lydian-min":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(MIN_SCALE_INTERVAL, 3)
    },
    "mixolydian-min":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(MIN_SCALE_INTERVAL, 4)
    },
    "aeolian-min":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(MIN_SCALE_INTERVAL, 5)
    },
    "locrian-min":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(MIN_SCALE_INTERVAL, 6)
    },
};

const FRETBOARD_APP = {
    init: function(){
        this.setState(history.state);
        this.addUiListeners();
        this.updateAll();
        this.setVolume();
        
        return this;
    },

    setInstallPromptHandler: function(){
        window.onbeforeinstallprompt = function(event){
            // Prevent Chrome <= 67 from automatically showing the prompt
            event.preventDefault();
            // Stash the event so it can be triggered later.
            app.installPromptEvent = event;

            show($('install-app'), true);
        };
        return this;
    },

    addUiListeners: function(){
        var self = this;
        $("install-app").addEventListener("click", () => self.installApp());
        $("volume").addEventListener("change", () => self.setVolume());
        $("instrument").addEventListener("change", () => self.updateAll());
        $("key").addEventListener("change", () => self.updateAll());
        $("modifier").addEventListener("change", () => self.updateAll());
        $("randomizer").addEventListener("click", () => self.randomizeScale());
    },

    setVolume : function(){
        this.saveState();

        let mp = this.getMidiPlayer();
        mp.setVolume($("volume").value);
    },

    setState: function(state){
        if (state){
            if (state["instrument"]){
                $("instrument").value = state["instrument"];
            }
            if (state["key"]){
                $("key").value = state["key"];
            }
            if (state["modifier"]){
                $("modifier").value = state["modifier"];
            }
            if (state["volume"]){
                $("volume").value = state["volume"];
            }
        }
    },

    getState: function(){
        return {
            "instrument":$("instrument").value,
            "key":$("key").value,
            "modifier":$("modifier").value,
            "volume":$("volume").value
        };
    },

    installApp: function(){
        show($('install-app'), false);
      
        // Show the modal add to home screen dialog
        this.installPromptEvent.prompt();
        // Wait for the user to respond to the prompt
        this.installPromptEvent.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
              console.debug('User accepted the A2HS prompt');
            } else {
              console.debug('User dismissed the A2HS prompt');
            }
            // Clear the saved prompt since it can't be used again
            this.installPromptEvent = null;
        });
    },

    saveState: function() {
        history.replaceState( this.getState(), window.title, window.location);
    },

    updateAll: function(){
        this.saveState();

        let modListBox = $("modifier");
        let prettyName = modListBox.options[modListBox.selectedIndex].text;
        let mod = SCALES[getSelectedValue(modListBox)];
        let key = getSelectedValue($("key"));

        let gen;
        let inst = getSelectedValue($("instrument"));
        if (inst === "piano") {
            gen = Object.create(KEYBOARD_GENERATOR).init(key, mod, prettyName);
        } else {
            let stringList = INSTRUMENTS[inst];
            gen = Object.create(FRETBOARD_GENERATOR).init(stringList, key, mod, prettyName);
        }

        gen
        .createScale($("scale-table"))
        .createChord("chord-root", 1)
        .createChord("chord-second", 2)
        .createChord("chord-third", 3)
        .createChord("chord-fourth", 4)
        .createChord("chord-fifth", 5)
        .createChord("chord-sixth", 6)
        .createChord("chord-seventh", 7)
        .createChord("chord-eighth", 8)
        .createChord("chord-ninth", 9)
        ;
    },

    randomizeScale: function(){
        randomizeList("modifier");
        randomizeList("key");
        this.updateAll();
    },
    getMidiPlayer: function(){
        if (!exists(this.midiplayer)){
            this.midiplayer = Object.create(MIDI_PLAYER).init(2);
        }
        return this.midiplayer;
    }
};

/* HTML functions */
const app = Object.create(FRETBOARD_APP).setInstallPromptHandler();

function init(){
    app.init();
}

function buildCaption(scaleInfo){
    let eleCaption = document.createElement("caption");
    eleCaption.className += "playable";

    let title = document.createElement("p");
    let button = document.createElement("button");
    
    title.innerHTML = scaleInfo.name;
    button.innerText = "Play "+scaleInfo.shortName;
    setDataAttribute(button, "scale", scaleInfo.getPlayedNotes());
    button.addEventListener('click', playNotes);

    eleCaption.appendChild(title);
    eleCaption.appendChild(button);
    return eleCaption;
}

function playNotes(event){
    let mp = app.getMidiPlayer();
    let button = event.target;
    let scale = getDataAttribute(button, "scale");
    button.disabled = true;
    mp.playNote(buildUpDown(scale.split(',')), 1, function(){
        button.disabled = false;
    });
}

function buildUpDown(noteList){
    const DEFAULT_OCT = 4;
    let scaleUp = [];
    let currentOct = DEFAULT_OCT;
    let lastIdx = -1;

    noteList.forEach(
        note =>{
            let currentIdx = NOTES.indexOf(note);
            if (currentIdx < lastIdx){
                currentOct++;
            }
            lastIdx = currentIdx;
            scaleUp.push(note+":"+currentOct);
        }
    );
    let scaleDown = clone(scaleUp).reverse();

    return scaleUp.concat(noteList[0]+":"+(DEFAULT_OCT+1), scaleDown);
}

