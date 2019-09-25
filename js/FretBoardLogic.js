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
        "notes":[1, 2, 3, 4, 5, 6, 7],
        "mods":[],
        "intervals":STD_SCALE_INTERVAL
    },
    "nmin":{
        "notes":[1, 2, 3, 4, 5, 6, 7],
        "mods":["3b"],
        "intervals":[ 2, 1, 2, 2, 1, 2, 2]
    },
    "hmin":{
        "notes":[1, 2, 3, 4, 5, 6, 7],
        "mods":["3b"],
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

};

function init(){
    addListeners();
    updateAll();
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
    .createChord($("chord-root-table"), 1)
    .createChord($("chord-second-table"), 2)
    .createChord($("chord-third-table"), 3)
    .createChord($("chord-forth-table"), 4)
    .createChord($("chord-fifth-table"), 5)
    .createChord($("chord-sixth-table"), 6)
    .createChord($("chord-seventh-table"), 7)
    ;
}

