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

// The recurring connection made to maintain the SDK open.
var connection;
// The audio connection made to display on the popup
var audioConnection;
var keyboardConnection;

// App parameters
var color = 16514045;
var themeId = 0;
// Google Chrome variables
var stream;
var tab;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.origin) {
    case "options":
      onMessageFromOptions(request);
      break;
    case "content":
      onMessageFromContent(request, sendResponse);
      break;
    case "change-theme":
      onMessageFromContent(request, sendResponse);
    default:
      throw "Every message is supposed to have an origin";
  }

  return true;
});

// Use a case when it feels needed.
function onMessageFromOptions(request) {
  color = request.color;
}

function onMessageFromContent(request, sendResponse) {
  switch (request.instruction) {
    case "start":
      start(sendResponse);
      break;
    case "stop":
      stop(sendResponse);
      break;
    case "change-theme":
      changeTheme(request, sendResponse);
      break;
    default:
      throw "The instruction provided is not implemented yet.";
  }
}

function changeTheme(request, sendResponse) {
  this.themeId = request.themeId;

  // Setting the theme in the app state.
  chrome.storage.sync.set({ themeState: { themeId: request.themeId } });

  sendResponse({ themeId: request.themeId });
}

function start(sendResponse) {
  createAudioConnection().then(function(audioSuccess) {
    // Setting the app state.
    sendResponse({ active: true });
    chrome.storage.sync.set({ appState: { isActive: true } });
    audioConnection = setInterval(function() {
      meanFrequencyArray();
      // For frequency spectrum display on the popup.
      sendToPopup();
    }, 5);

    createRazerConnection().then(function(razerSuccess) {
      keyboardConnection = setInterval(function() {
        sendToKeyboard();
      }, 5);
    });
  });
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

// Function that requests a new connection endpoint to the Razer API.
function createRazerConnection() {
  return new Promise(function(resolve, reject) {
    try {
      const request = new XMLHttpRequest();
      request.open("POST", `http://localhost:54235/razer/chromasdk/`, true);
      request.setRequestHeader("Content-type", "application/json");
      request.onload = function() {
        chromaSDKUrl = JSON.parse(request.response).uri;
        // If the connection was successful, maintain the connection over time.
        if (chromaSDKUrl) {
          maintainConnection(chromaSDKUrl);
          resolve();
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
    } catch (err) {
      reject(err);
    }
  });
}

function maintainConnection(sessionUrl) {
  connection = setInterval(() => {
    const request = new XMLHttpRequest();
    request.open("PUT", `${sessionUrl}/heartbeat`, true);
    request.onload = function() {
      console.log(request.response);
    };
    request.send();
  }, 2000);
}

// Capture the audio stream, record the frequency spectrum and distribute it to the hardware.
function createAudioConnection() {
  return new Promise(function(resolve, reject) {
    // Capturing the audio stream.
    chrome.tabs.getSelected(null, function(tab) {
      this.tab = tab;
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

        // window.setInterval(function() {
        //   meanFrequencyArray();
        //   // For frequency spectrum display on the popup.
        //   sendToPopup();
        //   sendToKeyboard();
        // }, 5);
        resolve();
      });
    });
  });
}

// Disconnecting all sources and closing the audio context.
function stop(sendResponse) {
  analyser.disconnect();
  source.disconnect();

  audioContext.close().then(function() {
    if (stream && stream.getAudioTracks()[0]) {
      stream.getAudioTracks()[0].stop();
    }
  });

  // Stopping the SDK connection.
  clearInterval(connection);
  clearInterval(audioConnection);
  clearInterval(keyboardConnection);

  // Setting the app state.
  chrome.storage.sync.set({ appState: { isActive: false } });

  if (sendResponse) {
    sendResponse({ active: false });
  }
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
          keyboardArray[keyboardWidth - k - 1][index] = hslToDecimal(
            (60 * themeId + k * 20) / 360,
            1,
            0.5
          );
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

// When closing the tab or closing Chrome, everything should stop.
chrome.tabs.onRemoved.addListener(function(tabid, removed) {
  // Stopping every audio stream and closing the SDK connection.
  if (tab && tabid === tab.id) {
    stop();
  }
});

function hslToDecimal(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return parseInt(
    (parseInt(Math.round(b * 255)) << 16) +
      (parseInt(Math.round(g * 255)) << 8) +
      parseInt(Math.round(r * 255))
  );
}
