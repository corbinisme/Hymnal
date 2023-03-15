window['MIDI'] = require('midijs');
var fs = require('fs');
var File = MIDI.File;
console.log("midijs", MIDI)
const _config = require("./configMod.js");
window['config'] = _config.default;




function playMidiFileWithTempo(midiFile, tempo, callback) {

  
  // Load the MIDI file using the Web MIDI API
  MIDI.loader = {
    onsuccess: function() {
      // Create a Web Audio API context
      var context = new AudioContext();

      // Create a MIDI player using the Web MIDI API and connect it to the Web Audio API
      var player = new WebMidi.Player(midiFile, function() {
        // Set the tempo of the MIDI player
        player.setTempo(tempo);

        // Connect the MIDI player to the Web Audio API
        player.connect(context.destination);

        // Start playing the MIDI file
        player.play();

        // Call the callback function when the MIDI file is loaded and playing
        if (typeof callback === 'function') {
          callback();
        }
      });
    }
  };
  MIDI.loadPlugin({
    soundfontUrl: "./soundfont/",
    instrument: "acoustic_grand_piano",
    onsuccess: function() {
      MIDI.Player.loadFile(midiFile);
    }
  });
}



window['playMidi'] = function(num){
  console.log("play " + num);
  let path = "hinematov.mid";
  playMidiFileWithTempo(path, 120, function() {
    console.log('MIDI file is playing with tempo 120 bpm.');
  });
  

}


const _app = require("../www/js/app.js");



console.log("get es6 modules here")