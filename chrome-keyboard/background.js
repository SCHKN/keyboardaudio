// Variables used by the Web Audio API.

var analyser;
var source;
var dataArray;
var audioContext;
var frequencyBufferLength;
var frequencyDataArray;
var frequencyStep;

// URL given by the Chroma SDK.
var chromaSDKUrl;

// App parameters
var color = 16514045;

// Google Chrome stream
var stream;

chrome.runtime.onMessage.addListener(function(request, sender) {
  switch (request.origin) {
    case "options":
      onMessageFromOptions(request);
      break;
    case "content":
      onMessageFromContent(request);
      break;
    default:
      throw "Every message is supposed to have an origin";
  }
});

// Use a case when it feels needed.
function onMessageFromOptions(request) {
  color = request.color;
}

function onMessageFromContent(request) {
  switch (request.instruction) {
    case "start":
      start();
      break;
    case "stop":
      stop();
      break;
    default:
      throw "The instruction provided is not implemented yet.";
  }
}

// Array of variable width instead of fftSize / 2
var numberOfBars = 44;
var resampledFrequencyBuffer = new Uint8Array(numberOfBars);
var resampledFrequencyArray = new Uint8Array(numberOfBars);

function meanFrequencyArray() {
  // Taking the data from the frequency analyser.
  analyser.getByteFrequencyData(frequencyDataArray);
  for (var j = 0; j < numberOfBars; j++) {
    var localMean = 0;
    for (var i = j * frequencyStep; i < frequencyStep * (j + 1); i++) {
      localMean += frequencyDataArray[i] / frequencyStep;
    }
    resampledFrequencyBuffer[j] = localMean;
  }

  resampledFrequencyArray = resampledFrequencyBuffer;
}

// On runtime, instantiate the Chroma SDK connection.
chrome.runtime.onInstalled.addListener(function() {
  const request = new XMLHttpRequest();
  request.open("POST", `http://localhost:54235/razer/chromasdk/`, true);
  request.setRequestHeader("Content-type", "application/json");
  request.onload = function() {
    chromaSDKUrl = JSON.parse(request.response).uri;
    // If the connection was successful, maintain the connection over time.
    if (chromaSDKUrl) {
      maintainConnection(chromaSDKUrl);
    }
  };
  request.send(
    JSON.stringify({
      title: "Razer Chroma SDK RESTful Test Application",
      description: "This is a REST interface test application",
      author: {
        name: "Chroma Developer",
        contact: "www.razerzone.com"
      },
      device_supported: [
        "keyboard",
        "mouse",
        "headset",
        "mousepad",
        "keypad",
        "chromalink"
      ],
      category: "application"
    })
  );
});

function maintainConnection(sessionUrl) {
  setInterval(() => {
    const request = new XMLHttpRequest();
    request.open("PUT", `${sessionUrl}/heartbeat`, true);
    request.onload = function() {
      console.log(request.response);
    };
    request.send();
  }, 2000);
}

// Capture the audio stream, record the frequency spectrum and distribute it to the hardware.
function start() {
  // Capturing the audio stream.
  chrome.tabCapture.capture({ audio: true }, stream => {
    this.stream = stream;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 8192;
    frequencyBufferLength = analyser.frequencyBinCount;
    frequencyStep = Math.floor(frequencyBufferLength / numberOfBars);
    frequencyDataArray = new Uint8Array(frequencyBufferLength);

    dataArray = new Uint8Array(analyser.frequencyBinCount);
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    window.setInterval(function() {
      meanFrequencyArray();
      // For frequency spectrum display on the popup.
      sendToPopup();
      sendToKeyboard();
    }, 5);
  });
}

// Disconnecting all sources and closing the audio context.
function stop() {
  analyser.disconnect();
  source.disconnect();

  audioContext.close().then(function() {
    stream.getAudioTracks()[0].stop();
  });
}

// Keyboard input parameters
var keyboardLength = 22;
var keyboardWidth = 6;

// We received a resampled array of frequencies.
function sendToKeyboard() {
  // Compute the array maximum
  var maxArray = Math.max.apply(Math, resampledFrequencyArray);

  // Building a two dimensional arrays for Razer Chroma keyboards.
  var keyboardArray = new Array(keyboardWidth);
  for (let j = 0; j < keyboardArray.length; j++) {
    keyboardArray[j] = new Array(keyboardLength);
  }

  for (let index = 0; index < keyboardLength; index++) {
    const elementStrength = Math.floor(
      (resampledFrequencyArray[index] / maxArray) * 5
    );

    for (let j = 0; j < keyboardArray.length; j++) {
      for (let k = 0; k < keyboardWidth; k++) {
        if (k < elementStrength) {
          keyboardArray[keyboardWidth - k - 1][index] = color;
        } else {
          keyboardArray[keyboardWidth - k - 1][index] = 0;
        }
      }
    }
  }

  // From this point, we have our complete array.
  callRazerAPI(keyboardArray);
}

// Function that makes the actual call to the Razer API.
function callRazerAPI(keyboardArray) {
  if (chromaSDKUrl) {
    const request = new XMLHttpRequest();
    request.open("PUT", `${chromaSDKUrl}/keyboard`, true);
    request.setRequestHeader("Content-type", "application/json");
    request.send(
      JSON.stringify({ effect: "CHROMA_CUSTOM", param: keyboardArray })
    );
  }
}

function sendToPopup() {
  chrome.runtime.sendMessage({
    numberOfBars,
    frequencyArray: resampledFrequencyArray
  });
}
