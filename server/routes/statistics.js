const router = require("express").Router();
const { ensureLoggedin, mustBeAdmin, objectLength,   numFomatter } = require("../middleware/authe");

const User = require("../models/User");

// get statistic page
router.get("/statistics", ensureLoggedin, mustBeAdmin, async (req, res) => {
  // sort.ng for Top Debtsors starts here.....................
  const topDebtors = await User.aggregate([
    // unwind their properties
    { $unwind: "$properties" },
  ]);
  
  let filteredDebtors = [];
  topDebtors.forEach((debtor) => {
    if (Object.keys(debtor.properties).includes("propeId")) {
      // filter of unnecessary Objects unwound together
      filteredDebtors.push(debtor);
    }
  });

 
  // sorting the array in descending order according to grandebt
  const sortedDebtors = filteredDebtors.slice().sort((a, b) => {
    //sort the debtors array
    let grandDebtA = a.properties.grandDebt;
    let grandDebtB = b.properties.grandDebt;
    if (grandDebtA < grandDebtB) {
      return 1;
    } else if (grandDebtA > grandDebtB) {
      return -1;
    }
    return 0;
  });
 
  
  //.........................................................Sorting top debtors ends here

  // calculate total debts by all customers..............calculating sum of all debts starts here
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
  

 
  //  ...........................calculating sum of all debts ends here.................

  //  Calculate total number of Debtors.starts here........................
  const noOfDebtors = objectLength(debtors);

  res.render("statistics", {
    layout: "../layouts/dashboardLayout",
    title: "RevolutionPlus: Statistic",
    user: req.user,
    totalDebt,
    noOfDebtors,
    sortedDebtors,
    numFomatter,
  });
});



router.get("/add-debtors", ensureLoggedin, mustBeAdmin, async (req, res)=>{

  try {
    // sort.ng for Top Debtsors starts here.....................
    const topDebtors = await User.aggregate([
      // unwind their properties
      { $unwind: "$properties" },
    ]);
       
    

    let filteredDebtors = [];
    topDebtors.forEach((debtor) => {
      if (Object.keys(debtor.properties).includes("propeId")) {
        // filter of unnecessary Objects unwound together
        filteredDebtors.push(debtor);
      }
    });
    // sorting the array in descending order according to grandebt
    const sortedDebtors = filteredDebtors.slice().sort((a, b) => {
      //sort the debtors array
      let grandDebtA = a.properties.grandDebt;
      let grandDebtB = b.properties.grandDebt;
      if (grandDebtA < grandDebtB) {
        return 1;
      } else if (grandDebtA > grandDebtB) {
        return -1;
      }
      return 0;
    });

    res.render("all-debtors", {
      layout: "../layouts/dashboardLayout",
      title: "RevolutionPlus: Statistic",
      user: req.user,
      sortedDebtors,
      numFomatter,
    });
  } catch (error) {
    console.log("Debts")
  }

})

module.exports = router;
