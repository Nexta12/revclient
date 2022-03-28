const axios = require("axios");
const router = require("express").Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
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

module.exports = {
  ensureLoggedin: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "You must be logged in to View this resource");
    res.redirect("/api/v2/secure/login");
  },

  ensureGuest: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/api/v2/index/dashboard");
  },

  usernameToLowerCase: (req, res, next) => {
    req.body.username = req.body.username.toLowerCase();
    next();
  },

  mustBeAdmin: (req, res, next) => {
    if (req.user.role === "Admin") {
      next();
    } else {
      if (req.user.role === "Staff") {
        res.redirect("/api/v2/index/staff-dashboard");
      } else {
        res.redirect("/api/v2/index/customer-dashboard");
      }
    }
  },

  mustBeAdminOrStaff: (req, res, next) => {
    if (req.user.role === "Admin" || req.user.role === "Staff") {
      next();
    } else {
      res.status(403).json({ message: "You're not authorized to do this" });
      res.redirect("/api/v2/index/dashboard");
    }
  },

  objectLength: (obj) => {
    var result = 0;
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        // or Object.prototype.hasOwnProperty.call(obj, prop)
        result++;
      }
    }
    return result;
  },

  numFomatter: (num) => {
    if (num >= 20000 && num < 1000000) {
      return (num / 1000).toPrecision() + "K";
    } else if (num >= 1000000 && num <= 1000000000) {
      return (num / 1000000).toPrecision() + " " + "Million";
    } else if (num >= 1000000000) {
      return (num / 1000000000).toPrecision(3) + " " + "Billion";
    } else {
      return num.toLocaleString();
    }
  },

  sendSms: async (to, msg) => {
    const api = {
      base: "https://www.bulksmsnigeria.com/api/v1/sms/create?",
      api_token: "yenEakqw5sTSCJ4pYf0D77GRa3RuFbqTPCUZWk4PxO4aAmKBNQ9b8jLhDFKA",
      from: "RevolutionPlus",
    };

    try {
      await axios.post(
        `${api.base}api_token=${api.api_token}&from=${api.from}&to=${to}&body=${msg}&dnd=2`
      );
      console.log("Sms Sent");
    } catch (error) {
      throw new Error(error);
    }
  },

  sendEmail: (to_email, subject, message, cc) => {
    let mailOptions = {
      from: '"RevolutionPlus"<customercare@revclient.com>',
      to: to_email,
      bcc: cc,
      subject: subject,
      html: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        //   throw new Error("An error occured while sending the mail");
      }
      console.log("Message sent : %s", info.messageId);
    });
  },

  messages: {
    Registration: (name) => {
      return `<h3> Dear ${name} </h3> <br>
               <p>Thank you for your Interest in RevolutionPlus property Limited, We are glad to be of service to you, kindly login and check out our fast selling estates and lands across te country. </p>
               <br>
               <br>
               <br>
               Customer Care dept<br>
               RevolutionPlus property Limited

               <br>
               <p>All rights reserved, Revolution Plus Properties LLC </p>
               `;
    },

    PropAssignsms: (name, payment, propname) => {
      return `  
         Dear ${name}, We appreciate the sacrifice of your patronage, this is to notify you that we received your payment of NGN ${payment} for ${propname}. Please visit our portal on www.revclient.com to view more
        
        `;
    },
    PropAssignemail: (name, payment, propname) => {
      return ` <h3> Dear ${name},</h3> <br>

         We appreciate the sacrifice of your patronage, this is to notify you that we received your payment of NGN ${payment.toLocaleString()} for ${propname} please visit our client's portal www.revclient.com to view more
              <br>
               <br>
               <br>
               Customer Care dept<br>
               RevolutionPlus property Limited

               <br>
               <p>All rights reserved, Revolution Plus Properties LLC </p>
        `;
    },

    payReminder: (name, debt, propname, username) => {
      return ` <h3> Dear ${name},</h3> <br>
        <p> We do honestly appreciate your patronage, we wish to remind you of your outstanding balance of <strong> NGN ${debt} </strong> on <strong> ${propname} </strong>. Kindly pay up to retain your contract with us. <br>Visit our portal on www.revclient.com and login with the following details.
        <br> <strong> Username:  ${username} <br> pasword: revolutionpluspassword </strong></p>
        to know more about your payment details.

        <p> Kindly note The above password is only valid if you haven't previously changed it </p>. <br>
          For more information, please send us a mail on info@revolutionplusproperty.com or resolution@revolutionplusproperty.com <br> You can also call us on 012557386.
              <br>

              <p> Thank you for choosing RevolutionPlus Property. We hope to continue bringing your real estate dream to realization.</p>
              Warm Regard. 
               <br>
               <br>
               Customer Service Department<br>
               For: RevolutionPlus property
        `;
    },

    payReminderSms: (name, debt, propname, username) => {
      return ` Dear ${name},
         This is a reminder of your outstanding balance of NGN ${debt} on ${propname}, please kindly pay up to retain your contract with us. visit our portal www.revclient.com. Login with the following details: Username:  ${username}  pasword: revolutionpluspassword
      
        `;
    },
    customerRegEmail: (name, username, password) => {
      return `
             <h4> Dear ${name}, </h4>
            <p> You have been registered on the RevolutionPlus property Portal, www.revclient.com please login anytime with the following details. </p>
            username: ${username}, <br>
            password: ${password} 
            <p> Thank you for choosing RevolutionPlus Property. We hope to continue bringing your real estate dream to realization.</p>
              Warm Regard. 
               <br>
               <br>
               Customer Service Department<br>
               For: RevolutionPlus property
         
         `;
    },
    customerRegSms: (username, password)=>{
      return ` 
        Dear Esteemed client, you've been registered of our portal, www.revclient.com please login with the following details username: ${username}, password: ${password}, to know more about your payment details. you can also call us on 012557386 
      `;
    },
  },
};
