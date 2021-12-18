const router = require("express").Router();
const nodemailer = require("nodemailer");
const User = require("../models/User");




async function getCustomers(){

    try {
      const debtors = await User.aggregate([
        // unwind their properties
        { $unwind: "$properties" },
      ]);

     

      let filteredDebtors = [];
      debtors.forEach((debtor) => {
        if (
          Object.keys(debtor.properties).includes("propeId") &&
          debtor.properties.grandDebt != 0
        ) {
          // filter of unnecessary Objects unwound together
          filteredDebtors.push(debtor);
        }
      });

      //   send in batches
      let batchA = [];
      let batchB = [];
      let batchC = [];
      let batchD = [];
      let batchE = [];
      let batchF = [];
      let batchG = [];
      let batchH = [];
      let batchI = [];
      let batchJ = [];
      let batchK = [];
      let batchL = [];
      let batchM = [];
      let batchN = [];
      let batchO = [];
      let batchP = [];
      let batchQ = [];

      filteredDebtors.forEach((debtors, index) => {
        if (!debtors.email.includes("yopmail.com")) {
          if (index >= 0 && index <= 500) {
            batchA.push(debtors);
          } else if (index > 500 && index <= 1000) {
            batchB.push(debtors);
          } else if (index > 1000 && index <= 1500) {
            batchC.push(debtors);
          } else if (index > 1500 && index <= 2000) {
            batchD.push(debtors);
          } else if (index > 2000 && index <= 2500) {
            batchE.push(debtors);
          } else if (index > 2500 && index <= 3000) {
            batchF.push(debtors);
          } else if (index > 3000 && index <= 3500) {
            batchG.push(debtors);
          } else if (index > 3500 && index <= 4000) {
            batchH.push(debtors);
          } else if (index > 4000 && index <= 4500) {
            batchI.push(debtors);
          } else if (index > 4500 && index <= 5000) {
            batchJ.push(debtors);
          } else if (index > 5000 && index <= 5500) {
            batchK.push(debtors);
          } else if (index > 5500 && index <= 6000) {
            batchL.push(debtors);
          } else if (index > 6000 && index <= 6500) {
            batchM.push(debtors);
          } else if (index > 6500 && index <= 7000) {
            batchN.push(debtors);
          } else if (index > 7000 && index <= 7500) {
            batchO.push(debtors);
          } else if (index > 7500 && index <= 8000) {
            batchP.push(debtors);
          } else {
            batchQ.push(debtors);
          }
        }
      });
        


      const today = new Date();
      const day = today.getDate();

     
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

       let userEmail = [];
       function getEmails(batchOptions) {
         batchOptions.forEach((batch) => {
           userEmail.push(batch.email);
         });
       } 

      if (day == 20){
       getEmails(batchA);
      }else if(day == 21 ){
        getEmails(batchB);
      }else if(day == 22){
        getEmails(batchC);
      }else if(day == 23){
       getEmails(batchD);
      }else if(day == 24){
        getEmails(batchE)
      }else if(day == 25){
        getEmails(batchF);
      }else if(day == 26){
        getEmails(batchG);
      }else if(day == 27){
       getEmails(batchH);
      }else if(day== 28){
        getEmails(batchI);
      }else if(day == 29){
        getEmails(batchJ);
      }else if(day == 30){
        getEmails(batchK);
      }else if(day == 31){
        getEmails(batchL);
      }else if(day == 1){
        getEmails(batchM);
      }else if(day == 2){
       getEmails(batchN);
      }else if (day == 3){
        getEmails(batchO);
      }else if (day == 4){
        getEmails(batchP);
      }else if(day == 17){
        getEmails(batchQ);
      }


      //email options
      
      
      let mailOptions = {
        from: '"Revolution Plus👻"<customercare@revclient.com>',
        to:   [],
        bcc: userEmail,
        subject: "Debt Reminder ",
        html: `<h3> Dear Esteemed Customer, </h3> <br>
              <p> This is to warmly remind you of your outstanding debt with us at Revolution Plus, Please kindly pay up  to avoid being out of contract with us. </p>
              <br>
              <br>
              <br>
              <p>All rights reserved, Revolution Plus Properties LLC </p>
      `, // h
      };

    
     
      if( Object.keys(mailOptions.bcc).length !== 0 ){ 

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            //   throw new Error("An error occured while sending the mail");
          }
  
          console.log("Message sent : %s", info.messageId);
        });
      }


    } catch (error) {
        console.log(error)
    }


}getCustomers()


// cron.schedule("* * * * * *", () => {});

module.exports = router;
