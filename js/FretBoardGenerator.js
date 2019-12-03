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
FretBoardGenerator.prototype.createChord = function(divId, degree){
    var chordInfo = this.scaleinfo.getChord(degree);
    if ( chordInfo ){
        this.fretboard.createVerticalFrets($(divId+"-table"), chordInfo);
    }
    show($(divId), exists(chordInfo));
    return this;
}

function FretBoard(stringList){
    this.stringList = stringList;
    this.fretData = Object.create(FRET_DATA).init(stringList);
}

FretBoard.prototype.createHorizontalFrets= function(eleTable, scaleInfo){
    
    removeAllChildren(eleTable);

    var eleCaption = document.createElement("caption");
    var tBodyFrag = document.createDocumentFragment();
    var eleTBody = document.createElement("tbody");
    tBodyFrag.appendChild(eleTBody);

    eleCaption.innerHTML = scaleInfo.name;

    for (var stringIdx = length(this.stringList)-1 ; stringIdx >=0 ; stringIdx--){

        var row = eleTBody.insertRow(length(this.stringList) - 1 - stringIdx);
        row.classList.add("frets");
    
        for (var fret = 0; fret <= SHOWN_FRETS; fret++){
            var currentNote = this.fretData.getNote(stringIdx, fret);
            this.configureCellForNote( row.insertCell(fret), scaleInfo, fret, currentNote, true);
        }
    }


    eleTable.appendChild(eleCaption);
    eleTable.appendChild(tBodyFrag);
}

FretBoard.prototype.createVerticalFrets= function(eleTable, scaleInfo, fretData){
    
    removeAllChildren(eleTable);

    let eleCaption = document.createElement("caption");
    let tBodyFrag = document.createDocumentFragment();
    let eleTBody = document.createElement("tbody");
    tBodyFrag.appendChild(eleTBody);

    eleCaption.innerHTML = scaleInfo.name;
    eleCaption.classList.add(scaleInfo.getDegreeAsString());

    let currentFret = this.fretData.getFret(0);
    for (let fret = 0; fret <= SHOWN_FRETS; fret++){
        let row = eleTBody.insertRow(eleTBody.childElementCount);
        row.classList.add("frets");
    
        for (let stringIdx = 0; stringIdx < length(currentFret); stringIdx++){
            this.configureCellForNote( row.insertCell(stringIdx), scaleInfo, fret, currentFret[stringIdx]);
        }

        if (fret<=SHOWN_FRETS){
            currentFret = this.fretData.getFret(fret+1);
        }
    }


    eleTable.appendChild(eleCaption);
    eleTable.appendChild(tBodyFrag);
}

FretBoard.prototype.configureCellForNote =function(cell, scaleInfo, fret, note, isHorizontal = false){
    
    cell.classList.add("fret"+fret,"note-cell");
    
    if (isBlank(note)){
        return;
    }

    var ni = scaleInfo.getNote(note);

    var eleNote = document.createElement("p");
    var classesToAdd = [];
    classesToAdd.push("note");
    if (isHorizontal){
        classesToAdd.push("hnote");
    }
    if (ni){
        classesToAdd.push("highlighted-note");
        classesToAdd.push(ni.getDegreeAsString());
        eleNote.innerText=getDisplayNote(note);
    }
    
    eleNote.classList.add.apply(eleNote.classList, classesToAdd);
    cell.appendChild(eleNote);
}

const FRET_DATA={
    init: function(zeroFretList, fretCount=15){
        this.fretListOfList = this.populateFretArray(zeroFretList, fretCount);
        return this;
    },
    getFret: function(fret){
        return this.fretListOfList[fret];
    },
    getNote: function(stringIdx, fret){
        return this.fretListOfList[fret][stringIdx];
    },
    populateFretArray: function(zeroFret,fretCount){
        let fretList = new Array();
        let currentFret = zeroFret;

        for(let fret = 0; fret <= fretCount; fret++){
            fretList.push(this.buildDisplayFret(currentFret));
            currentFret = this.getNextFret(currentFret, fret);
        }
        return fretList;
    },
    buildDisplayFret(fretList){
        let fret = new Array();
        fretList.forEach(
            function(noteStr){
                if (noteStr.includes(":")){
                    fret.push("");
                } else {
                    fret.push(noteStr);
                }
            }
        );
        return fret;
    },
    getNextFret: function(fretList, fretIdx){
        let fret = new Array();

        fretList.forEach(
            function(noteStr){
                var splitNoteArray = noteStr.split(":");
                var note = splitNoteArray[0];
                var startFret = splitNoteArray[1];
           
                if (!isBlank(startFret)){
                    if (fretIdx < startFret-1){
                        fret.push(noteStr);
                    } else {
                        fret.push(note);
                    }
                } else {
                    fret.push(getNextNote(NOTES, note, 1));
                }
            }
        );

        return fret;
    },
};
