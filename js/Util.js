"use strict";

const NBSP = "&nbsp;";

function $(id, prefix = '') {
    return document.getElementById(isBlank(prefix) ? id : prefix+'.'+id);
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function exists(obj){
    return obj && typeof obj !== "undefined";
}

function hasMethod( objMethod ) {
    return typeof objMethod === "function";
}

function length(array){
    return array ? array.length : 0;
}

function isBlank(stringValue) {
    return stringValue === null || stringValue === "" || !stringValue;
}

function hasClass(element, className){
    return element.classList.contains(className);
}
 
function toggle(element) {
    show(element, !isVisible(element));
}

function show(element, vis = true){
    // unclear why this doesn't work in chrome
    // element.classList.toggle("hidden", !vis);
    vis ? element.classList.remove("hidden") : element.classList.add("hidden");
}

function isVisible(element) {
    return !hasClass(element, "hidden");
}

function stripFirst(matchChar, string){
    let index = string.indexOf(matchChar);
    if (index>=0){
        return string.split(matchChar)[1];
    }
    return string;
}

function isValidElement(element){
  return element.value && isVisible(element);
};

function isValidValue(element){
  return (!['checkbox', 'radio'].includes(element.type) || element.checked);
};

function isCheckbox(element){
    return element.type === 'checkbox';
}

function getSelectedValue(element){
    return element.options[element.selectedIndex].value;
}

function removeAllChildren(element){
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function safeRotateLeft(inList, firstNodeIdx){
    let list = clone(inList);
    firstNodeIdx-= list.length * Math.floor(firstNodeIdx / list.length);
    list.push.apply(list, list.splice(0, firstNodeIdx));
    return list;
}

function setDataAttribute(element, dataName, value){
     if (element.dataset){
         element.dataset[dataName] = value;
     } else {
         element.setAttribute("data-"+dataName, value);
     }
}

function getDataAttribute(element, dataName, defaultValue){
    let value = element.dataset 
        ? element.dataset[dataName] 
        : ( hasMethod(element.getAttribute) 
            ? element.getAttribute("data-"+dataName) 
            : "" );                                            
    return !exists(value) ? defaultValue : value;
}

function randomizeList(selectEleId){
    let selectEle = $(selectEleId);
    let nodeList = selectEle.querySelectorAll("option");
    let selectedIdx = Math.floor(Math.random() * Math.floor(nodeList.length));
    $(selectEleId).value = nodeList[selectedIdx].value;
}

function repeatConcat(baseString, numConcat){
    let resp="";
    for(let i=0; i < numConcat; i++){
        resp = resp.concat(baseString);
    }
    return resp;
}
