'use strict'

const BASELINE_IDX = 9;
const BASELINE_NOTE = "A";
const BASELINE_OCT = 4;
const BASELINE_FREQ = 440;

const VCO = {
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

const EnvelopeGenerator = {
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
    },

    connect: function(param) {
        this.param = param;
    },
};

const VCA = {
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

const VOICE = {
    init: function(context){
    
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
        
        return this;
    },

    playFreq: function(freq) {
        this.vca.setVolume(0);
        this.vco.start();

        this.vco.setFrequency(freq);
        this.envelope.trigger();
    },
    stop: function(){
        this.vca.setVolume(0);
    }
   
};

const VOICE_LIST = {
    init: function(context, count){
        this.voiceList = [];
        this.lastPlayed = -1;

        for(let i = 0; i < count; i++){
            this.voiceList.push(Object.create(VOICE).init(context));
        }

        return this;
    },
    playFreq: function(freq) {
        let curVoice= (this.lastPlayed + 1) % this.voiceList.length;
        this.voiceList[curVoice].playFreq(freq);
        this.lastPlayed = curVoice;
    },
    stop: function(){
        for(let i = 0; i < this.voiceList.length; i++){
            this.voiceList[i].stop();
        }
    }
 
};

const MIDI_PLAYER = {
    init: function(voiceCount=1){
        
        let context =  new (window.AudioContext || window.webkitAudioContext);
        this.voice = Object.create(VOICE_LIST).init(context, voiceCount);
        this.space = 200;
        return this;
    },

    playNote:function(noteList, cnt=1) {

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

        this.timerId = setInterval(this.playNoteList, this.space, this, fullNoteList);
    },

   playNoteList : function(midiPlayer, noteList) {
        let note = noteList.shift();
        if (note){
            midiPlayer.voice.playFreq(midiPlayer.noteFreq(note));
        } else {
            clearInterval(midiPlayer.timerId);
        }
    },

    stop:function(oscMatch){
        this.voice.stop();
    },

    setSpacing : function(space){
        this.space = space;
    },


    noteFreq : function(note){
        let dist = this.findDistanceOfNote(note);
        let freq = BASELINE_FREQ * Math.pow(2, dist/12);
        return freq;
    },

    findDistanceOfNote : function(note){
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
    },
};