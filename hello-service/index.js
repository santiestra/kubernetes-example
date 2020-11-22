const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3456;

app.use(bodyParser.json());

app.get("", (req, res) => {
  res.json({ message: "hello!" });
});

app.listen(port);
