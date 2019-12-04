'use strict';

const INSTRUMENTS = {
    "banjo5":["G:5", "D", "G", "B", "D"],
    "bass4":["E", "A", "D", "G"],
    "bass5":["B", "E", "A", "D", "G"],
    "bass6":["B", "E", "A", "D", "G", "C"],
    "guitar":["E", "A", "D", "G", "B", "E"],
    "guitar7":["B", "E", "A", "D", "G", "B", "E"],
    "guitar8T":["E","B", "E", "A", "D", "G", "B", "E"],
    "mandolin":["G", "D", "A", "E"],
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
        $("instrument").addEventListener("change", this.updateAll);
        $("key").addEventListener("change", this.updateAll);
        $("modifier").addEventListener("change", this.updateAll);
        $("randomizer").addEventListener("click", randomizeScale);
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
        }
    },

    getState: function(){
        return {
            "instrument":$("instrument").value,
            "key":$("key").value,
            "modifier":$("modifier").value
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

    updateAll: function(){
        history.replaceState( app.getState(), window.title, window.location);

        let mod = SCALES[getSelectedValue($("modifier"))];
        let key = getSelectedValue($("key"));

        let gen
        let inst = getSelectedValue($("instrument"));
        if (inst === "piano") {
            gen = Object.create(KEYBOARD_GENERATOR).init(key, mod);
        } else {
            let stringList = INSTRUMENTS[inst];
            gen = Object.create(FRETBOARD_GENERATOR).init(stringList, key, mod);
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
            this.midiplayer = Object.create(MIDI_PLAYER).init();
        }
        return this.midiplayer;
    }
};

/* HTML functions */
const app = Object.create(FRETBOARD_APP).setInstallPromptHandler();

function init(){
    app.init();
}

function installApp() {
    app.installApp();
}

function randomizeScale(){
    app.randomizeScale();
}

function buildCaption(scaleInfo){
    let eleCaption = document.createElement("caption");
    eleCaption.className += "playable";

    let title = document.createElement("p");
    let button = document.createElement("button");
    
    title.innerHTML = scaleInfo.name;
    button.innerText = "Play Notes";
    setDataAttribute(button, "scale", scaleInfo.scale);
    button.addEventListener('click', playNotes);

    eleCaption.appendChild(title);
    eleCaption.appendChild(button);
    return eleCaption;
}

function playNotes(event){
    let mp = app.getMidiPlayer();
    let scale = getDataAttribute(event.target, "scale");
    mp.playNote(buildUpDown(scale.split(',')));
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

