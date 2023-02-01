const router = require("express").Router();
const User = require("../models/User");
const render = require("xlsx");
const path = require("path");
const Property = require("../models/Property");
const crypto = require("crypto");
const axios = require('axios')
var cron = require("node-cron");
const validator = require("email-validator");
const {
  sendEmail,
  sendSms,
  messages,
  sendESms,
  ensureLoggedin,
} = require("../middleware/authe");

// export database details to excel

router.post("/exportdata/:id", async (req, res) => {
  const wb = render.utils.book_new(); // create new workbook

  try {
    const users = await User.aggregate([
      { $unwind: "$properties" },
      { $match: { "properties.propeId": req.params.id } },
    ]);

    let temp = JSON.stringify(users);
    temp = JSON.parse(temp);
    let propertyname; // to get the name of the property
    const filteredData = [];
    temp.forEach((a) => {
      propertyname = a.properties.name;
      if (a.role == "Customer") {
        filteredData.push({
          Estate: a.properties.name,
          Branch: a.properties.o_branch,
          "Opening Date": a.properties.p_date,
          "File Num": a.properties.file_num,
          "Clients Name": a.name,
          Address: a.address,
          Phone: a.phone,
          Email: a.email,
          "Next of Kin": a.nameOfKin,
          "Phone of Next of Kin": a.phoneOfKin,
          "Purpose of Purchase": a.properties.p_purchase,
          Quantity: a.properties.n_plots,
          Description: a.properties.detail,
          "Payment Plan": a.properties.payOptions,
          "Selling Price": a.properties.p_p_plot,
          Amount: a.properties.landTotal,
          "Amount Paid For Land": a.properties.a_p_f_plots,
          Cornerpiece: a.n_c_piece,
          "Cornerpiece Price": a.c_piece_price,
          "Cornerpiece Amount": a.c_piece_total,
          "Cornerpiece Paid": a.c_piece_paid,
          "Cornerpiece Balance": a.c_piece_status,
          "Survey Fee": a.properties.surv_fee,
          "Survey Paid": a.properties.surv_paid,
          "Survey Balance": a.properties.surveStatus,
          "Legal Fee": a.properties.legal_fee,
          "Legal Paid": a.properties.legal_paid,
          "Legal Balance": a.properties.legalStatus,
          "Form Fee": a.properties.reg_fee,
          "Form Paid": a.properties.reg_paid,
          "Form Balance": a.properties.regisStatus,
          "Development Fee": a.properties.dev_fee,
          "Development Paid": a.properties.dev_paid,
          "Development Fee Bal": a.properties.develStatus,
          "Electrification Fee": a.properties.elec_fee,
          "Electrification Paid": a.properties.elec_paid,
          "Electrification Balance": a.properties.electStatus,
          "Service Charge": a.properties.service_fee,
          "Service Paid": a.properties.service_paid,
          "Service Charge Balance": a.properties.serviceStatus,
          "Deed Fee": a.properties.deed_fee,
          "Deed Paid": a.properties.deed_paid,
          "Deed Balance": a.properties.deedStatus,
          "Ratification Fee": a.properties.rat_fee,
          "Ratification Paid": a.properties.rat_paid,
          "Ratification Balance": a.properties.ratifStatus,
          "Defaultee Fee": a.properties.defau_fee,
          "Defaultee Paid": a.properties.defau_paid,
          "Defaultee Status": a.properties.defauStatus,
          "Total Amount": a.properties.grandTopay,
          "Total Paid": a.properties.grandPaid,
          "Total Balance": a.properties.grandDebt,
          Allocation: a.properties.allocation,
          "Plot Number": a.properties.plotNum,
          "Block Number": a.properties.blockNum,
          Comment: a.properties.comment,
        });
      }
    });
    temp = filteredData;

    const ws = render.utils.json_to_sheet(temp);
    const down = path.resolve(
      `public/excel_maneger/downloads/ ${propertyname}.xlsx`
    );
    render.utils.book_append_sheet(wb, ws, "sheet1");
    render.writeFile(wb, down);
    res.download(down);
  } catch (error) {
    console.log(error);
  }
});





// Excel Import page

// router.post('/exportday', async (req, res) => {
//   const wb = render.utils.book_new(); // create new workbook
//     try {

//       const userdata = await User.find().sort({createdAt: 'desc'})
//        let temp = JSON.stringify(userdata);
//        temp = JSON.parse(temp);

//        let filteredData = [];

//        temp.forEach(dat=>{
//          filteredData.push({

//            userId: dat.id,
//            name: dat.name
//          })
//        })

//     } catch (error) {
//       console.log(error)
//     }

// })

// Excel Import Handler

// import users page

router.get("/importusers", (req, res) => {
  res.render("importusers", {
    title: "import users",
  });
});

// import properties page
router.get("/importprops", (req, res) => {
  res.render("importprops", {
    title: "import properties",
  });
});

// import users handler

router.post("/importusers", async (req, res) => {
  const imported = req.files.importdata;
  const uploadpath = path.resolve(
    `public/excel_maneger/uploads/ ${imported.name}`
  );
  if (imported.truncated) {
    throw new Error("Uploaded File is too big, should not be morethan 20 MB");
  }
  await imported.mv(uploadpath);
  const file = render.readFile(uploadpath);
  const sheets = file.SheetNames;
  const data = [];
  for (let i = 0; i < sheets.length; i++) {
    const sheetname = sheets[i];
    const sheetData = render.utils.sheet_to_json(file.Sheets[sheetname]);
    sheetData.forEach((item) => {
      data.push(item);
    });
  }

  data.forEach((d) => {
    User.insertMany({
      username: d.username,
      email: d.email,
      password: d.password,
      name: d.name,
      phone: d.phone,
      profilePic: d.profilePic,
      role: d.role,
      branch: d.branch,
      address: d.address,
      nameOfKin: d.nameofkin,
      phoneOfKin: d.phoneOfKin,
      emailOfKin: d.emailOfKin,
      kinAddress: d.kinAddress,
    });
  });

  res.redirect("/importusers");
});

// import property Handler

router.post("/importprops", async (req, res) => {
  const imported = req.files.importdata;
  const uploadpath = path.resolve(
    `public/excel_maneger/uploads/ ${imported.name}`
  );
  if (imported.truncated) {
    throw new Error("Uploaded File is too big, should not be morethan 20 MB");
  }
  await imported.mv(uploadpath);
  const file = render.readFile(uploadpath);
  const sheets = file.SheetNames;
  const data = [];
  for (let i = 0; i < sheets.length; i++) {
    const sheetname = sheets[i];
    const sheetData = render.utils.sheet_to_json(file.Sheets[sheetname]);
    sheetData.forEach((item) => {
      data.push(item);
    });
  }

  data.forEach((d) => {
    Property.insertMany({
      name: d.name,
      titleDoc: d.titleDoc,
      address: d.address,
      typeOfpro: d.typeOfpro,
      sizeOfPlot: d.sizeOfPlot,
      description: d.description,
      snippet: d.snippet,
      pricePerPlot: d.pricePerPlot,
      status: d.status,
      image: d.image,
    });
  });

  res.redirect("/importprops");
});

// Import assigned handler

router.get("/importdata", async (req, res) => {
  res.render("import", {
    title: "Import Files",
  });
});

router.put("/importdata", async (req, res) => {
  // upload queries

  const imported = req.files.importdata;
  const uploadpath = path.resolve(
    `public/excel_maneger/uploads/ ${imported.name}`
  );
  if (imported.truncated) {
    throw new Error("Uploaded File is too big, should not be morethan 20 MB");
  }
  await imported.mv(uploadpath);
  const file = render.readFile(uploadpath);
  const sheets = file.SheetNames;
  const data = [];
  for (let i = 0; i < sheets.length; i++) {
    const sheetname = sheets[i];
    const sheetData = render.utils.sheet_to_json(file.Sheets[sheetname]);
    sheetData.forEach((item) => {
      data.push(item);
    });
  }

  try {
    data.forEach((d) => {
      User.updateMany(
        { _id: { $in: [d.id] } },
        {
          $push: {
            properties: {
              uuid: crypto.randomBytes(32).toString("hex"),
              propeId: d.propeId,
              id: d.id,
              name: d.name,
              n_plots: d.n_plots,
              o_branch: d.o_branch,
              p_purchase: d.p_purchase,

              n_c_piece: d.n_c_piece,
              c_piece_price: d.c_piece_price,
              c_piece_paid: d.c_piece_paid,

              detail: d.detail,
              p_date: d.p_date,
              image: "default Image.png",
              file_num: d.file_num,
              p_p_plot: d.p_p_plot,
              a_p_f_plots: d.a_p_f_plots ? d.a_p_f_plots : 0,
              reg_fee: d.reg_fee ? d.reg_fee : 0,
              reg_paid: d.reg_paid ? d.reg_paid : 0,
              surv_fee: d.surv_fee ? d.surv_fee : 0,
              surv_paid: d.surv_paid ? d.surv_paid : 0,
              legal_fee: d.legal_fee ? d.legal_fee : 0,
              legal_paid: d.legal_paid ? d.legal_paid : 0,
              dev_fee: d.dev_fee ? d.dev_fee : 0,
              dev_paid: d.dev_paid ? d.dev_paid : 0,
              elec_fee: d.elec_fee ? d.elec_fee : 0,
              allocation: d.allocation ? d.allocation : "",
              payOptions: d.payOptions ? d.payOptions : "",
              plotNum: d.plotNum ? d.plotNum : "",
              blockNum: d.blockNum ? d.blockNum : "",
              elec_paid: d.elec_paid ? d.elec_paid : 0,
              rat_fee: d.rat_fee ? d.rat_fee : 0,
              rat_paid: d.rat_paid ? d.rat_paid : 0,
              defau_fee: d.defau_fee ? d.defau_fee : 0,
              defau_paid: d.defau_paid ? d.defau_paid : 0,
              service_fee: d.service_fee ? d.service_fee : 0,
              service_paid: d.service_paid ? d.service_paid : 0,
              deed_fee: d.deed_fee ? d.deed_fee : 0,
              deed_paid: d.deed_paid ? d.deed_paid : 0,
              landTotal: d.landTotal ? Number(d.landTotal) : 0,
              landStatus: d.landStatus ? Number(d.landStatus) : 0,

              cornerpieceTotal: d.c_piece_total ? Number(d.c_piece_total) : 0,
              cornerpieceStatus: d.c_piece_status
                ? Number(d.c_piece_status)
                : 0,

              regisStatus: d.regisStatus ? Number(d.regisStatus) : 0,
              surveStatus: d.surveStatus ? Number(d.surveStatus) : 0,
              legalStatus: d.legalStatus ? Number(d.legalStatus) : 0,
              develStatus: d.develStatus ? Number(d.develStatus) : 0,
              electStatus: d.electStatus ? Number(d.electStatus) : 0,
              ratifStatus: d.ratifStatus ? Number(d.ratifStatus) : 0,
              defauStatus: d.defauStatus ? Number(d.defauStatus) : 0,
              serviceStatus: d.serviceStatus ? Number(d.serviceStatus) : 0,
              deedStatus: d.deedStatus ? Number(d.deedStatus) : 0,
              grandTopay: d.grandTopay ? Number(d.grandTopay) : 0,
              grandPaid: d.grandPaid ? Number(d.grandPaid) : 0,
              grandDebt: d.grandDebt ? Number(d.grandDebt) : 0,
            },
          },

          $set: {
            nameOfKin: d.nameofkin,
          },
        },

        (err, d) => {
          if (err) return false;
        }
      );
    });

    res.redirect("/importdata");
  } catch (err) {
    console.log(err);
  }
});

router.get("/sendbulkpassword", (req, res) => {
  res.render("sendbulkpassword", {
    title: "sendbulkpassword",
  });
});

router.post("/sendbulkpassword", async (req, res) => {
 
   try {

     const clients = await User.find({role: "Customer"});
     clients.forEach((client) => {
       sendESms(
        client.phone,
       `Dear ${client.name}, Please visit RevolutionPlus portal on www.revclient.com and login with these details username: ${client.username}, password: revolutionpluspasword, to know more about your payment details. You can also call us on 012557386 for more information `
       );
     });        
      //     // cron.schedule("*/2 * * * *", () => {
           

      //     //   console.log('SMS Sent')
      //     // });

      // })

      req.flash("success_msg", "Bulk Password Sent");
      res.redirect("/sendbulkpassword");
   } catch (error) {
     console.log(error)
   }
 
});

//  Send Outward Email page
 router.get('/sendEmail', ensureLoggedin, (req, res)=>{

   res.render("sendEmail", {
     title: "Send Bulk Email",
   });

 })

 router.post("/sendEmail", async (req, res) => {
  
  //  validate input
  
  let { subject, imageEmbed, message} = req.body;

     subject = subject.trim();
     imageEmbed = imageEmbed.trim();
     message = message.trim()

     if (subject == '' && imageEmbed == '' && message == '') {
      return res.redirect("/sendEmail");

     }

     if(subject == ''){
        req.flash("error_msg", "Provide Email Subject");
       return res.redirect("/sendEmail");
     }

    const emailData = req.body

    try {
      
      const allUsers = await User.find();    // get all users
      
      let validUserEmail = [];

      allUsers.forEach(user=>{
       const validEmail = validator.validate(user.email); // validate emails
          if (validEmail == true) {
              validUserEmail.push(user)
          }
      })
       
       sendIntervalEmail(validUserEmail, emailData);  // call the cron function block
      
         req.flash("success_msg", "Bulk Email Sent");
         return res.redirect("/sendEmail");
    } catch (error) {
      console.log(error)
    }

      
 });


 function sendIntervalEmail(validUserEmail, emailData) {
    cron.schedule(' * * * * *', ()=>{
        if (validUserEmail.length > 0) {

          const currentUser = Math.floor(Math.random() * validUserEmail.length);

          const selectedUsers = validUserEmail.splice(currentUser, 5);

          sendBulkValidEmail(selectedUsers, emailData);
        }
    })
  
 }

 function sendBulkValidEmail(selectedUsers, emailData) {
  selectedUsers.forEach(user=>{
    //  Send Email to randomly selected Users
     sendEmail(
       user.email,
       emailData.subject,
       messages.sendCelebrationEmail(
         user.name ? user.name : user.firstname,
         emailData.subject,
         emailData.imageEmbed,
         emailData.message,
       )
     );
  })

 }


module.exports = router;
