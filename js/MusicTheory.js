'use strict';

var SCALE_DEGREES= [1,2,3,4,5,6,7];
var INTERVALS = [ 2, 2, 1, 2, 2, 2, 1];

function ScaleInfo(key, modifiers){
    this.key = key;
    this.modifiers = modifiers;
    this.noteMap = this.generateNoteMap(this.buildDegreeList(SCALE_DEGREES, modifiers));
}

ScaleInfo.prototype.generateNoteMap= function(degreeList){
    return {};
}

ScaleInfo.prototype.buildDegreeList = function(degreeList, modifiers){
    return {};
}

ScaleInfo.prototype.getChord = function(degree){
    return new ChordInfo(this.noteMap, degree);
}

ScaleInfo.prototype.getNote = function(note){
    return this.noteMap[note];
}

function ChordInfo(scaleNoteMap, degree){
    this.degree=degree;
    this.noteMap = this.generateNoteMap(scaleNoteMap, degree);
}

ChordInfo.prototype.getNote = function(note){
    return this.noteMap[note];
}

ChordInfo.prototype.generateNoteMap= function(scaleNoteMap, degree){
    return {};
}

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
