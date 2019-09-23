'use strict';

var INSTRUMENTS = {
    "banjo5":["G:5", "D", "G", "B", "D"],
    "guitar":["E", "A", "D", "G", "B", "E"],
    "guitar7":["B", "E", "A", "D", "G", "B", "E"],
    "mandolin":["G", "D", "A", "E"]
};

function init(){
    addListeners();
    updateAll();
}

function addListeners(){
    $("instrument").addEventListener("change", updateAll);
    $("key").addEventListener("change", updateAll);
}

function updateAll(){

    var stringList = INSTRUMENTS[getSelectedValue($("instrument"))];
    var key = getSelectedValue($("key"));
    var mod = getSelectedValue($("modifier"));

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

