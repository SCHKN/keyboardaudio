$(document).ready(() => {
  $("#color-picker").colorpicker({ inline: true });

  $("#color-picker").on("colorpickerChange", function(event) {
    var colorStr = event.color.toString();
    colorsOnly = colorStr
      .substring(colorStr.indexOf("(") + 1, colorStr.lastIndexOf(")"))
      .split(/,\s*/);

    components = {};
    components.red = colorsOnly[0];
    components.green = colorsOnly[1];
    components.blue = colorsOnly[2];

    color = parseInt(
      (parseInt(components.blue) << 16) +
        (parseInt(components.green) << 8) +
        parseInt(components.red)
    );

    // Send the color to the background process.
    chrome.runtime.sendMessage({ origin: "options", color }, function(
      response
    ) {
      console.log("Color was changed.");
    });
  });
});
