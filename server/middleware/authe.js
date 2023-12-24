const axios = require("axios");
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

  sendESms: (to, msg) => {
    const api = {
      base: "http://api.ebulksms.com:8080/sendsms?",
      username: "ernestez12@gmail.com",
      apikey: "84b7d2e56ebb1ecaa7626ba4f7b3c2452ff28d9f",
      sender: "RevolutionP",
    };

    axios
      .get(
        `${api.base}username=${api.username}&apikey=${api.apikey}&sender=${api.sender}&messagetext=${msg}&flash=0&recipients=${to}`
      )
      .then((result) => {
        console.log(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  },

  sendSms: (to, msg) => {
    const api = {
      base: "https://www.bulksmsnigeria.com/api/v1/sms/create?",
      api_token: "yenEakqw5sTSCJ4pYf0D77GRa3RuFbqTPCUZWk4PxO4aAmKBNQ9b8jLhDFKA",
      from: "RevolutionP",
    };

    axios
      .post(
        `${api.base}api_token=${api.api_token}&from=${api.from}&to=${to}&body=${msg}&dnd=2`
      )
      .then((result) => {
        console.log(result.data);
      })
      .catch((err) => {
        console.log("An error occured");
      });
  },

  sendEmail: (to_email, subject, message, cc) => {
    let mailOptions = {
      from: '"RevolutionPlus"<tech@revclient.com>',
      to: to_email,
      bcc: cc,
      subject: subject,
      html: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error.code == "EENVELOPE") {
        console.log("Invalid Email Detected");
        //   throw new Error("An error occured while sending the mail");
      } else if (error.code == "EDNS") {
        console.log(
          "No Internet Services, please connect to internet to send emails"
        );
      } else {
        console.log("Message sent");
      }
    });
  },

  messages: {
    PropAssignsms: (name, payment, propname) => {
      return `  
         Dear ${name}, We appreciate the sacrifice of your patronage, this is to notify you that we received your payment of NGN ${payment} for ${propname}. Please visit our portal on www.revclient.com to view more
        
        `;
    },

    PropAssignemail: (name, payment, propname) => {
      return `
        <div class="container">
                          <div class="row">
                              <div class="col">
                                <div style="background-color: #632264; padding-top: 3px; padding-bottom: 3px;">
                                    <h3 style="color: white; text-align: center;">Payment Confirmation !!!</h3>
                                </div>

                              </div>
                          </div>
                      </div>
      
      <h3> Dear ${name},</h3> <br>

        <p style="font-size: 18px; word-spacing: 1px;"> We appreciate the sacrifice of your patronage, this is to notify you that we received your payment of <strong> NGN ${payment.toLocaleString()} </strong> for <strong>${propname} </strong> please visit our client's portal www.revclient.com to view more details about your payment.</p>
              <br>
               <br>
               <br>
               <div class="container">
                          <div class="row">
                              <div class="col">
                                <div style="background-color: #6C757D; padding-top: 3px; padding-bottom: 3px;">
                                    <h3 style="color: white; text-align: center;">
               Customer Service Department<br>
               For: RevolutionPlus property</h3>
                                </div>

                              </div>
                          </div>
                      </div>
        `;
    },

    payReminder: (name, debt, propname) => {
      return ` 
                    
<!doctype html>
<html lang="en-US">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>RevolutionPlus: Payment Reminder</title>
    <meta name="description" content="RevolutionPlus Payment Reminder.">
    <style type="text/css">
        a:hover {
            text-decoration: underline !important;
        }
    </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!-- 100% body table -->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:30px;">&nbsp;</td>
                    </tr>
                  
                    <tr>
                        <td style="text-align:center;">
                            <a href="https://revclient.com" title="logo" target="_blank">
                                <img width="150px" src="https://revclient.com/img/RevolutionPlusLogo.png" title="logo"
                                    alt="logo">
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px; background:#fff; border-radius:3px;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                      
                                        <p style="font-size:15px; color:#455056; margin:8px 0 0; line-height:24px;">
                                            <span style='text-align: left'> Dear <b>${name}</b> </span> <br>

                                            We do honestly appreciate your patronage, we wish to remind you of your
                                            outstanding balance of <strong> NGN ${debt} </strong> on <strong>
                                                ${propname} </strong>. 
                                            <br> Kindly pay up to retain your contract with us.
                                            <br>
                                        </p>
                                      
                                        <br>

                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                            <p style="font-size: 12px; font-style: italic;"> For More information :<br>
                                                Visit our portal on www.revclient.com <br>
                                                Email: info@revolutionplusproperty.com <br>
                                                or resolution@revolutionplusproperty.com <br>
                                                Call: 012557386.<br>
                                            </p>

                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p
                                style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                                &copy; <strong>RevolutionPlus Property LLC</strong> </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>

</html>
        `;
    },

    payReminderSms: (name, debt, propname, username) => {
      return ` Dear ${name},
         This is a reminder of your outstanding balance of NGN ${debt} on ${propname}, please kindly pay up to retain your contract with us. visit our portal www.revclient.com. Login with the following details: Username:  ${username}  pasword: revolutionpluspassword
      
        `;
    },
    customerRegEmail: (name, username, password) => {
      return `
           <div class="container">
                          <div class="row">
                              <div class="col">
                                <div style="background-color: #632264; padding-top: 3px; padding-bottom: 3px;">
                                    <h3 style="color: white; text-align: center;">Portal Registration !!!</h3>
                                </div>

                              </div>
                          </div>
                      </div>
             <h4> Dear ${name}, </h4>
            <p style="font-size: 18px; word-spacing: 1px;"> You have been registered on the RevolutionPlus property Portal, www.revclient.com please login anytime with the following details. </p>
           <strong> username: ${username}, <br>
            password: ${password} </strong>
            <p style="font-size: 18px; word-spacing: 1px;"> Thank you for choosing RevolutionPlus Property. We hope to continue bringing your real estate dream to realization.</p>
              Warm Regard. 
               <br>
               <br>
                  <div class="container">
                          <div class="row">
                              <div class="col">
                                <div style="background-color: #6C757D; padding-top: 3px; padding-bottom: 3px;">
                                    <h3 style="color: white; text-align: center;">Customer Service Department<br>
               For: RevolutionPlus property</h3>
                                </div>

                              </div>
                          </div>
                      </div>
         
         `;
    },

    sendCelebrationEmail: (imageEmbed, message) => {

      return `

      <!doctype html>
    <html lang="en-US">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>RevolutionPlus: New Message</title>
    <meta name="description" content="RevolutionPlus Email Messages.">
    <style type="text/css">
        a:hover {
            text-decoration: underline !important;
        }
    </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!-- 100% body table -->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <a href="https://revclient.com" title="logo" target="_blank">
                                <img width="150px" src="https://revclient.com/img/revolutionplus-logo.png" title="logo"
                                    alt="logo">
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px; background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">

                                                <p style="text-align: center; margin-top: -5px">${imageEmbed}</p>
                                                <p style="font-size:15px; color:#455056; margin:8px 0 0; line-height:24px;">${message}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p
                                style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                                &copy; <strong>RevolutionPlus Property LLC</strong> </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
   
</body>

</html>
        

      `;
    
    },
  
  },
};
