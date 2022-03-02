const router = require("express").Router();
const User = require("../models/User");
const render = require("xlsx");
const path = require("path");
const Property = require("../models/Property");
const crypto = require("crypto");

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
          name: a.name,
          email: a.email,
          address: a.address,
          phone: a.phone,
          branch: a.properties.o_branch,
          property: a.properties.name,
          quantity: a.properties.n_plots,
          detail: a.properties.detail,
          price_per_unit: a.properties.p_p_plot,
          total_for_property: a.properties.landTotal,
          amount_paid: a.properties.a_p_f_plots,
          payment_plan: a.properties.payOptions,
          reg_fee: a.properties.reg_fee,
          reg_fee_paid: a.properties.reg_paid,
          survey_fee: a.properties.surv_fee,
          survey_paid: a.properties.surv_paid,
          legal_fee: a.properties.legal_fee,
          legal_paid: a.properties.legal_paid,
          develoP_fee: a.properties.dev_fee,
          develop_paid: a.properties.dev_paid,
          electrif_fee: a.properties.elec_fee,
          electrif_paid: a.properties.elec_paid,
          service_charge: a.properties.service_fee,
          service_paid: a.properties.service_paid,
          deed_of_fee: a.properties.deed_fee,
          deed_of_paid: a.properties.deed_paid,
          ratifica_fee: a.properties.rat_fee,
          ratifica_paid: a.properties.rat_paid,
          defaultee_fee: a.properties.defau_fee,
          defaultee_paid: a.properties.defau_paid,
          all_transactions_cost: a.properties.grandTopay,
          total_amount_paid: a.properties.grandPaid,
          total_debt: a.properties.grandDebt,
          allocation_status: a.properties.allocation,
          block_no: a.properties.blockNum,
          plot_Num: a.properties.plotNum,
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
// Excel Import Handler

// import users page

router.get('/importusers', (req, res)=>{
  res.render("importusers", {
    title: 'import users'
  })
})

// import properties page
router.get('/importprops', (req, res)=>{
  res.render("importprops", {
    title: 'import properties'
  })
})

// import users handler

router.post("/importusers", async(req, res)=>{

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

    data.forEach(d=>{
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
         nameofkin: d.nameofkin,
         phoneOfKin: d.phoneOfKin,
         emailOfKin: d.emailOfKin,
         kinAddress: d.kinAddress,
       });
    })

   res.redirect('/importusers')
})


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
      image: d.image
    });
  });

  res.redirect('/importprops')
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
              detail: d.detail,
              p_date: d.p_date,
              image: "default Image.png",
              file_num: d.file_num,
              p_p_plot: d.p_p_plot,
              a_p_f_plots: d.a_p_f_plots,
              reg_fee: d.reg_fee,
              reg_paid: d.reg_paid,
              surv_fee: d.surv_fee,
              surv_paid: d.surv_paid,
              legal_fee: d.legal_fee,
              legal_paid: d.legal_paid,
              dev_fee: d.dev_fee,
              dev_paid: d.dev_paid,
              elec_fee: d.elec_fee,
              allocation: d.allocation,
              payOptions: d.payOptions,
              plotNum: d.plotNum,
              blockNum: d.blockNum,
              elec_paid: d.elec_paid,
              rat_fee: d.rat_fee,
              rat_paid: d.rat_paid,
              defau_fee: d.defau_fee,
              defau_paid: d.defau_paid,
              service_fee: d.service_fee,
              service_paid: d.service_paid,
              deed_fee: d.deed_fee,
              deed_paid: d.deed_paid,
              landTotal: Number(d.landTotal),
              landStatus: Number(d.landStatus),
              regisStatus: Number(d.regisStatus),
              surveStatus: Number(d.surveStatus),
              legalStatus: Number(d.legalStatus),
              develStatus: Number(d.develStatus),
              electStatus: Number(d.electStatus),
              ratifStatus: Number(d.ratifStatus),
              defauStatus: Number(d.defauStatus),
              serviceStatus: Number(d.serviceStatus),
              deedStatus: Number(d.deedStatus),
              grandTopay: Number(d.grandTopay),
              grandPaid: Number(d.grandPaid),
              grandDebt: Number(d.grandDebt),
            },
          },
        },
        (err, d) => {
          if (err) return false;
        }
      );
    });

    data.forEach((d) => {
      User.updateMany(
        { _id: { $in: [d.id] } },
        {
          $push: {
            properties: d.propeId,
          },
        },
        (err, d) => {
          if (err) return false;
        }
      );
    });

    res.redirect('/importdata')
  } catch (err) {
    console.log(err);
  }

});

module.exports = router;
