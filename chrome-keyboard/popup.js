$(document).ready(() => {
  // Frequency Canvas
  var frequencyCanvas = document.querySelector(".bar-visualizer");
  var frequencyCanvasContext = frequencyCanvas.getContext("2d");

  var strikeColor = "#00e53c";

  // Building the canvas.
  frequencyCanvasContext.clearRect(0, 0, frequencyCanvas.width, frequencyCanvas.height);

  // Disabling the stop button by default.
  $("#stop").prop("disabled", "disabled");

  // Handler for the play button.
  $("#play").click(function(e) {
    
    chrome.runtime.sendMessage({ origin: "content", instruction: "start" });
    
    $("#play").prop("disabled", true);
    $("#stop").prop("disabled", false);
  });

  // Handler for the stop button.
  $("#stop").click(function(e) {
    // Sending a start instruction to the background process.
    chrome.runtime.sendMessage({ origin: "content", instruction: "stop" });
    // Cleaning the canvas.
    frequencyCanvasContext.clearRect(0, 0, frequencyCanvas.width, frequencyCanvas.height)
    $("#play").prop("disabled", false);
    $("#stop").prop("disabled", true);
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

      frequencyCanvasContext.fillStyle = strikeColor;
      frequencyCanvasContext.fillRect(
        x,
        frequencyCanvas.height,
        barWidth,
        ((-1 * barHeight) / 2) * 1.5
      );
      x += barWidth + 5;
    }
  });
});
