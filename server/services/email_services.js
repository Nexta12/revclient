const nodemailer = require("nodemailer");

module.exports = {
  sendEmail:  (to, subject, message) => {
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

    let mailOptions = {
      from: '"RevolutionPlus👻"<customercare@revclient.com>',
      to: to.email,
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
};


module.export = {

    Registration: (to)=> {

         `Dear Esteemed ${to}, this is to notify you that your registration was successful, you can now keep track of all your transactions with us `
    }
}