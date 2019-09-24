'use strict';

var NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var SCALE_INTERVAL = [ 2, 2, 1, 2, 2, 2, 1];
var CHORD_INTERVAL = [ 2, 2];

function getNextNote(noteList, note, dist = 1){
    return noteList[(noteList.indexOf(note)+dist) % length(noteList)];
}

function ScaleInfo(key, modifiers){
    this.key = key;
    this.modifiers = modifiers;
    this.noteMap = this.generateNoteMap(modifiers);
    
    this.scale = Object.values(this.noteMap)
        .sort(function(a, b){ return a.degree-b.degree})
        .map(noteInfo => noteInfo.note);

    this.name = key +" Scale";
}

ScaleInfo.prototype.generateNoteMap= function(modifiers){
    var o = new Object();

    var note = this.key;
    for(var degree = 0; degree< length(SCALE_INTERVAL); degree++){
        o[note] = new NoteInfo(note, degree+1);
        var distance = SCALE_INTERVAL[degree];
        note = getNextNote(NOTES, note, distance);
    }

    return o;
}

ScaleInfo.prototype.getChord = function(degree){
    return new ChordInfo(this.noteMap, this.scale, degree);
}

ScaleInfo.prototype.getNote = function(note){
    return this.noteMap[note];
}

/*-ChordInfo------------------------------------------------*/
function ChordInfo(scaleNoteMap, scaleList, degree){
    this.degree=degree;
    this.noteMap = this.generateNoteMap(scaleNoteMap, degree);

    this.scale = scaleList;
    this.note = scaleList[degree-1];

    this.name = this.note +" "+this.getModifier() +" Chord";
}

ChordInfo.prototype.getNote = function(note){
    return this.noteMap[note];
}

ChordInfo.prototype.generateNoteMap= function(scaleNoteMap, degree){
    var o = new Object();

    var scale = Object.values(scaleNoteMap)
        .sort(function(a, b){ return a.degree-b.degree})
        .map(noteInfo => noteInfo.note)
    ;

    var note = scale[degree-1];
    
    for(var degree = 0; degree <= length(CHORD_INTERVAL); degree++){
        o[note] = new NoteInfo(note, degree+1);
        var distance = CHORD_INTERVAL[degree];
        note = getNextNote(scale, note, distance);
    }

    return o;
}
ChordInfo.prototype.getModifier = function(){
    switch(this.degree){
        case 1: 
        case 4: 
        case 5: 
            return "Major";
        case 2:
        case 3:
        case 6:
            return "Minor";
        case 7: return "Augmented";
    }
    console.log("Unknown degree");
    return null;
}
/*-NoteInfo------------------------------------------------*/
function NoteInfo(note, degree){
    this.note = note;
    this.degree = degree;
}

NoteInfo.prototype.getDegreeAsString = function(){
    switch(this.degree){
        case 1: return "root";
        case 2: return "second";
        case 3: return "third";
        case 4: return "fourth";
        case 5: return "fifth";
        case 6: return "sixth";
        case 7: return "seventh";
    }
    console.log("Unknown degree");
    return null;
}
