'use strict';

var SHOWN_FRETS=15;

function FretBoardGenerator(stringList, key, modifiers){
    this.fretboard = new FretBoard(stringList);
    this.scaleinfo = new ScaleInfo(key, modifiers)
}

// Takes in a table to update to look appropriate for the theory of the scale
FretBoardGenerator.prototype.createScale = function(element){
    this.fretboard.createFrets(element, this.scaleinfo);
    return this;
}

// Takes in a table to update to look appropriate for the theory of the chord (identified by the degree on the scale)
FretBoardGenerator.prototype.createChord = function(element, degree){
    this.fretboard.createFrets(element, this.scaleinfo.getChord(degree));
    return this;
}

function FretBoard(stringList){
    this.stringList = stringList;
}

// Takes in a table to update to look appropriate for the theory of the scale
FretBoard.prototype.createFrets= function(eleTable, scaleInfo){
    
    removeAllChildren(eleTable);

    var eleCaption = document.createElement("caption");
    var eleTHead = document.createElement("thead");
    var eleTBody= document.createElement("tbody");

    eleCaption.innerHTML = scaleInfo.name;

    var currentFret = clone(this.stringList);
    for (var fret = 0; fret < SHOWN_FRETS; fret++){
        var row = eleTBody.insertRow(fret);
    
        for (var stringIdx = 0; stringIdx < length(currentFret); stringIdx++){
            this.configureCellForNote( row.insertCell(stringIdx), scaleInfo, currentFret[stringIdx]);
        }

        if (fret<SHOWN_FRETS){
            currentFret = this.getNextFret(fret+1, currentFret);
        }
    }


    eleTable.appendChild(eleCaption);
    eleTable.appendChild(eleTHead);
    eleTable.appendChild(eleTBody);
}

FretBoard.prototype.configureCellForNote =function(cell, scaleInfo, note){
    if (note.includes(":")){
        return;
    }

    var ni = scaleInfo.getNote(note);

    if (ni){
        cell.classList.add("note");
        cell.classList.add(ni.getDegreeAsString());
    
    }
    
    cell.innerHTML = note;

}

FretBoard.prototype.getNextFret=function  (fret, fretList){
    var array = new Array();

    fretList.forEach(
        function(noteStr){
            var splitNoteArray = noteStr.split(":");
            var note = splitNoteArray[0];
            var startFret = splitNoteArray[1];
       
            if (!isBlank(startFret)){
                if (fret < startFret){
                    array.push(note+":"+startFret);
                } else {
                    array.push(note);
                }
            } else {
                array.push(getNextNote(NOTES, note, 1));
            }
        }
    );

    return array;
}
