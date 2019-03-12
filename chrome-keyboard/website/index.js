const express = require("express");
const ms = require('mediaserver')
const path = require("path");
const app = express();
const port = 7878;

app.use("/public", express.static(path.join(__dirname, "/public")));
app.use("/assets", express.static(path.join(__dirname, "/assets")));
app.use("/vendors", express.static(path.join(__dirname, "/vendors")));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/music", function(req, res) {
  ms.pipe(
    req,
    res,
    "./music.mp3"
  );
});

app.listen(port, function() {
  console.log(`Web audio server listening on port ${port}`);
});
