require("./config/config");
// Node modules
const express = require("express");
const { mongoose } = require("./db/mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");

// Local imports
const { authenticate } = require("./middleware/authenticate");

console.log(process.env.MONGODB_URI);

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send({
    greeting:
      "Server is up and running. Figuring out how to tie the shit together now"
  });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
