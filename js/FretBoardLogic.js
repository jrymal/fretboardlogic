'use strict';

var INSTRUMENTS = {
    "banjo5":["G:5", "D", "G", "B", "D"],
    "bass4":["E", "A", "D", "G"],
    "bass5":["B", "E", "A", "D", "G"],
    "guitar":["E", "A", "D", "G", "B", "E"],
    "guitar7":["B", "E", "A", "D", "G", "B", "E"],
    "mandolin":["G", "D", "A", "E"],
};

var SCALES = {
    /*
     * notes - list of degrees in scale; acts as a filter for the degrees in the scale
     * mods - list of modifications to the sccale; display only
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

function FretBoardApp(){
    this.installPromptEvent;
    this.addListeners();
}

FretBoardApp.prototype.addListeners = function(){
    var me = this;
    window.addEventListener("popstate", (event) => {
        me.setState(event.state);
    });
    window.addEventListener("beforeunload", (event) => {
        window.history.replacestate(me.getState(), "Fret Board Logic", "");
        window.history.replacestate(me.getState(), "Fret Board Logic", "");
    });
    
    window.addEventListener("beforeinstallprompt", (event) => {
        // Prevent Chrome <= 67 from automatically showing the prompt
        event.preventDefault();
        // Stash the event so it can be triggered later.
        me.installPromptEvent = event;

        show($('install-app'), true);
    });

    $("instrument").addEventListener("change", updateAll);
    $("key").addEventListener("change", updateAll);
    $("modifier").addEventListener("change", updateAll);
    $("randomizer").addEventListener("click", randomizeScale);
}

FretBoardApp.prototype.setState = function(state){
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

        updateAll();
    }
}

FretBoardApp.prototype.getState = function(){
    return {
        "instrument":$("instrument").value,
        "key":$("key").value,
        "modifier":$("modifier").value
    };
}

let app = new FretBoardApp();
function init(){
    updateAll();
}

function installApp() {

    show($('install-app'), false);
  
    // Show the modal add to home screen dialog
    app.installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    app.installPromptEvent.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.debug('User accepted the A2HS prompt');
        } else {
          console.debug('User dismissed the A2HS prompt');
        }
        // Clear the saved prompt since it can't be used again
        installPromptEvent = null;
    });
}

function updateAll(){

    var stringList = INSTRUMENTS[getSelectedValue($("instrument"))];
    var mod = SCALES[getSelectedValue($("modifier"))];
    var key = getSelectedValue($("key"));

    new FretBoardGenerator(stringList, key, mod)
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
}

function randomizeScale(){
    var selectEle = $("modifier");
    var nodeList = selectEle.querySelectorAll("option");
    var selectedIdx =Math.floor(Math.random() * Math.floor(nodeList.length));
    $("modifier").value = nodeList[selectedIdx].value;
    updateAll();
}

