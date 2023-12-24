const router = require("express").Router();
const User = require("../models/User");
const cron = require("node-cron");
const validator = require("email-validator");
const {sendEmail,objectLength,messages,numFomatter} = require("../middleware/authe");

async function getCustomers() {

  //read latest registered customers within one month
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1)); //last month date
  const previoustMonth = new Date(
    new Date().setMonth(lastMonth.getMonth() - 1)
  );
  const today = new Date();
  const day = today.getDate();
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let thisMonth = month[today.getMonth()];
  let thisYear = today.getFullYear();
  

  //  extract email batch

  try {

        const estatesToRemind = [
          "Dream City",
          "Victory Park and garden",
          "Graceland Estate",
          "Anfield Garden",
          "HIGHBURY BEACHFRONT",
          "Royalty Park and Garden",
          "Silver Spring Court",
          "Oxford Park",
          "Newcastle Estate",
          "California City Estate",
          "RUBY'S COURT",
          "Royalty Garden Shimawa",
          "Legend Smart City",
          "Richmond Court and Garden 2",
          "Lekki Crystal",
        ];

  
        // Pull every user and opens their properties array for scrutiny
    const debtors = await User.aggregate([
      // unwind their properties
      { $unwind: "$properties" },
    ]);



    // Send to only choosen Estates 

    const filteredDebtors = debtors.filter(
      (debtor) =>
        debtor.properties.propeId &&
        debtor.properties.grandDebt > 1 &&
        estatesToRemind.includes(debtor.properties.name)
    );

     
    //  Filter and Validate user emails
       const validUserEmail = filteredDebtors.filter((user) => {
         return validator.validate(user.email);
       });


       cron.schedule(" 30 10 23 * *", () => { // 1/2 past past 10 am 23th of every month

          cron.schedule("* * * * *", () => { // fire every 1 minute

            if (validUserEmail.length > 0) {
              const currentClient = Math.floor(
                Math.random() * validUserEmail.length
              );
              const selectedUsers = validUserEmail.splice(currentClient, 5); // extract 5 emails

              sendBulkValidEmail(selectedUsers);
            }
          });


       });
    

     function sendBulkValidEmail(selectedUsers) {
      
       selectedUsers.forEach((user) => {
          //Send Email to randomly selected Users
         sendEmail(
           user.email,
           "Payment Reminder",
            messages.payReminder(
             user.name,
             user.properties.grandDebt,
             user.properties.name
           )
         );
      
         
       });
     }

   
  } catch (error) {
    console.log(error);
  }



  // sort for Top Debtsors starts here.....................
  const topDebtors = await User.aggregate([
    // unwind their properties
    { $unwind: "$properties" },
  ]);
  let highest = [];
  let totalEmail = [];
  let totalPhone = [];

  topDebtors.forEach((deb) => {
    const validEmail = validator.validate(deb.email);
    if (deb.properties.grandDebt > 0) {
      highest.push(deb.properties.grandDebt);
      if (validEmail == true) {
        totalEmail.push(deb.email);
      }
      if (!/^[0-9]{11}$/.test(deb.phone)) {
        return false;
      } else {
        totalPhone.push(deb.phone);
      }
    }
  });
  const highestDebt = Math.max(...highest); // highest debt by any individual

  // highest debtor
  let highestDebtor;
  topDebtors.forEach((u) => {
    if (u.properties.grandDebt == highestDebt) {
      highestDebtor = u;
    }
  });

  const users = await User.find({ role: "Customer" });
  // get all customers properties

  let debts = [];
  let debtors = [];
  users.forEach((user) => {
    if (Object.keys(user.properties).length != 0) {
      user.properties.forEach((prop) => {
        // to get everyone's properties including people with 2 or more
        if (prop.grandDebt != 0) {
          debts.push(prop.grandDebt);
        }
        if (prop.grandDebt > 0) {
          // check for individual debtors irrespective of how many properties they have
          debtors.push(user.username);
        }
      });
    }
  });

  let totalDebt = 0;
  for (let i = 0; i < debts.length; i++) {
    totalDebt += debts[i];
  }

  // latest customers


  //  Calculate total number of Debtors.starts here........................
  const noOfDebtors = objectLength(debtors);
  const totalCustomers = objectLength(users);
  // const totalSentEmails = totalEmail.length + 40;
  // const totalPhonNum = totalPhone.length + 40;

  // Weekly Run down get ED and MD Details

  cron.schedule("42 16 * * 5",async ()=>{  // Fire at 15 mins after 4pm every Friday
      
    const admin = await User.find({ role: "Admin" });
    admin.forEach((adm) => {
      if (
        adm.dept == "MD" ||
        adm.dept == "ED" ||
        adm.email == "ernestez12@gmail.com" ||
        adm.email == "olugbenga@revolutionplusproperty.com" ||
        adm.email == "maria@revolutionplusproperty.com" ||
        adm.email == "olawalemajek@revolutionplusproperty.com"
      ) {
        sendEmail(
          adm.email,
          "RevolutionPlus Weekly Update",
          `
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
                        <td style="height:80px;">&nbsp;</td>
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
                            <table width="95%" border="0" align="centers" cellpadding="0" cellspacing="0"
                                style="max-width:670px; background:#fff; border-radius:3px; -webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">

                                            <h4>Dear ${adm.lastname} ${adm.firstname} </h4>
                                            
                                            <P> This is the weekly run-down of major activities in Revolutionplus client's Portal </strong>.</P>
                                            <ul style="list-style: none; margin: 0; padding: 0;">
                                                <li style="margin-bottom: 10px;">
                                                    1. Total Clients: <b> ${totalCustomers.toLocaleString()}.</b>
                                                </li>
                                                <li style="margin-bottom: 10px;">
                                                    2. Owing Clients: <b>${noOfDebtors.toLocaleString()}.</b>
                                                </li>
                                                <li style="margin-bottom: 10px;">
                                                    6. Total Debt: <b> &#x20A6; ${numFomatter(
                                                      totalDebt.toPrecision(5)
                                                    )}</b>
                                                </li>
                                               
                                            </ul>
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
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
   
</body>

</html>
                     `
        );

      }
    });

  })

  
}
getCustomers();

module.exports = router;
