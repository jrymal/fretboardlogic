'use strict';

var NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

var MIN_SCALE_INTERVAL = [ 2, 1, 2, 2, 2, 2, 1];
var STD_SCALE_INTERVAL = [ 2, 2, 1, 2, 2, 2, 1];
var STD_SCALE_DEGREES = [ 1, 2, 3, 4, 5, 6, 7];

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
        case 8: return "eighth";
        case 9: return "ninth";
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
        .sort((a, b) => a.degree-b.degree)
        .map(noteInfo => noteInfo.note);

    // String
    this.name = key +" Scale";
    this.chords = {};
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
        var foundChord = this.chords[degree];
        if (!exists(foundChord)) {
            foundChord = new ChordInfo(this,  degree);
            this.chords[degree] = foundChord;
        }

        if (!foundChord.hasMatch(this.chords)){
            return foundChord;
        }
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
    return exists(this.getNote(exists(noteInfo["note"]) ? noteInfo.note : noteInfo));
}

/*-ChordInfo------------------------------------------------*/
function ChordInfo(scaleInfo, degree){
    // the degree in the scale
    this.degree=degree;
    // The scale info object
    this.scaleInfo = scaleInfo;

    // the root note in this chord
    this.note = scaleInfo.scale[degree-1];

    // the Chord's True Scale
    this.chordScale = new ScaleInfo(this.note, {
        "notes":STD_SCALE_DEGREES,
        "intervals":STD_SCALE_INTERVAL
    });

     // iterate though the note map
    this.musicDiff = new MusicDiffs(Object.values(this.chordScale.noteMap)
        .map(
            // return the notes with distance (x#/xb) from scale value
            noteInfo => noteInfo.findClosestNoteInfoInList(this.scaleInfo)
        )
    );

    this.noteMap = this.generateNoteMap(this.musicDiff.asScale(this.chordScale.scale));

    var chordName = new ChordName(this.musicDiff, Object.values(this.noteMap).map((noteInfo) => noteInfo.degree));

    // display name for the chord
    this.name = this.note +chordName.primaryName + "<sup>"+chordName.addedNotes+"</sup> ("+this.getDegreeAsRN()+") Chord";
}

ChordInfo.prototype.hasMatch = function(chordMap){
    var matches = Object.values(chordMap)
        .filter( (chord) => this !== chord )
        .filter( (chord) => this.equalsNoteMap(chord.noteMap) );

    if (matches.length > 0){
        console.log(this.name+" is duplicated by "+matches.map((chordInfo) => chordInfo.note ));
    }

    return matches.length > 0;
}

ChordInfo.prototype.equalsNoteMap = function(noteMap){
    return Object.keys(noteMap)
        .filter( (note) => exists(this.noteMap[note]) )
        .length == Object.keys(this.noteMap).length;
}

ChordInfo.prototype.getNote = function(note){
    return this.noteMap[note];
}

var CHORD_DEGREES = [1,3,5];

ChordInfo.prototype.generateNoteMap= function(scale){
    var o = {};
    var chordRoot = this.note;
    CHORD_DEGREES
        .forEach((degree) => {
            var note = getNextNote(scale, chordRoot, degree-1);
            var chordScaleNoteInfo = this.chordScale.getNote(note);
            var degreeBasedNoteInfo = new NoteInfo(note, degree);
            var choosenNote = chordScaleNoteInfo != null ? chordScaleNoteInfo : degreeBasedNoteInfo;
            o[choosenNote.note] = choosenNote;
        });

    return o;
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
        case 8: return "VIII";
        case 9: return "IX";
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
            return new NoteDiff(this, inScale, modDist);
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

NoteDiff.prototype.getDistanceAsString= function(){
    var result="";
    var char = this.distance < 0 ? 'b' : '#';
    for (var i = Math.abs(this.distance); i > 0; i-- ){
        result += char;
    }
    return result;
}

NoteDiff.prototype.toString = function(){
    var response = "";
    switch(this.noteInfoA.degree){
        case 1:
            return ""; 
        case 2:
            return this.getDistanceAsString()+"11"
        case 3:
            return this.getDistanceAsString()+"3"
        case 4:
            return this.getDistanceAsString()+"11"
        case 5:
            return this.getDistanceAsString()+"5"
        case 6:
            return this.getDistanceAsString()+"13"
        case 7:
            return this.getDistanceAsString()+"7"
        case 8:
            return this.getDistanceAsString()+"8"
        case 9:
            return this.getDistanceAsString()+"9"
    }
    return "";
}

/*-MusicDiffs------------------------------------------------*/
function MusicDiffs(noteDiffArray){
    this.noteDiffArray = noteDiffArray;
}

MusicDiffs.prototype.asScale = function(scale) {
    var clonedScale = clone(scale);

    // apply noteDiffs
    this.noteDiffArray
        .forEach(
            (noteDiff) => {
                var curNote = clonedScale[noteDiff.noteInfoA.degree - 1];
                clonedScale[noteDiff.noteInfoA.degree - 1] = getNextNote(NOTES, curNote, noteDiff.distance);
            }
        );

    return clonedScale;
}

/*-ChordName------------------------------------------------*/
function ChordName(musicDiffs, degrees) {
    var ndList = musicDiffs.noteDiffArray
            .filter(noteDiff => degrees.indexOf(noteDiff.noteInfoA.degree)>=0);

    var ndMap = ndList.reduce((map, noteDiff) => {
        map[noteDiff.noteInfoA.degree] = noteDiff;
        return map;
    },{});

    this.primaryName = this.identifyPrimaryName(ndMap);
    this.addedNotes = this.identifyAddedNotes(ndMap);
}

ChordName.prototype.identifyPrimaryName=function(ndMap){
    if (this.isFlat(ndMap, 3) && this.isFlat(ndMap, 5)){
        delete ndMap[3];
        delete ndMap[5];
        return "dim";
    }
    else if (this.isNormal(ndMap, 3) && this.isSharp(ndMap, 5)){
        delete ndMap[3];
        delete ndMap[5];
        return "aug";
    }
    else if (this.isFlat(ndMap, 3) && this.isNormal(ndMap, 5)){
        delete ndMap[3];
        delete ndMap[5];
        return "min";
    }
    else if (this.isNormal(ndMap, 4) && this.isNormal(ndMap, 5)){
        delete ndMap[4];
        delete ndMap[5];
        return "sus4";
    }
    else if (this.isNormal(ndMap, 2) && this.isNormal(ndMap, 5)){
        delete ndMap[2];
        delete ndMap[5];
        return "sus2";
    }
    else if (this.isNormal(ndMap, 3) && this.isNormal(ndMap, 5)){
        delete ndMap[3];
        delete ndMap[5];
        return "maj";
    }
    else if (this.isFlat(ndMap, 3)){
        // separate to handle the cases where the 5th is altered in some way
        delete ndMap[3];
        return "min";
    }
    else if (this.isNormal(ndMap, 3)){
        // separate to handle the cases where the 5th is altered in some way
        delete ndMap[3];
        return "";
    }


    return "";
}

ChordName.prototype.isSharp=function(ndMap, degree){
    return exists(ndMap[degree]) && (ndMap[degree].distance == 1);
}
ChordName.prototype.isFlat=function(ndMap, degree){
    return exists(ndMap[degree]) && (ndMap[degree].distance == -1);
}
ChordName.prototype.isNormal=function(ndMap, degree){
    return exists(ndMap[degree]) && (ndMap[degree].distance == 0);
}

ChordName.prototype.identifyAddedNotes=function(ndMap){
    var result="";
    for(var i = 1; i <= 9; i++){
        if (exists(ndMap[i])){
            var noteDiff = ndMap[i];
            switch(noteDiff.noteInfoA.degree){
                case 1:
                case 3:
                case 5: 
                case 2: 
                case 4: 
                case 6: 
                case 7: 
                case 8:
                case 9:
                    result+=noteDiff.toString();
                    break;
            }
        }
    }

    return result;
}
