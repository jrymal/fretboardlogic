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
        "mods":[],
        "notes":STD_SCALE_DEGREES,
        "intervals":STD_SCALE_INTERVAL
    },
    "nmin":{
        "notes":STD_SCALE_DEGREES,
        "mods":["3b"],
        "intervals":[ 2, 1, 2, 2, 1, 2, 2]
    },
    "hmin":{
        "notes":STD_SCALE_DEGREES,
        "mods":["3:b",],
        "intervals":[ 2, 1, 2, 2, 1, 3, 1]
    },
    "pent":{
        "notes":[1, 3, 5, 7],
        "intervals":STD_SCALE_INTERVAL
    },
    "whole":{
        "notes":[1, 2, 3, 4, 5, 6],
        "intervals":[2, 2, 2, 2, 2, 2]
    },
    "blues":{
        "notes":[1, 2, 3, 4, 5, 6],
        "intervals":[3, 2, 1, 1, 3, 2]
    },
    "ionian":{
        "notes":STD_SCALE_DEGREES,
        "intervals":STD_SCALE_INTERVAL
    },
    "dorian":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(STD_SCALE_INTERVAL, 1)
    },
    "phyrigian":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(STD_SCALE_INTERVAL, 2)
    },
    "lydian":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(STD_SCALE_INTERVAL, 3)
    },
    "mixolydian":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(STD_SCALE_INTERVAL, 4)
    },
    "aeolian":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(STD_SCALE_INTERVAL, 5)
    },
    "locrian":{
        "notes":STD_SCALE_DEGREES,
        "intervals":safeRotateLeft(STD_SCALE_INTERVAL, 6)
    },

};

let installPromptEvent;
function init(){
    window.addEventListener('beforeinstallprompt', (event) => {
        // Prevent Chrome <= 67 from automatically showing the prompt
        event.preventDefault();
        // Stash the event so it can be triggered later.
        installPromptEvent = event;

        show($('install-app'), true);
    });

    addListeners();
    updateAll();
}

function installApp() {

    show($('install-app'), false);
  
    // Show the modal add to home screen dialog
    installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.debug('User accepted the A2HS prompt');
        } else {
          console.debug('User dismissed the A2HS prompt');
        }
        // Clear the saved prompt since it can't be used again
        installPromptEvent = null;
    });
}

function addListeners(){
    $("instrument").addEventListener("change", updateAll);
    $("key").addEventListener("change", updateAll);
    $("modifier").addEventListener("change", updateAll);
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
    ;
}

