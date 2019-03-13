$(document).ready(() => {
  // Variables used by the Web Audio API.
  var analyser;
  var frequencyAnalyser;
  var source;
  var audioContext;

  var frequencyBufferLength;
  var frequencyDataArray;
  var frequencyStep;

  var bufferLength;
  var dataArray;

  // URL given by the Chroma SDK.
  var chromaSDKUrl;

  // The recurring connection made to maintain the SDK open.
  var connection;
  // The audio connection made to display on the popup
  var audioConnection;
  var keyboardConnection;

  // App parameters
  var color = 16514045;
  var themeId = 2;

  // Wave Canvas
  var canvas = document.querySelector(".wave-visualizer");
  var canvasCtx = canvas.getContext("2d");

  // Frequency Canvas
  var frequencyCanvas = document.querySelector(".bar-visualizer");
  var frequencyCanvasContext = frequencyCanvas.getContext("2d");

  $("#stop").prop("disabled", true);

  $("#play").click(function() {
    $("#play").prop("disabled", true);
    $("#stop").prop("disabled", false);

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Sine wave analyzer
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // Frequency analyzer
    frequencyAnalyser = audioContext.createAnalyser();
    frequencyAnalyser.fftSize = 8192;
    frequencyBufferLength = frequencyAnalyser.frequencyBinCount;
    frequencyStep = Math.floor(frequencyBufferLength / numberOfBars);
    frequencyDataArray = new Uint8Array(frequencyBufferLength);

    source = audioContext.createBufferSource();
    source.connect(analyser);
    analyser.connect(frequencyAnalyser);
    frequencyAnalyser.connect(audioContext.destination);

    const request = new XMLHttpRequest();
    request.open("GET", `/music`, true);
    console.log(request);
    request.responseType = "arraybuffer";
    request.onload = function() {
      audioContext.decodeAudioData(
        request.response,
        function(buffer) {
          source.buffer = buffer;
          source.loop = true;
          source.start();
          start();
        },

        function(e) {
          console.log("Error with decoding audio data" + e.err);
        }
      );
    };

    request.send();
  });

  // Handler when clicking on a theme.
  $(".theme").click(function(e) {
    themeId = e.target.id;
    $(".current-theme").remove();
    // Adding a current block to the theme.
    $(this).append('<div class="current-theme"> Current </div>');
  });

  function start() {
    // Setting the app state.
    audioConnection = setInterval(function() {
      meanFrequencyArray();
      // For frequency spectrum display on the popup.
      drawBars();
      draw();
    }, 5);

    createRazerConnection().then(function(razerSuccess) {
      keyboardConnection = setInterval(function() {
        sendToKeyboard();
      }, 5);
    });
  }

  function draw() {
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "#22313f";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = `hsl(${themeId * 60}, 100%, 50%)`;

    canvasCtx.beginPath();

    var sliceWidth = (canvas.width * 1.0) / bufferLength;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
      var v = dataArray[i] / 128.0;
      var y = (v * canvas.height) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }

  function drawBars() {
    frequencyCanvasContext.fillStyle = "#ecf0f1";
    frequencyCanvasContext.fillRect(
      0,
      0,
      frequencyCanvas.width,
      frequencyCanvas.height
    );

    var barWidth = frequencyCanvas.width / numberOfBars;
    var barHeight;
    var x = 0;

    for (var i = 0; i < numberOfBars; i++) {
      barHeight = resampledFrequencyArray[i];

      frequencyCanvasContext.fillStyle = `hsl(${themeId * 60 +
        (60 * (i + 1)) / numberOfBars}, 100%, 50%)`;
      frequencyCanvasContext.fillRect(
        x,
        frequencyCanvas.height,
        barWidth,
        (-1 * barHeight) / 2
      );
      x += barWidth + 5;
    }
  }

  // Array of variable width instead of fftSize / 2
  var numberOfBars = 44;
  var resampledFrequencyBuffer = new Uint8Array(numberOfBars);
  var resampledFrequencyArray = new Uint8Array(numberOfBars);

  function meanFrequencyArray() {
    // Taking the data from the frequency analyser.
    frequencyAnalyser.getByteFrequencyData(frequencyDataArray);
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

  // Disconnecting all sources and closing the audio context.
  $("#stop").click(function() {
    $("#stop").prop("disabled", true);
    $("#play").prop("disabled", false);

    frequencyAnalyser.disconnect();
    source.disconnect();

    audioContext.close();

    // Stopping the SDK connection.
    clearInterval(connection);
    clearInterval(audioConnection);
    clearInterval(keyboardConnection);
    // Cleaning the canvas.
    frequencyCanvasContext.clearRect(
      0,
      0,
      frequencyCanvas.width,
      frequencyCanvas.height
    );
  });

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
});
