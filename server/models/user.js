const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "Email is not valid"
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

// Protecting routes by logged in sessions
UserSchema.statics.findByToken = function(token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

// Generate an authorization token
UserSchema.methods.generateAuthToken = function() {
  let user = this;
  let access = "auth";
  let token = jwt
    .sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET)
    .toString();

  user.tokens = user.tokens.concat([{ access, token }]);

  return user.save().then(() => {
    return token;
  });
};

// Login existing user
UserSchema.statics.findByCredentials = function(email, password) {
  let User = this;

  return User.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject();
    }

    if (user.tokens.length > 0) {
      return Promise.reject({ Error: "Already logged in" });
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

// Remove tokens from given user
UserSchema.methods.removeToken = function(token) {
  let user = this;
  return user.update({
    $pull: {
      tokens: {
        token
      }
    }
  });
};

// Encrypt password before saving user to the database
UserSchema.pre("save", function(next) {
  let user = this;

  if (user.isModified("password")) {
    // Encrypt password
    bcrypt.genSalt(10, (err, salt) => {
      //Set user password to hash
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        // use next() to continue
        next();
      });
    });
  } else {
    next();
  }
});

let User = mongoose.model("User", UserSchema);

module.exports = { User };
