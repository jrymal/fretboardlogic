'use strict';

var NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var INTERVALS = [ 2, 2, 1, 2, 2, 2, 1];

function MusicTheory(key, modifiers){
    this.key = key;
    this.modifiers= modifiers;
}

MusicTheory.prototype.getScale = function(){
    return new ScaleInfo(this.key, this.modifiers);
}

MusicTheory.prototype.getChord = function(degree){
    return new ChordInfo(this.key, this.modifiers, degree);
}

function ScaleInfo(key, modifiers){
    this.key = key;
    this.modifiers= modifiers;
    this.notes;
}

ScaleInfo.prototype.getNextFret = getNextFret;

function ChordInfo(key, modifiers, degree){
    this.key = key;
    this.modifiers= modifiers;
    this.notes;
}

ChordInfo.prototype.getNextFret = getNextFret;

function getNextNote (note){
    var curIdx;
    for(curIdx = 0; curIdx < length(NOTES); curIdx++){
        if (NOTES[curIdx] === note){
            break;
        }
    }

    return NOTES[(curIdx+1) % length(NOTES)];
}

function getNextFret (fret, fretList, notes){
    var array = new Array();

    fretList.forEach(
        function(noteStr){
            var splitNoteArray = noteStr.split(":");
            var note = splitNoteArray[0];
            var startFret = splitNoteArray[1];
       
            if (!isBlank(startFret) && fret <= startFret){
                array.push(note+":"+startFret);
            } else {
                array.push(getNextNote(note));
            }
        }
    );

    return array;
}



