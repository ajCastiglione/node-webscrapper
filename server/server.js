require("./config/config");
// Node modules
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

// Local imports
const { authenticate } = require("./middleware/authenticate");
const { mongoose } = require("./db/mongoose");
const { User } = require("./models/user");

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

// Sign up new user
app.post("/signup", (req, res) => {
  let body = _.pick(req.body, ["email", "password", "username"]);
  let user = new User(body);

  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header("x-auth", token).send(user);
    })
    .catch(e => res.status(400).send(e));
});

// Login existing user
app.post("/users/login", (req, res) => {
  let body = _.pick(req.body, ["username", "password"]);

  User.findByCredentials(body.username, body.password)
    .then(user => {
      return user
        .generateAuthToken()
        .then(token => res.header("x-auth", token).send(user));
    })
    .catch(e => res.status(400).send(e));
});

// Logout from session
app.delete("/users/logout", authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send({
        success: "Successfully logged out"
      });
    },
    () => {
      res.status(400).send({
        error: "Unable to remove session tokens"
      });
    }
  );
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
