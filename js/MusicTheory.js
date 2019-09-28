'use strict';

var NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var STD_SCALE_INTERVAL = [ 2, 2, 1, 2, 2, 2, 1];
var STD_SCALE_DEGREES = [ 1, 2, 3, 4, 5, 6, 7];
var CHORD_INTERVAL = [ 2, 2];

function getNextNote(noteList, note, dist = 1){
    var noteListLength = length(noteList);
    return noteList[(noteList.indexOf(note)+dist+noteListLength) % noteListLength];
}

function getDegreeAsString(inDegree){
    var degree = isBlank(inDegree) ? this.degree : inDegree;
    switch(degree){
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


function ScaleInfo(key, modifiers){
    // String
    this.key = key;
    // Modifier Obj
    this.modifiers = modifiers;
    // Map Obj <Note String, NoteInfo>
    this.noteMap = this.generateNoteMap(modifiers);
    // List Note Strings
    this.scale = Object.values(this.noteMap)
        .sort(function(a, b){ return a.degree-b.degree})
        .map(noteInfo => noteInfo.note);

    // String
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
        return new ChordInfo(this,  degree);
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

ScaleInfo.prototype.getRootNoteInfo = function(){
    return this.getNote(this.key);
}
ScaleInfo.prototype.isInScale= function(noteInfo){
    return this.getNote(exists(noteInfo["note"]) ? noteInfo.note : noteInfo);
}

/*-ChordInfo------------------------------------------------*/
function ChordInfo(scaleInfo, degree){
    // the degree in the scale
    this.degree=degree;
    // The scale info object
    this.scaleInfo = scaleInfo;

    // the root note in this chord
    this.note = scaleInfo.scale[degree-1];

    this.noteMap = this.generateNoteMap(scaleInfo.noteMap, degree);

    // the Chord's True Scale
    this.chordScale = new ScaleInfo(this.note, {
        "notes":STD_SCALE_DEGREES,
        "intervals":STD_SCALE_INTERVAL
    });


    // display name for the chord
    this.name = this.note +this.getModifier() +"("+this.getDegreeAsRN()+") Chord";
}

ChordInfo.prototype.getNote = function(note){
    return this.noteMap[note];
}

ChordInfo.prototype.generateNoteMap= function(scaleNoteMap, degree){
    var o = new Object();

    var note = this.note;
    var totalDistance = 0;
    for(var degree = 0; degree <= length(CHORD_INTERVAL); degree++){
        o[note] = new NoteInfo(note, totalDistance+1);
        var distance = CHORD_INTERVAL[degree];
        note = getNextNote(this.scaleInfo.scale, note, distance);
        totalDistance+=distance;
    }

    return o;
}

ChordInfo.prototype.getModifier = function(){

    // iterate though the note map
    return new MusicDiffs(Object.values(this.chordScale.noteMap)
        .sort(function(a, b){ return a.degree-b.degree})
        .map(
            // returnthe notes with distance (x#/xb) from scale value
             noteInfo => 
                noteInfo.findClosestNoteInfoInList(this.scaleInfo)
        )).toString();
}

ChordInfo.prototype.getDegreeAsRN = function(){
    switch(this.degree){
        case 1: return "I";
        case 2: return "II";
        case 3: return "III";
        case 4: return "IV";
        case 5: return "V";
        case 6: return "VI";
        case 7: return "VII";
    }
    console.log("Unknown degree");
    return null;
}

ChordInfo.prototype.getDegreeAsString = function(){
    return getDegreeAsString(this.degree);
}

/*-NoteInfo------------------------------------------------*/
function NoteInfo(note, degree){
    this.note = note;
    this.degree = degree;
}

NoteInfo.prototype.findClosestNoteInfoInList = function(scaleInfo) {
    // check if note is in scale
    var inScale;
    for(var distance = 0; distance <= 3; distance++){
        var modDist = -distance;
        inScale = getNextNote(NOTES,this.note, modDist);
        if(scaleInfo.isInScale(inScale)){
            return new NoteDiff(this.note, inScale, modDist);
        }
        if (distance > 0 ) {
            modDist = distance;
            inScale = getNextNote(NOTES, this.note,modDist);
            if(scaleInfo.isInScale(inScale)){
                return new NoteDiff(this, inScale, modDist);
            }
        }
    }
    
    console.log("I don't think this is possible, but no notes in the last 7 notes of the scale");
    return null;
}

NoteInfo.prototype.getDegreeAsString = function (){
    return getDegreeAsString(this.degree); 
}
/*-NoteDiff------------------------------------------------*/
function NoteDiff(noteInfoA, noteB, distance){
    this.noteInfoA = noteInfoA;
    this.noteB = noteB;
    this.distance = distance;
}

/*-MusicDiffs------------------------------------------------*/
function MusicDiffs(noteDiffArray){
    this.noteDiffArray = noteDiffArray;
}


MusicDiffs.prototype.toString = function() {
    this.noteDiffArray.forEach(
        function(noteDiff) {
            if (noteDiff.distance != 0) {
                switch(noteDiff.noteInfoA.degree){
                    case 1: 
                        console.log("root "+noteDiff.distance);
                    case 2: 
                        console.log("2 "+noteDiff.distance);
                    case 3: 
                        console.log("3 "+noteDiff.distance);
                    case 4: 
                        console.log("4 "+noteDiff.distance);
                    case 5: 
                        console.log("5 "+noteDiff.distance);
                    case 6: 
                        console.log("6 "+noteDiff.distance);
                    case 7: 
                        console.log("7 "+noteDiff.distance);
                }
            }
        }
    );

    return "";
}
