'use strict';

var SHOWN_FRETS=15;

function FretBoardGenerator(stringList, key, modifiers){
    this.fretboard = new FretBoard(stringList);
    this.scaleinfo = new ScaleInfo(key, modifiers)
}

// Takes in a table to update to look appropriate for the theory of the scale
FretBoardGenerator.prototype.createScale = function(element){
    this.fretboard.createHorizontalFrets(element, this.scaleinfo);
    return this;
}

// Takes in a table to update to look appropriate for the theory of the chord (identified by the degree on the scale)
FretBoardGenerator.prototype.createChord = function(element, degree){
    var chordInfo = this.scaleinfo.getChord(degree);
    if ( chordInfo ){
        this.fretboard.createVerticalFrets(element, chordInfo);
    }
    show(element, exists(chordInfo));
    return this;
}

function FretBoard(stringList){
    this.stringList = stringList;
}

FretBoard.prototype.createHorizontalFrets= function(eleTable, scaleInfo){
    
    removeAllChildren(eleTable);

    var eleCaption = document.createElement("caption");
    var eleTBody= document.createElement("tbody");

    eleCaption.innerHTML = scaleInfo.name;

    for (var stringIdx = length(this.stringList)-1 ; stringIdx >=0 ; stringIdx--){
        // To leverage the existing functions, we use a list of 1 for all computations
        var currentNote = new Array(this.stringList[stringIdx]);

        var row = eleTBody.insertRow(length(this.stringList) - 1 - stringIdx);
    
        for (var fret = 0; fret <= SHOWN_FRETS; fret++){
            this.configureCellForNote( row.insertCell(fret), scaleInfo, fret, currentNote[0], true);
            currentNote = this.getNextFret(fret+1, currentNote);
        }
    }


    eleTable.appendChild(eleCaption);
    eleTable.appendChild(eleTBody);
}

FretBoard.prototype.createVerticalFrets= function(eleTable, scaleInfo){
    
    removeAllChildren(eleTable);

    var eleCaption = document.createElement("caption");
    var eleTHead = document.createElement("thead");
    var eleTBody= document.createElement("tbody");

    eleCaption.innerHTML = scaleInfo.name;
    eleCaption.classList.add(scaleInfo.getDegreeAsString());

    var currentFret = clone(this.stringList);
    for (var fret = 0; fret <= SHOWN_FRETS; fret++){
        var ele = fret == 0 ? eleTHead : eleTBody;
        var row = ele.insertRow(ele.childElementCount);
    
        for (var stringIdx = 0; stringIdx < length(currentFret); stringIdx++){
            this.configureCellForNote( row.insertCell(stringIdx), scaleInfo, fret, currentFret[stringIdx]);
        }

        if (fret<=SHOWN_FRETS){
            currentFret = this.getNextFret(fret+1, currentFret);
        }
    }


    eleTable.appendChild(eleCaption);
    eleTable.appendChild(eleTHead);
    eleTable.appendChild(eleTBody);
}

FretBoard.prototype.configureCellForNote =function(cell, scaleInfo, fret, note, isHorizontal = false){
    
    cell.classList.add("fret"+fret);
    
    if (note.includes(":")){
        return;
    }

    var ni = scaleInfo.getNote(note);

    var eleNote = document.createElement("p");
    eleNote.classList.add("note");
    if (isHorizontal){
        eleNote.classList.add("hnote");
    }
    if (ni){
        eleNote.classList.add("highlighted-note");
        eleNote.classList.add(ni.getDegreeAsString());
    }
    
    eleNote.innerHTML=note;
    
    cell.appendChild(eleNote);
    cell.classList.add("note-cell");
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
