// ----- Voice Trigger → Audio Playback -----
// Ensure "Voice Commands" is enabled in Project Settings.

// @input string triggerPhrase = "play sound"
// @input Component.AudioComponent audioPlayer
// @input Component.AudioComponent boom
// @input Component.Image george

/*const voiceMLModule = require('LensStudio:VoiceMLModule');
let options = VoiceML.ListeningOptions.create();
options.speechRecognizer = VoiceMLModule.SpeechRecognizer.Default;
options.languageCode = 'en_US';
voiceMLModule.startListening(options);
// Register the phrase the user must say*/
var phrase = script.triggerPhrase.toLowerCase();

const levenshteinDistance = (s, t) => {
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const arr = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            );
    }
  }
  return arr[t.length][s.length];
};
/*
let onUpdateListeningEventHandler = function (eventArgs) {
  if (eventArgs.transcription.trim() == '') {
    return;
  }
  print('Transcription: ' + eventArgs.transcription);

  if (!eventArgs.isFinalTranscription) {
    return;
  }
  print('Final Transcription: ' + eventArgs.transcription);
  print(levenshteinDistance(eventArgs.transcription.toLowerCase(), phrase));
  if (levenshteinDistance(eventArgs.transcription.toLowerCase(), phrase)<6) {
        print("Voice command recognized: " + phrase);

        if (script.audioPlayer) {
            //script.audioPlayer.stop();  // Optional: stop if already playing
            script.audioPlayer.play(1); // Play with fade-in = 1 second
        } else {
            print("ERROR: No audio player assigned to script.");
        }
    }
};
let onListeningErrorHandler = function (eventErrorArgs) {
  print(
    'Error: ' + eventErrorArgs.error + ' desc: ' + eventErrorArgs.description
  );
};
voiceMLModule.onListeningError.add(onListeningErrorHandler);
voiceMLModule.onListeningUpdate.add(onUpdateListeningEventHandler);

// Debug logging
print("Listening for phrase: \"" + phrase + "\"");
*/

const asrModule = require('LensStudio:AsrModule');

function onTranscriptionError(errorCode) {
  print(`onTranscriptionErrorCallback errorCode: ${errorCode}`);
  switch (errorCode) {
    case AsrModule.AsrStatusCode.InternalError:
      print('stopTranscribing: Internal Error');
      break;
    case AsrModule.AsrStatusCode.Unauthenticated:
      print('stopTranscribing: Unauthenticated');
      break;
    case AsrModule.AsrStatusCode.NoInternet:
      print('stopTranscribing: No Internet');
      break;
  }
}

function onTranscriptionUpdate(eventArgs) {
  var text = eventArgs.text;
  var isFinal = eventArgs.isFinal;
  print(`onTranscriptionUpdateCallback text=${text}, isFinal=${isFinal}`);
  print(levenshteinDistance(text, phrase));
  if (levenshteinDistance(text, phrase)<6) {
        print("Voice command recognized: " + phrase);
        script.george.enabled = true;
        if (script.audioPlayer) {
            delayedEvent.reset(1);
            //script.audioPlayer.stop();  // Optional: stop if already playing
            script.audioPlayer.play(1); // Play with fade-in = 1 second
            script.boom.play(0);
        } else {
            print("ERROR: No audio player assigned to script.");
        }
    }
}

function startSession() {
  var options = AsrModule.AsrTranscriptionOptions.create();
  options.languageCode = 'en_US';
  options.silenceUntilTerminationMs = 1000;
  options.mode = AsrModule.AsrMode.HighAccuracy;
  options.onTranscriptionUpdateEvent.add(onTranscriptionUpdate);
  options.onTranscriptionErrorEvent.add(onTranscriptionError);

  // Start session
  asrModule.startTranscribing(options);
}

function stopSession() {
  asrModule.stopTranscribing().then(function () {
    print(`stopTranscribing successfully`);
  });
}

var delayedEvent = script.createEvent("DelayedCallbackEvent");
delayedEvent.bind(function(eventData)
{
    script.george.enabled = false;
    delayedEvent2.reset(Math.floor(Math.random() * 30));
});

var delayedEvent2 = script.createEvent("DelayedCallbackEvent");
delayedEvent2.bind(function(eventData)
{
    script.george.enabled = true;
    script.boom.play(0);
    delayedEvent.reset(0.5);
});

delayedEvent.reset(5);

startSession();