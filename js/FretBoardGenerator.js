"use strict";

const SHOWN_FRETS=15;

const FRETBOARD_GENERATOR={
    init: function(stringList, key, modifiers, prettyName){
        this.fretboard = Object.create(FRETBOARD).init(stringList);
        this.scaleinfo = Object.create(SCALE_INFO).init(key, modifiers, prettyName)
        this.degreeList = CHORD_DEGREES;
        return this;
    },

    // Takes in a table to update to look appropriate for the theory of the scale
    createScale: function(element){
        this.fretboard.createHorizontalFrets(element, this.scaleinfo);
        return this;
    },

    setChordDegree: function(degreeList){
        this.degreeList = degreeList;
        return this;
    },

    // Takes in a table to update to look appropriate for the theory of the chord (identified by the degree on the scale)
    createChord: function(divId, degree){
        let chordInfo = this.scaleinfo.getChord(degree, this.degreeList );
        if ( chordInfo ){
            this.fretboard.createVerticalFrets($(divId+"-table"), chordInfo);
        }
        show($(divId), exists(chordInfo));
        return this;
    }
};

const FRETBOARD = {
    init: function(stringList){
        this.stringList = stringList;
        this.fretData = Object.create(FRET_DATA).init(stringList, SHOWN_FRETS);
        return this;
    },
    
    createHorizontalFrets: function(eleTable, scaleInfo){
        
        removeAllChildren(eleTable);

        let tBodyFrag = document.createDocumentFragment();
        let eleTBody = document.createElement("tbody");
        tBodyFrag.appendChild(eleTBody);

        let numOfStrings = length(this.stringList);
        let maxStringIdx = numOfStrings - 1;

        // number if strings plus the additional row(s) for identifying the fret markers
        let width = numOfStrings + 2;

        for (let rowIdx = 0 ; rowIdx < width ; rowIdx++){

            let row = eleTBody.insertRow(rowIdx);
            
            console.log(rowIdx);

            if (rowIdx == width-1 || rowIdx == 0){
                row.classList.add("document");
            console.log("doc");
                for (let fret = 0; fret <= this.fretData.maxFrets; fret++){
                    this.configureIdentifier(row.insertCell(fret), fret)
                }
            } else {
                row.classList.add("frets");
                let stringIdx = width - rowIdx - 2;
            console.log("note "+stringIdx);
                for (let fret = 0; fret <= this.fretData.maxFrets; fret++){
                    let currentNote = this.fretData.getNote(stringIdx, fret);
                    this.configureCellForNote( row.insertCell(fret), scaleInfo, fret, currentNote, true);
                }
            }
        }

        eleTable.appendChild(buildCaption(scaleInfo));
        eleTable.appendChild(tBodyFrag);
    },
    
    createVerticalFrets: function(eleTable, scaleInfo){
        
        removeAllChildren(eleTable);

        let eleCaption = buildCaption(scaleInfo);
        let tBodyFrag = document.createDocumentFragment();
        let eleTBody = document.createElement("tbody");
        tBodyFrag.appendChild(eleTBody);

        eleCaption.classList.add(scaleInfo.getDegreeAsString());

        let currentFret = this.fretData.getFret(0);
        for (let fret = 0; fret <= this.fretData.maxFrets; fret++){
            let row = eleTBody.insertRow(eleTBody.childElementCount);
            row.classList.add("frets");
      
            // total for notes plus info column
            let colCount = length(currentFret) + 2;

            for (let colIdx = 0; colIdx < colCount; colIdx++){
                if (colIdx == 0 || colIdx > length(currentFret)){
                    let cell = row.insertCell(colIdx);
                    cell.classList.add("document","fret"+fret);
                    this.configureIdentifier(cell, fret)
                } else {
                    let noteIdx = colIdx-1;
                    this.configureCellForNote( row.insertCell(colIdx), scaleInfo, fret, currentFret[noteIdx]);
                }
            }

            if (fret<=this.fretData.maxFrets){
                currentFret = this.fretData.getFret(fret+1);
            }
        }


        eleTable.appendChild(eleCaption);
        eleTable.appendChild(tBodyFrag);
    },

    configureIdentifier: function(cell, fret){
        if ([0,3,5,7,9,12,15].includes(fret)){
            let eleNote = document.createElement("p");
            eleNote.innerText = fret
            cell.appendChild(eleNote);
        }
    },

    configureCellForNote: function(cell, scaleInfo, fret, note, isHorizontal = false){
        
        cell.classList.add("fret"+fret,"note-cell");
        
        if (isBlank(note)){
            return;
        }

        let ni = scaleInfo.getNote(note);

        let eleNote = document.createElement("p");
        let classesToAdd = [];
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
    },
};

const FRET_DATA={
    init: function(zeroFretList, fretCount){
        this.fretListOfList = this.populateFretArray(zeroFretList, fretCount);
        this.maxFrets = fretCount;
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
                let splitNoteArray = noteStr.split(":");
                let note = splitNoteArray[0];
                let startFret = splitNoteArray[1];
           
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
