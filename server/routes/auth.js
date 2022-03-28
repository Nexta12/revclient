"use strict";
const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { usernameToLowerCase, ensureGuest, sendEmail, messages } = require("../middleware/authe");
const passport = require("passport");
const nodemailer = require('nodemailer')


// Register Page
router.get("/register", ensureGuest, (req, res) => {
  res.render("Register", {
    title: "Revplus: Register",
  });
});




// Login Page
router.get("/login", ensureGuest, (req, res) => {
  res.render("Login", {
    title: "Revplus: Login",
  });
});

// Forgot-Password Page
router.get("/forgot-password", ensureGuest, (req, res) => {
  res.render("forgot-password", { title: "Revplus: Forgotten Password" });
});

// Register Hander
// Method Post

router.post("/register", usernameToLowerCase, async (req, res) => {
  const { username, name, email, password, password2 } = req.body;
  // Validate fields
  let errors = [];
  if (!username || !password || !email || !name) {
    errors.push({ msg: "Please Fill All Empty Fields" });
  }

  if (username.length < 4) {
    errors.push({ msg: "Username is too Short" });
  }
  //  check Password Match
  if (password != password2 && username != "" && !username.length < 4) {
    errors.push({ msg: "Passwords do not match" });
  }
  //  check for password Length
  if (password.length < 6 && username != "" && !username.length < 4) {
    errors.push({ msg: "Password should be at least Six or More Characters" });
  }
  //  check for valid email

  // Check for Password Strength

  if (errors.length > 0) {
    res.render("register", {
      title: "RevolutionPlus: Register",
      errors,
      username,
      name,
      password,
      password2,
    });
  } else {
    try {
      const userExists = await User.findOne({ username: username });
      if (userExists) {
        let errors = [];
        errors.push({ msg: "This Username Already Exists" });
        res.render("register", {
          title: "RevolutionPlus: Register",
          errors,
          username,
          name,
          email,
          password,
          password2,
        });
      } else {
        try {
          const emailSearch = await User.findOne({ email: email });
          if (emailSearch) {
            let errors = [];
            errors.push({ msg: "This Email Already Exists" });
            res.render("register", {
              title: "RevolutionPlus: Register",
              errors,
              username,
              name,
              email,
              password,
              password2,
            });
          } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = await User.create({
              username,
              name,
              email,
              password: hashedPassword,
            });
            // send success email to user
             sendEmail(newUser.email, "Successful Registration", messages.Registration(newUser.name));
            req.flash(
              "success_msg",
              "Your registration was successful, Please Login"
            );
            res.redirect("/api/v2/secure/login");
          }
        } catch (error) {
          res.render("errors/500", {
            title: "Error",
          });
          
        }
      }
    } catch (error) {
      res.render("errors/500", {
        title: "Error",
      });

     
    }
  }
});



// Login Handler
// Method POST
router.post("/login", usernameToLowerCase, (req, res, next) => {
  passport.authenticate("local", { session: true }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error", info.message);
      return res.redirect("/api/v2/secure/login");
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      } else {
        res.redirect("/api/v2/index/dashboard");
      }
    });
  })(req, res, next);
});

// logout Handler
router.get("/logout", async (req, res) => {
  req.logOut();
  req.flash("success_msg", "You're now logged out");
  res.redirect("/api/v2/secure/login");


});

module.exports = router;
