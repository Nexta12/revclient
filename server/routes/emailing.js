const router = require("express").Router();
const nodemailer = require("nodemailer");
const User = require("../models/User");
const cron = require("node-cron");
const validator = require("email-validator");
const {
  sendSms,
  sendEmail,
  sendESms,
  objectLength,
  messages,
  numFomatter,
} = require("../middleware/authe");

async function getCustomers() {
  //    read latest registered customers within one month
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
  let broadCastTime = today.getHours(); // get exact time to broadcast
  let broadcastMin = today.getMinutes();

  //  extract email batch
  const extractEmail = function getRandom(arr, n) {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
    if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result.forEach((item) => {
      const validEmail = validator.validate(item.email);
      if (validEmail == true) {
        sendEmail(
          item.email,
          "Payment Reminder",
          messages.payReminder(
            item.name,
            item.properties.grandDebt.toLocaleString(),
            item.properties.name,
            item.username
          )
        );
      }
    });
  };

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
  
    if (day == 25 && broadCastTime == 6) {
      let task = cron.schedule("* * * * * ", () => {
         extractEmail(filteredDebtors, 8);
      });

      if (day == 25 && broadCastTime == 20) {
        task.stop();
      }
      // Monthly Test Message
      // filteredDebtors.forEach((debtor) => {
      //   //  send SMS
      //   if (!/^[0-9]{11}$/.test(debtor.phone)) {
      //     // get only valid nigerian numbers with RegEx
      //     return false;
      //   } else {

      //     sendESms(
      //       debtor.phone,
      //       messages.payReminderSms(
      //         debtor.name,
      //         debtor.properties.grandDebt.toLocaleString(),
      //         debtor.properties.name,
      //         debtor.username
      //       )
      //     );
      //   }
      // });
    }
  } catch (error) {
    console.log(error);
  }

  // Monthly Mails to MD and ED
  // Total Debt✅
  // Total Debtors ✅
  // Highest Debtors ✅
  // Estate with Highest Debt
  // Total Sales by Estate
  // Total Email Sent ✅
  // Total SMS Sent✅
  // Total Estates
  // Total Customers ✅
  // New Customers ✅
  // Total Allocated
  // Total pending Allocation

  // sort.ng for Top Debtsors starts here.....................
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
  latestCustomers = users.filter((x) => x.createdAt > previoustMonth);

  //  Calculate total number of Debtors.starts here........................
  const noOfDebtors = objectLength(debtors);
  const totalCustomers = objectLength(users);
  const newClients = objectLength(latestCustomers);
  const totalSentEmails = totalEmail.length + 40;
  const totalPhonNum = totalPhone.length + 40;

  // Weekly Run down get ED and MD Details

  cron.schedule("15 16 * * 5",async ()=>{  // Fire at 15 mins after 4pm every Friday
      
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
             <div class="container">
                          <div class="row">
                              <div class="col">
                                <div style="background-color: #632264; padding-top: 3px; padding-bottom: 3px;">
                                    <h3 style="color: white; text-align: center;">RevolutionPlus Weekly Update</h3>
                                </div>

                              </div>
                          </div>
                      </div>

                       <h2>Dear ${adm.lastname} ${adm.firstname} </h2>

             <P> This is the weekly run-down of major activities in Revolutionplus client's Portal </strong>.</P>
                <ul style="list-style: none;">
                    <li>
                      1. Total Clients => ${totalCustomers.toLocaleString()}.
                    </li>
                    <li>
                      2. Total Owing Clients => ${noOfDebtors.toLocaleString()}.
                    </li>
                    <li>
                      6. Total Debt by all clients =>  <strong> &#x20A6; ${numFomatter(
                        totalDebt.toPrecision(5)
                      )}</strong>
                    </li>
                    <li>
                      7. Highest Amount Owed by a Single Client => <strong> &#x20A6;${numFomatter(
                        highestDebt
                      )} </strong>
                    </li>
                    <li>
                      8. Client With the Largest Debt:
                         <ul style="list-style: disc;">
                             <li>Name:: <span class="ms-3">${
                               highestDebtor.name
                             }</span></li>
                             <li>Outstanding Bal: <span class="ms-3"> &#x20A6; ${numFomatter(
                               highestDebtor.properties.grandDebt
                             )}</span></li>
                             <li>Estate:: <span class="ms-3">${
                               highestDebtor.properties.name
                             }</span></li>
                             <li>Phone::<span class="ms-3">${
                               highestDebtor.phone
                             }</span></li>
                             <li>Email:: <span class="ms-3">${
                               highestDebtor.email
                             }</span></li>
                             <li>Addr: <span class="ms-3">${
                               highestDebtor.address
                             }</span></li>
                         </ul>
                    </li>
                </ul>

                 <br>
                 <br>
                   <div class="container">
                          <div class="row">
                              <div class="col">
                                <div style="background-color: #6C757D; padding-top: 3px; padding-bottom: 3px;">
                                    <h3 style="color: white; text-align: center;">All rights reserved, ICT Support and Research Department.<br>
                                    For: RevolutionPlus property</h3>
                                </div>
                              </div>
                          </div>
                      </div>
                     `
        );
        if (adm.phone) {
          sendESms(
            adm.phone,
            `Weekly Update,
        Total Clients:${totalCustomers.toLocaleString()},
        Debtors:${noOfDebtors.toLocaleString()},
        Total Debt: NGN ${numFomatter(totalDebt.toPrecision(5))}
        Check Email for more
         `
          );
        }
      }
    });

  })

  if (day == 28 && broadCastTime == 11) {
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
          "RevolutionPlus Monthly Update",
          `
             <div class="container">
                          <div class="row">
                              <div class="col">
                                <div style="background-color: #632264; padding-top: 3px; padding-bottom: 3px;">
                                    <h3 style="color: white; text-align: center;">RevolutionPlus Monthly Update</h3>
                                </div>

                              </div>
                          </div>
                      </div>

                       <h2>Dear ${adm.lastname} ${adm.firstname} </h2>
             <P> Monthly overview of major events in the RevolutionPlus Portal for the month of <strong>${thisMonth} ${thisYear} </strong>.</P>
                <ul style="list-style: none;">
                    <li>
                      1. Total Clients => ${totalCustomers.toLocaleString()}.
                    </li>
                    <li>
                      2. Total Owing Clients => ${noOfDebtors.toLocaleString()}.
                    </li>
                    <li>
                      3. New Clients => Starts Next Month !
                    </li>
                    <li>
                      4. Total Emails Sent => ${totalSentEmails.toLocaleString()} ✅
                    </li>
                    <li>
                      5. Total SMS Sent => ${totalPhonNum.toLocaleString()} ✅
                    </li>
                    <li>
                      6. Total Debt by all clients =>  <strong> &#x20A6; ${numFomatter(
                        totalDebt.toPrecision(5)
                      )}</strong>
                    </li>
                    <li>
                      7. Highest Amount Owed by a Single Client => <strong> &#x20A6;${numFomatter(
                        highestDebt
                      )} </strong>
                    </li>
                    <li>
                      8. Client With the Largest Debt:
                         <ul style="list-style: disc;">
                             <li>Name:: <span class="ms-3">${
                               highestDebtor.name
                             }</span></li>
                             <li>Outstanding Bal: <span class="ms-3"> &#x20A6; ${numFomatter(
                               highestDebtor.properties.grandDebt
                             )}</span></li>
                             <li>Estate:: <span class="ms-3">${
                               highestDebtor.properties.name
                             }</span></li>
                             <li>Phone::<span class="ms-3">${
                               highestDebtor.phone
                             }</span></li>
                             <li>Email:: <span class="ms-3">${
                               highestDebtor.email
                             }</span></li>
                             <li>Addr: <span class="ms-3">${
                               highestDebtor.address
                             }</span></li>
                         </ul>
                    </li>
                </ul>

                 <br>
                 <br>
                  <div class="container">
                          <div class="row">
                              <div class="col">
                                <div style="background-color: #6C757D; padding-top: 3px; padding-bottom: 3px;">
                                    <h3 style="color: white; text-align: center;">All rights reserved, ICT Support and Research Department.<br>
                                    For: RevolutionPlus property</h3>
                                </div>
                              </div>
                          </div>
                      </div>
                     `
        );
        if (adm.phone) {
          sendESms(
            adm.phone,
            `Update ${thisMonth},${thisYear},
        Total Clients:${totalCustomers.toLocaleString()},
        Debtors:${noOfDebtors.toLocaleString()},
        Total Debt: NGN ${numFomatter(totalDebt.toPrecision(5))}
        Check Email for more
         `
          );
        }
      }
    });
  }
}
getCustomers();

module.exports = router;
