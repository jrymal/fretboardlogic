'use strict';
const CHAR_FLAT="\u266D";
const CHAR_NATURAL="\u266E";
const CHAR_SHARP="\u266F";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const MIN_SCALE_INTERVAL = [ 2, 1, 2, 2, 2, 2, 1];
const STD_SCALE_INTERVAL = [ 2, 2, 1, 2, 2, 2, 1];
const STD_SCALE_DEGREES = [ 1, 2, 3, 4, 5, 6, 7];

const CHORD_DEGREES = [1,3,5];

function getNextNote(noteList, note, dist = 1){
    let noteListLength = length(noteList);
    return noteList[(noteList.indexOf(note)+dist+noteListLength) % noteListLength];
}

function getDisplayNote(note){
    return note.replace("#", CHAR_SHARP).replace("b",CHAR_FLAT);
}

function getDegreeAsString(scaleIdx){
    switch(scaleIdx){
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
    console.log("Unknown scale idx: "+scaleIdx);
    return null;
}
function getDegreeAsRN(scaleIdx){
    switch(scaleIdx){
        case 1: return "I";
        case 2: return "II";
        case 3: return "III";
        case 4: return "IV";
        case 5: return "V";
        case 6: return "VI";
        case 7: return "VII";
    }
    console.log("Unknown scale idx: "+scaleIdx);
    return null;
}

const SCALE_INFO = {
    init: function(key, modifiers, prettyName){
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
        this.name = getDisplayNote(key) + " " + prettyName + " Scale";
        this.shortName = this.name;
        this.chords = {};

        return this;
    },

    generateNoteMap: function(modifiers){
        let o = new Object();

        let note = this.key;
        for(let degree = 0; degree< length(modifiers.intervals); degree++){
            o[note] = Object.create(NOTE_INFO).init(note, degree+1);
            let distance = modifiers.intervals[degree];
            note = getNextNote(NOTES, note, distance);
        }

        return o;
    },

    getChord: function(scaleIdx){
        if (this.modifiers.notes.indexOf(scaleIdx) >= 0){
            let foundChord = this.chords[scaleIdx];
            if (!exists(foundChord)) {
                foundChord = Object.create(CHORD_INFO).init(this,  scaleIdx);
                this.chords[scaleIdx] = foundChord;
            }

            if (!foundChord.hasMatch(this.chords)){
                return foundChord;
            }
        }
        return null;
    },

    getNote: function(note){
        let noteInfo = this.noteMap[note];

        if (noteInfo && this.modifiers.notes.indexOf(noteInfo.degree) >= 0){
            return noteInfo;
        }
        return null;
    },

    getRootNoteInfo: function(){
        return this.getNote(this.key);
    },

    isInScale: function(noteInfo){
        return exists(this.getNote(exists(noteInfo["note"]) ? noteInfo.note : noteInfo));
    },

    getDegreeFromNote: function(noteInfo){

        if (!exists(this.majScale)){
            this.majScale = Object.create(SCALE_INFO).init(this.key, {
                "notes":STD_SCALE_DEGREES,
                "intervals":STD_SCALE_INTERVAL
            }, "Major");
        }

        let noteDiff = noteInfo.findClosestNoteInfoInList(this.majScale, 1);
        if (noteDiff){
            return noteDiff.asDegree(1);
        }

        return "";
    },
};

/*-ChordInfo------------------------------------------------*/
const CHORD_INFO={
    init: function(scaleInfo, scaleIdx){
        // the degree in the scale
        this.scaleIdx=scaleIdx;

        // The scale info object
        this.scaleInfo = scaleInfo;

        // the root note in this chord
        this.note = scaleInfo.scale[scaleIdx-1];
        this.noteInfo = scaleInfo.getNote(this.note);

        this.degree= this.scaleInfo.getDegreeFromNote(this.noteInfo);
        
        // the Chord's True Scale
        this.chordScale = Object.create(SCALE_INFO).init(this.note, {
            "notes":STD_SCALE_DEGREES,
            "intervals":STD_SCALE_INTERVAL
        }, "Major");

         // iterate though the note map
        this.musicDiff = Object.create(MUSIC_DIFF).init(Object.values(this.chordScale.noteMap)
            .map(
                // return the notes with distance (x#/xb) from scale value
                noteInfo => noteInfo.findClosestNoteInfoInList(this.scaleInfo)
            )
        );

        this.noteMap = this.generateNoteMap(this.musicDiff.asScale(this.chordScale.scale));

        this.scale = Object.keys(this.noteMap);

        let chordName = Object.create(CHORD_NAME).init(this.musicDiff, Object.values(this.noteMap).map((noteInfo) => noteInfo.degree));

        // display name for the chord
        this.shortName = this.note +chordName.primaryName;
        this.name = clone(this.shortName);
        if (!isBlank(chordName.addedNotes)){
            this.name += "<sup>"+chordName.addedNotes+"</sup> ";
        }
        this.name += NBSP+NBSP+"-"+NBSP+NBSP+this.getDegreeAsRN();
        return this;
    },

    hasMatch: function(chordMap){
        let matches = Object.values(chordMap)
            .filter( (chord) => this !== chord )
            .filter( (chord) => this.equalsNoteMap(chord.noteMap) );

        if (matches.length > 0){
            console.log(this.name+" is duplicated by "+matches.map((chordInfo) => chordInfo.name+"," ));
        }

        return matches.length > 0;
    },

    equalsNoteMap: function(noteMap){
        return Object.keys(noteMap)
            .filter( (note) => exists(this.noteMap[note]) )
            .length == Object.keys(this.noteMap).length;
    },

    getNote : function(note){
        return this.noteMap[note];
    },


    generateNoteMap: function(scale){
        let o = {};
        let chordRoot = this.note;
        CHORD_DEGREES
            .forEach((degree) => {
                let note = getNextNote(scale, chordRoot, degree-1);
                let chordScaleNoteInfo = this.chordScale.getNote(note);
                let degreeBasedNoteInfo = Object.create(NOTE_INFO).init(note, degree);
                let choosenNote = chordScaleNoteInfo != null ? chordScaleNoteInfo : degreeBasedNoteInfo;
                o[choosenNote.note] = choosenNote;
            });

        return o;
    },

    getDegreeAsRN : function(){
        return this.degree;
    },

    getDegreeAsString : function(){
        return getDegreeAsString(this.scaleIdx);
    },
};

/*-NoteInfo------------------------------------------------*/
const NOTE_INFO ={
    init: function(note, degree){
        this.note = note;
        this.degree = degree;
        return this;
    },

    findClosestNoteInfoInList : function(scaleInfo, firstMod = -1) {
        // check if note is in scale
        let inScale;
        for(let distance = 0; distance <= 3; distance++){
            let modDist = firstMod * distance;
            inScale = getNextNote(NOTES,this.note, modDist);
            if(scaleInfo.isInScale(inScale)){
                return Object.create(NOTE_DIFF).init(this, scaleInfo.getNote(inScale), modDist);
            }
            if (distance > 0 ) {
                modDist = (-1 * firstMod) * distance;
                inScale = getNextNote(NOTES, this.note,modDist);
                if(scaleInfo.isInScale(inScale)){
                    return Object.create(NOTE_DIFF).init(this, scaleInfo.getNote(inScale), modDist);
                }
            }
        }
        
        console.log("I don't think this is possible, but no notes in the last 7 notes of the scale");
        return null;
    },

    getDegreeAsString : function (){
        return getDegreeAsString(this.degree); 
    }
};

/*-NoteDiff------------------------------------------------*/
const NOTE_DIFF = {
    init: function (noteInfoA, noteInfoB, distance){
        this.noteInfoA = noteInfoA;
        this.noteInfoB = noteInfoB;
        this.distance = distance;
        return this;
    },

    // invert is either 0 or 1
    getDistanceAsString: function(invert=false){
        let result="";
        let char = (invert != (this.distance < 0)) ? CHAR_FLAT : CHAR_SHARP;
        for (let i = Math.abs(this.distance); i > 0; i-- ){
            result += char;
        }
        return result;
    },

    asDegree : function(){
        let deg = "";
        let dist = this.getDistanceAsString(true);
        if (dist.length > 0) {
            deg += dist;
        }
        return "<code>"+deg+getDegreeAsRN(this.noteInfoB.degree)+"</code>";
    },

    toString : function(){
        let response = "";
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
    },
};

/*-MusicDiffs------------------------------------------------*/
const MUSIC_DIFF = {
    init:function (noteDiffArray){
        this.noteDiffArray = noteDiffArray;
        return this;
    },

    asScale : function(scale) {
        let clonedScale = clone(scale);

        // apply noteDiffs
        this.noteDiffArray
            .forEach(
                (noteDiff) => {
                    let curNote = clonedScale[noteDiff.noteInfoA.degree - 1];
                    clonedScale[noteDiff.noteInfoA.degree - 1] = getNextNote(NOTES, curNote, noteDiff.distance);
                }
            );

        return clonedScale;
    },
}

/*-ChordName------------------------------------------------*/
const CHORD_NAME = {
    init: function(musicDiffs, degrees) {
        let ndList = musicDiffs.noteDiffArray
                .filter(noteDiff => degrees.indexOf(noteDiff.noteInfoA.degree)>=0);

        let ndMap = ndList.reduce((map, noteDiff) => {
            map[noteDiff.noteInfoA.degree] = noteDiff;
            return map;
        },{});

        this.primaryName = this.identifyPrimaryName(ndMap);
        this.addedNotes = this.identifyAddedNotes(ndMap);
        return this;
    },

    identifyPrimaryName:function(ndMap){
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
    },

    isSharp:function(ndMap, degree){
        return exists(ndMap[degree]) && (ndMap[degree].distance == 1);
    },
    isFlat:function(ndMap, degree){
        return exists(ndMap[degree]) && (ndMap[degree].distance == -1);
    },
    isNormal:function(ndMap, degree){
        return exists(ndMap[degree]) && (ndMap[degree].distance == 0);
    },

    identifyAddedNotes:function(ndMap){
        let result="";
        for(let i = 1; i <= 9; i++){
            if (exists(ndMap[i])){
                let noteDiff = ndMap[i];
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
};
