const router = require("express").Router();
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { sendSms, sendEmail, messages } = require("../middleware/authe");

async function getCustomers() {
  try {
    const debtors = await User.aggregate([
      // unwind their properties
      { $unwind: "$properties" },
    ]);

    let filteredDebtors = [];
    debtors.forEach((debtor) => {
      if (
        Object.keys(debtor.properties).includes("propeId") &&
        debtor.properties.grandDebt > 1
      ) {
        // filter of unnecessary Objects unwound together
        filteredDebtors.push(debtor);
      }
    });

    //   send in batches

    const today = new Date();
    const day = today.getDate();

    if (day == 25)
      filteredDebtors.forEach((debtor) => {

         if(debtor.email){
          
             // send Email to all debtors
             sendEmail(
               [],
               "Payment Reminder",
               messages.payReminder(debtor.name, debtor.properties.grandDebt.toLocaleString(), debtor.properties.name, debtor.username),
               debtor.email
             );
            
         }

        //  send SMS
          if(debtor.phone){
              sendSms(debtor.phone, messages.payReminderSms(debtor.name, debtor.properties.grandDebt.toLocaleString(), debtor.properties.name, debtor.username));
          }
       
      });
  } catch (error) {
    console.log(error);
  }

  
}
getCustomers();



module.exports = router;
