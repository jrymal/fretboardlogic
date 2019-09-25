'use strict';

var NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var STD_SCALE_INTERVAL = [ 2, 2, 1, 2, 2, 2, 1];
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
    for(var degree = 0; degree< length(modifiers.intervals); degree++){
        o[note] = new NoteInfo(note, degree+1);
        var distance = modifiers.intervals[degree];
        note = getNextNote(NOTES, note, distance);
    }

    return o;
}

ScaleInfo.prototype.getChord = function(degree){
    if (this.modifiers.notes.indexOf(degree) >= 0){
        return new ChordInfo(this.noteMap, this.scale, degree);
    }
    return null;
}

ScaleInfo.prototype.getNote = function(note){
    var noteInfo = this.noteMap[note];

    if (noteInfo && this.modifiers.notes.indexOf(noteInfo.degree) >= 0){
        return noteInfo;
    }
    return null;
}

/*-ChordInfo------------------------------------------------*/
function ChordInfo(scaleNoteMap, scaleList, degree){
    this.degree=degree;
    this.noteMap = this.generateNoteMap(scaleNoteMap, degree);

    this.scale = scaleList;
    this.note = scaleList[degree-1];

    this.name = this.note +" "+this.getModifier() +"("+this.getDegreeAsRN()+") Chord";
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
    
    var totalDistance = 0;
    for(var degree = 0; degree <= length(CHORD_INTERVAL); degree++){
        o[note] = new NoteInfo(note, totalDistance+1);
        var distance = CHORD_INTERVAL[degree];
        note = getNextNote(scale, note, distance);
        totalDistance+=distance;
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
ChordInfo.prototype.getDegreeAsRN = function(){
    switch(this.degree){
        case 1: return "I";
        case 2: return "ii";
        case 3: return "iii";
        case 4: return "IV";
        case 5: return "V";
        case 6: return "vi";
        case 7: return "vii";
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
