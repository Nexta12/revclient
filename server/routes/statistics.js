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
  users.forEach((user) => {
    if (Object.keys(user.properties).length !== 0) {
      debts.push(user.properties[0]);
    }
  });

  // get an array of all debts by all customers
  let grandUgwo = [];
  debts.filter((debt) => {
    if (debt.grandDebt > 0) {
      grandUgwo.push(debt.grandDebt);
    }
  });

  // calculate the total debts.

  let sumOfAllUgwo = 0;
  for (let i = 0; i < grandUgwo.length; i++) {
    sumOfAllUgwo += grandUgwo[i];
  }

  const allUgwo = sumOfAllUgwo;

  //  ...........................calculating sum of all debts ends here.................

  //  Calculate total number of Debtors.starts here........................
  const noOfDebtors = objectLength(grandUgwo);

  res.render("statistics", {
    layout: "../layouts/dashboardLayout",
    title: "RevolutionPlus: Statistic",
    user: req.user,
    allUgwo,
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
