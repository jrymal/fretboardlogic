'use strict'

var VCO = {
    init: function(context){
        this.context = context;
        
        this.oscillator = context.createOscillator();

        this.oscillator.type = 'sawtooth';
        
        this.input = this.oscillator;
        this.output = this.oscillator;
        return this;
    },

    setFrequency: function(freq) {
        this.oscillator.frequency.setValueAtTime(freq, this.context.currentTime);
    },
      
    // sine, triangle, custom, square, sawtooth
    setType: function(type) {

        this.oscillator.type = type;
    },

    start: function(){
        if (!this.started){
            this.started = true;
            this.oscillator.start(0);
        }
    },

    setCustomType: function(sineTermList=[0, 0, 1, 0, 1]) {
        let sineTerms = new Float32Array(sineTermList);
        let cosineTerms = new Float32Array(this.sineTerms.length);
        let customWaveform = this.audioContext.createPeriodicWave(this.cosineTerms, this.sineTerms);
        // this will convert it to custom automatically
        this.oscillator.setPeriodicWave(customWaveform);
    },

    connect: function(node) {
        if (node.hasOwnProperty('input')) {
          this.output.connect(node.input);
        } else {
          this.output.connect(node);
        }
    },
};

var EnvelopeGenerator = {
    init: function(context) {
        this.context = context;
        this.attackTime = 0.005;
        this.releaseTime = 0.9;

        return this;
    },

    setAttack: function(value){
        this.attackTime = value;
    },
    
    setRelease: function(value){
        this.releaseTime= value;
    },

    trigger: function() {
        let now = this.context.currentTime;
        this.param.cancelScheduledValues(now);
        this.param.setValueAtTime(0, now);
        this.param.exponentialRampToValueAtTime(1, now + this.attackTime);
        this.param.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
        //this.param.exponentialRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
        //this.param.linearRampToValueAtTime(1, now + this.attackTime);
        //this.param.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
    },

    connect: function(param) {
        this.param = param;
    },
};

var VCA = {
    init: function(context) {
        this.gain = context.createGain();
        this.gain.gain.value = 1;
        this.input = this.gain;
        this.output = this.gain;
        this.amplitude = this.gain.gain;
        return this;
    },

    setVolume: function(value){
        this.gain.gain.value = value;
    },

    connect: function(node) {
        if (node.hasOwnProperty('input')) {
          this.output.connect(node.input);
        } else {
          this.output.connect(node);
        }
    },
};


function MidiPlayer(){
    let context =  new (window.AudioContext || window.webkitAudioContext);
    
    let vco = Object.create(VCO).init(context);
    let vca = Object.create(VCA).init(context);
    let envelope = Object.create(EnvelopeGenerator).init(context);

    vco.connect(vca);
    envelope.connect(vca.amplitude);
    vca.connect(context.destination);
    

    this.audioContext = context;
    this.vco = vco;
    this.vca = vca;
    this.envelope = envelope;
    this.space = 200;
}

MidiPlayer.prototype.playNote = function(noteList, cnt=1) {
    this.vca.setVolume(0);
    this.vco.start();

    if (!Array.isArray(noteList)){
        noteList = [ noteList ];
    }

    let fullNoteList = [];
    for( let i = cnt; i > 0; i--){
        noteList.forEach(
            note => {
                fullNoteList.push(note);
            }
        );
    }

    var vco = this.vco;
    var env = this.envelope;
    
    this.timerId = setInterval(this.playNoteList, this.space, this, fullNoteList);
}

MidiPlayer.prototype.playNoteList = function(midiPlayer, noteList) {
    let note = noteList.shift();
    if (note){
        midiPlayer.playFreq(midiPlayer.noteFreq(note));
    } else {
        clearInterval(midiPlayer.timerId);
    }
}

MidiPlayer.prototype.playFreq = function(freq) {
    this.vco.setFrequency(freq);
    this.envelope.trigger();
}

MidiPlayer.prototype.stop = function(oscMatch){
    this.vca.setVolume(0);
}

MidiPlayer.prototype.setSpacing = function(space){
    this.space = space;
}

const BASELINE_IDX = 9;
const BASELINE_NOTE = "A";
const BASELINE_OCT = 4;
const BASELINE_FREQ = 440;

MidiPlayer.prototype.noteFreq = function(note){
    let dist = this.findDistanceOfNote(note);
    let freq = BASELINE_FREQ * Math.pow(2, dist/12);
    return freq;
}

MidiPlayer.prototype.findDistanceOfNote = function(note){
    let split = note.split(':');
    let reqNote = split[0];
    let reqOct = BASELINE_OCT;

    if (split.length > 1){
        reqOct = split[1];
    }

    // this unfortunately for this pass is dependent on MusicTheory.js
    let idxReqNote = NOTES.indexOf(reqNote);

    if (idxReqNote == -1){
        console.log("Note not recognized:"+note);
        return null;
    }

    let octDist = reqOct - BASELINE_OCT; 
    let noteDist = idxReqNote - BASELINE_IDX;
    return noteDist + (octDist * 12);
}
