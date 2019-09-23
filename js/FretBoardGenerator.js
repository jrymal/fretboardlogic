'use strict';

function FretBoardGenerator(stringList, key, modifiers){
    this.fretboard = new FretBoard(stringList);
    this.musictheory = new MusicTheory(key, modifiers)
}

// Takes in a table to update to look appropriate for the theory of the scale
FretBoardGenerator.prototype.createScale = function(element){
    this.fretboard.createFrets(element, this.musictheory.getScale());
    return this;
}

// Takes in a table to update to look appropriate for the theory of the chord (identified by the degree on the scale)
FretBoardGenerator.prototype.createChord = function(element, degree){
    this.fretboard.createFrets(element, this.musictheory.getChord(degree));
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

    var currentFret = clone(this.stringList);
    for (var fret = 0; fret < 15; fret++){
        var row = eleTBody.insertRow(fret);
    
        for (var stringIdx = 0; stringIdx < length(currentFret); stringIdx++){
            var cell = row.insertCell(stringIdx);
            cell.innerHTML = currentFret[stringIdx];
        }

        if (fret<15){
            currentFret = scaleInfo.getNextFret(fret+1, currentFret);
        }
    }


    eleTable.appendChild(eleCaption);
    eleTable.appendChild(eleTHead);
    eleTable.appendChild(eleTBody);
}
