"use strict";

const ColGroup =
   `<col colspan="1" style="width:1em"/>`;

const SharpKeys =
   `<td class="key"></td>
    <td class="key" colspan="2" data-note="C#"></td>
    <td class="key"> </td>
    <td class="key" colspan="2" data-note="D#"></td>
    <td class="key">  </td>
    <td class="key">   </td>
    <td class="key" colspan="2" data-note="F#"></td>
    <td class="key"> </td>
    <td class="key" colspan="2" data-note="G#"></td>
    <td class="key"> </td>
    <td class="key" colspan="2" data-note="A#"></td>
    <td class="key"> </td>`;

const NaturalKeys =
   `<td class="key" colspan="2" data-note="C"></td>
    <td class="key" colspan="3" data-note="D"></td>
    <td class="key" colspan="2" data-note="E"></td>
    <td class="key" colspan="2" data-note="F"></td>
    <td class="key" colspan="3" data-note="G"></td>
    <td class="key" colspan="3" data-note="A"></td>
    <td class="key" colspan="2" data-note="B"></td>`;

const MAX_BOARD_CNT = 2;

const KEYBOARD_GENERATOR = {
    init: function(key, modifiers, prettyName){
        this.keyboard = Object.create(KEYBOARD);
        this.scaleinfo = Object.create(SCALE_INFO).init(key, modifiers, prettyName)
        this.degreeList = CHORD_DEGREES;
        return this;
    },

    // Takes in a table to update to look appropriate for the theory of the scale
    createScale: function(element){
        this.keyboard.create(element, this.scaleinfo, MAX_BOARD_CNT);
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
            this.keyboard.create($(divId+"-table"), chordInfo, MAX_BOARD_CNT);
        }
        show($(divId), exists(chordInfo));
        return this;
    },

};

const KEYBOARD = {
    create: function(eleTable, scaleInfo, keyboardCount){
        
        removeAllChildren(eleTable);

        let eleCaption = buildCaption(scaleInfo);
        
        let colGroupFrag = document.createDocumentFragment();
        let eleColGroup = document.createElement("colgroup");
        colGroupFrag.appendChild(eleColGroup);
        
        let tBodyFrag = document.createDocumentFragment();
        let eleTBody = document.createElement("tbody");
        tBodyFrag.appendChild(eleTBody);

        if (scaleInfo["getDegreeAsString"]){
            eleCaption.classList.add(scaleInfo.getDegreeAsString());
        }

        // build keyboard
        let colgroups = repeatConcat(ColGroup, 17*keyboardCount);
        eleColGroup.innerHTML = colgroups;

        let sharpKeys = repeatConcat(SharpKeys, keyboardCount);
        let naturalKeys = repeatConcat(NaturalKeys, keyboardCount);

        let sharpsRow = eleTBody.insertRow();
        let naturalRow = eleTBody.insertRow();
        
        sharpsRow.innerHTML = sharpKeys;
        naturalRow.innerHTML = naturalKeys;
        
        [ sharpsRow , naturalRow].forEach(
            row => {
                row.classList.add( (row == naturalRow) ? "natural":"sharp");
                for( let i = 0, cell; cell = row.cells[i]; i++){
                    let currentNote = getDataAttribute(cell, "note");
                    if (!isBlank(currentNote)){
                        this.configureCellForNote( cell, scaleInfo, currentNote);
                    }
                }
            }
        );

        eleTable.appendChild(eleCaption);
        eleTable.appendChild(colGroupFrag);
        eleTable.appendChild(tBodyFrag);
    },

    configureCellForNote: function(cell, scaleInfo, note){

        let ni = scaleInfo.getNote(note);

        let eleNote = document.createElement("p");
        let classesToAdd = [];
        classesToAdd.push("note");
        
        if (ni){
            classesToAdd.push("highlighted-note");
            classesToAdd.push(ni.getDegreeAsString());
            classesToAdd.push(normalizeNote(note));
            eleNote.innerText=getDisplayNote(note);
        }
        
        eleNote.classList.add.apply(eleNote.classList, classesToAdd);
        cell.classList.add("note-cell");
        cell.appendChild(eleNote);
    }

};

