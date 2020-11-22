const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3456;
const helloServiceUrl = process.env.HELLO_SERVICE_URL || "";

app.use(bodyParser.json());

app.get("/hello", async (req, res) => {
  try {
    const result = await axios.get(helloServiceUrl);
    res.json(result.data);
  } catch (error) {
    console.log('error', error)
    res.status(500).json({ error });
  }
});

app.listen(port);
