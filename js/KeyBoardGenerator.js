'use strict';

var SharpKeys =
   `<td></td>
    <td colspan="2" data-note="C#"></td>
    <td> </td>
    <td colspan="2" data-note="D#"></td>
    <td>  </td>
    <td>   </td>
    <td colspan="2" data-note="F#"></td>
    <td> </td>
    <td colspan="2" data-note="G#"></td>
    <td> </td>
    <td colspan="2" data-note="A#"></td>
    <td> </td>`;
var NaturalKeys =
   `<td colspan="2" data-note="C"></td>
    <td colspan="3" data-note="D"></td>
    <td colspan="2" data-note="E"></td>
    <td colspan="2" data-note="F"></td>
    <td colspan="3" data-note="G"></td>
    <td colspan="3" data-note="A"></td>
    <td colspan="2" data-note="B"></td>`;

function KeyBoardGenerator(key, modifiers){
    this.keyboard = new KeyBoard();
    this.scaleinfo = new ScaleInfo(key, modifiers)
}

// Takes in a table to update to look appropriate for the theory of the scale
KeyBoardGenerator.prototype.createScale = function(element){
    this.keyboard.create(element, this.scaleinfo);
    return this;
}

// Takes in a table to update to look appropriate for the theory of the chord (identified by the degree on the scale)
KeyBoardGenerator.prototype.createChord = function(divId, degree){
    var chordInfo = this.scaleinfo.getChord(degree);
    if ( chordInfo ){
        this.keyboard.create($(divId+"-table"), chordInfo);
    }
    show($(divId), exists(chordInfo));
    return this;
}

function KeyBoard(){
}
function showContent() {
  var temp = document.getElementsByTagName("template")[0];
  var clon = temp.content.cloneNode(true);
  document.body.appendChild(clon);
}
KeyBoard.prototype.create = function(eleTable, scaleInfo, keyboardCount = 2){
    
    removeAllChildren(eleTable);

    var eleCaption = document.createElement("caption");
    var eleTBody= document.createElement("tbody");

    eleCaption.innerHTML = scaleInfo.name;

    // build keyboard
    var sharpsRow = eleTBody.insertRow();
    var naturalRow = eleTBody.insertRow();

    var sharpKeys = $("SharpKeys"); 
    var naturalKeys = $("NaturalKeys"); 

    for (var repeats = 0; repeats < keyboardCount ; repeats++){
        sharpsRow.innerHTML += SharpKeys;
        naturalRow.innerHTML += NaturalKeys;
    }
    
    [ sharpsRow , naturalRow].forEach(
        row => {
            row.classList.add( (row == naturalRow) ? "natural":"sharp");
            for( let i = 0, cell; cell = row.cells[i]; i++){
                cell.classList.add("key");
                
                let currentNote = getDataAttribute(cell, "note");
                if (!isBlank(currentNote)){
                    this.configureCellForNote( cell, scaleInfo, currentNote);
                }
            }
        }
    );

    eleTable.appendChild(eleCaption);
    eleTable.appendChild(eleTBody);
}

KeyBoard.prototype.configureCellForNote =function(cell, scaleInfo, note){

    var ni = scaleInfo.getNote(note);

    var eleNote = document.createElement("p");
    eleNote.classList.add("note");
    
    if (ni){
        eleNote.classList.add("highlighted-note");
        eleNote.classList.add(ni.getDegreeAsString());
        eleNote.innerHTML=getDisplayNote(note);
    }
    
    cell.appendChild(eleNote);
    cell.classList.add("note-cell");
}



