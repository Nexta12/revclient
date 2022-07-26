const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();

// get password request Page
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", {
    title: "RevolutionPlus: Forgot password ",
  });
});

// post requested password handler
router.post("/forgot-password", async (req, res) => {
  // get user based on posted email

  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      throw new Error("This Email doesn't exist on this Portal");
    }
    // user exists
    // // generate random reset token
    const secret = process.env.PASSWORD_SECRE + user.password;
    const payload = { email: user.email, id: user.id };
    const token = jwt.sign(payload, secret, { expiresIn: "10m" });

    // //   generate a link now from this token where we would the user to

    const link = `${process.env.BASEURL}/api/v2/reset/reset-password/${user.id}/${token}`;
    // //    send link to email here
    let transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.USER_EMAIL, // generated ethereal user
        pass: process.env.EMAIL_PASS, // generated ethereal password
      },

      tls: {
        rejectUnauthorized: false,
      },
    });

    // send mail with defined transport object
    let mailOptions = await transporter.sendMail({
      from: '"RevolutionPlus"<tech@revclient.com>', // sender address
      to: user.email, // list of receivers
      subject: "Password Reset Request", // Subject line
      text: "", // plain text body
      html: `<p> Please Click this:<b> <a href="${link}">Password Reset Link</a> </b> to change your password</p> <br>
            

              <p>All rights reserved, Revolution Plus Properties LLC </p>
      `, // html body
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error("An error occured while sending the mail");
      }

      // console.log("Message sent");

      res.render("forgot-password", {
        title: "RevolutionPlus: Forgot password ",
        msg: "Reset Password Link sent to your email",
      });
    });
  } catch (error) {
    res.render("forgot-password", {
      title: "RevolutionPlus: Forgot password ",
      msgerror: error.message,
    });
  }
});

// get Reset page
router.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  //    we need to find the user with the Id in the route params (Verification)
  try {
    // check if the Id exists in the database
    const user = await User.findById(req.params.id);

    if (id !== user.id) {
      res.render("errors/403", {
        title: "RevolutionPlus: Invalid Request ",
        text: "Your Request Token is Invalid",
      });

      return;
    } else {
      //   we have a valid id and a valid user

      const secret = process.env.PASSWORD_SECRE + user.password;

      // validate jwt token
      try {
        const payload = jwt.verify(token, secret);

        res.render("reset-password", {
          title: "RevolutionPlus: Reset password ",
        });
      } catch (error) {
        res.render("errors/430", {
          title: "Revolution Plus",
          text: error.message,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
});

// post reset Password handler

router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;
  // validate if the token is still valid
  try {
    // check if user exists in databse

    const user = await User.findById(req.params.id);

    if (id !== user.id) {
      res.render("403", {
        title: "RevolutionPlus: Invalid Request ",
        text: "Your Request Token is Invalid",
      });
    } else {
      // if it gets here then user exists in our datanase
      // validate the token
      const secret = process.env.PASSWORD_SECRE + user.password;

      try {
        const payload = jwt.verify(token, secret);
        // validate that password and password2 match
        let errors = [];
        //  check for password Length
        if (password.length < 6) {
          errors.push({
            msg: "Password should be at least Six or More Characters",
          });
        }
        if (password != password2) {
          errors.push({ msg: "Passwords do not match" });
        }

        if (errors.length > 0) {
          res.render("reset-password", {
            title: "RevolutionPlus: Invalid Request ",
            errors,
          });
        } else {
          // hash the password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          user.password = hashedPassword;
          await user.save();
          req.flash("success_msg", "Password Reset successful, Please Login");
          res.redirect("/api/v2/secure/login");
        }

        // find the user with the payload email and id and finally with new password
      } catch (error) {
        res.render("errors/500", {
          title: "Revolution Plus",
          text: error.message,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
 
  }
});

module.exports = router;
