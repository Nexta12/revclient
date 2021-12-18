const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const initialize = function initialize(passport) {
  passport.use(
    new LocalStrategy(function (username, password, done) {
      User.findOne(
        username.includes("@") ? { email: username } : { username: username },
        async function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, {
              message: "This Username does not Exist.",
            });
          } else {
            // check password correctness
            const correctPassword = await bcrypt.compare(
              password,
              user.password
            );
            if (!correctPassword) {
              return done(null, false, { message: "Password is Incorrect" });
            } else {
              return done(null, user);
            }
          }
        }
      );
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.username);
  });

  passport.deserializeUser(function (username, done) {
    User.findOne({ username: username }, function (err, user) {
      done(err, user);
    });
  });
};

module.exports = initialize;
