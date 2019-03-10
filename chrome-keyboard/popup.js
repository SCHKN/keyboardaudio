$(document).ready(() => {
  // State of the application.
  var appState;

  //console.log(hslToDecimal(60 / 360, 1, 0.5));

  // Frequency Canvas
  var frequencyCanvas = document.querySelector(".bar-visualizer");
  var frequencyCanvasContext = frequencyCanvas.getContext("2d");

  var strikeColor = "#00e53c";

  // Building the canvas.
  frequencyCanvasContext.clearRect(
    0,
    0,
    frequencyCanvas.width,
    frequencyCanvas.height
  );

  initialize();

  function initialize() {
    //chrome.storage.sync.set({ appState: null });

    // Getting the state from the local storage.
    appState = getAppState();
  }

  function getAppState() {
    chrome.storage.sync.get(["appState"], function(result) {
      if (result.appState && result.appState.isActive) {
        // If the app is already active, disable the controls.
        $("#play").prop("disabled", true);
        $("#stop").prop("disabled", false);
      } else {
        $("#play").prop("disabled", false);
        $("#stop").prop("disabled", true);
      }
    });
  }

  // Handler for the play button.
  $("#play").click(function(e) {
    chrome.runtime.sendMessage(
      { origin: "content", instruction: "start" },
      function(response) {
        if (response.active) {
          $("#play").prop("disabled", true);
          $("#stop").prop("disabled", false);
        }
      }
    );
  });

  // Handler for the stop button.
  $("#stop").click(function(e) {
    // Sending a start instruction to the background process.
    chrome.runtime.sendMessage(
      { origin: "content", instruction: "stop" },
      function(response) {
        // Cleaning the canvas.
        frequencyCanvasContext.clearRect(
          0,
          0,
          frequencyCanvas.width,
          frequencyCanvas.height
        );
        $("#play").prop("disabled", false);
        $("#stop").prop("disabled", true);
      }
    );
  });

  // Function that draws the canvas to the popup.
  chrome.runtime.onMessage.addListener(function(request, sender) {
    var numberOfBars = request.numberOfBars;
    var frequencyArray = request.frequencyArray;

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
      barHeight = frequencyArray[i];

      frequencyCanvasContext.fillStyle = `hsl(${0 +
        (60 * (i + 1)) / numberOfBars}, 100%, 50%)`;
      frequencyCanvasContext.fillRect(
        x,
        frequencyCanvas.height,
        barWidth,
        (-1 * barHeight) / 2
      );
      x += barWidth + 5;
    }
  });
});
