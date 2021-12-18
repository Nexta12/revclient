const router = require("express").Router();
const { ensureLoggedin, mustBeAdmin, objectLength,numFomatter} = require("../middleware/authe");
 const Property = require("../models/Property");
 const User = require("../models/User");
 const Statutory = require("../models/Statutory")


// start
 router.get("/dashboard", ensureLoggedin, mustBeAdmin, async (req, res) => {
   try {
     //    read latest registered customers within one month
     const date = new Date();
     const lastMonth = new Date(date.setMonth(date.getMonth() - 1)); //last month date
     const previoustMonth = new Date(
       new Date().setMonth(lastMonth.getMonth() - 1)
     ); //previous month date

     //     All customers that recently bought any property

     const allCustomers = await User.aggregate([
       { $unwind: "$properties" },
       {
         $match: { createdAt: { $gte: previoustMonth } }, //     this is all customers created this month
       },
     ]);

     let newPurchases = [];
     allCustomers.filter((x) => {
       if (Object.keys(x.properties).includes("propeId")) {
         //I matched propeId to remove unneccessary objects
         newPurchases.push(x);
       }
     });

     // get latest customers
     let latestCustomers = await User.find({ role: "Customer" })
       .sort({ createdAt: "desc" })
       .limit(15);

     latestCustomers = latestCustomers.filter(
       (x) => x.createdAt > previoustMonth
     );

     //    read total customers
     const totalCustomersnum = await User.find({ role: "Customer" });
     const totalPropeties = await Property.find();
     const allUsers = await User.find();

     let totalStaff = []
        allUsers.forEach(user =>{
          if(user.role != "Customer"){
            totalStaff.push(user)
          }
        })
     const totalStatutory = await Statutory.find()
     // counting the number of customers that bought a single property
     const totalCustomers = objectLength(totalCustomersnum);
     const totalProp = objectLength(totalPropeties);
     const totalStaf = objectLength(totalStaff);
     const totalStatu = objectLength(totalStatutory);

     res.render("dashboard", {
       layout: "../layouts/dashboardLayout",
       title: "RevolutionPlus: Dashboard",
       user: req.user,
       totalCustomers,
       totalProp,
       totalStaf,
       latestCustomers,
       newPurchases,
       numFomatter,
       totalStatu,
     });
   } catch (error) {
      res.render("errors/500", {
        title: "Error",
      });
   }
 });

 router.get("/customer-dashboard", ensureLoggedin, async (req, res) => {
   try {
     const properties = await Property.find()
       .sort({ createdAt: "desc" })
       .limit(6);

     res.render("customer-dashboard", {
       layout: "../layouts/dashboardLayout",
       title: "RevolutionPlus: Customer Dashboard",
       user: req.user,
       properties,
     });
   } catch (error) {
      res.render("errors/500", {
        title: "Error",
      });
   }
 });

 router.get("/staff-dashboard", ensureLoggedin, async (req, res) => {
   try {
     //    read latest registered customers within one month
     const date = new Date();
     const lastMonth = new Date(date.setMonth(date.getMonth() - 1)); //last month date
     const previoustMonth = new Date(
       new Date().setMonth(lastMonth.getMonth() - 1)
     ); //previous month date

     //     All customers that recently bought any property

     const allCustomers = await User.aggregate([
       { $unwind: "$properties" },
       {
         $match: { createdAt: { $gte: previoustMonth } }, //     this is all customers created this month
       },
     ]);

     let newPurchases = [];
     allCustomers.filter((x) => {
       if (Object.keys(x.properties).includes("propeId")) {
         //I matched propeId to remove unneccessary objects
         newPurchases.push(x);
       }
     });

     // get latest customers
     let latestCustomers = await User.find({ role: "Customer" })
       .sort({ createdAt: "desc" })
       .limit(5);

     latestCustomers = latestCustomers.filter(
       (x) => x.createdAt > previoustMonth
     );

     //    read total customers

     const totalCustomersnum = await User.find({ role: "Customer" });
     const totalPropeties = await Property.find();

     const allUsers = await User.find();

     let totalStaff = [];
     allUsers.forEach((user) => {
       if (user.role != "Customer") {
         totalStaff.push(user);
       }
     });
       const totalStatutory = await Statutory.find();
     // counting the number of customers that bought a single property
     const totalCustomers = objectLength(totalCustomersnum);
     const totalProp = objectLength(totalPropeties);
     const totalStaf = objectLength(totalStaff);
     const totalStatu = objectLength(totalStatutory);

     res.render("staff-dashboard", {
       layout: "../layouts/dashboardLayout",
       title: "RevolutionPlus: Staff Dashboard",
       user: req.user,
       totalCustomers,
       totalProp,
       totalStaf,
       latestCustomers,
       newPurchases,
       totalStatu,
     });
   } catch (error) {
     res.render("errors/500", {
       title: "Error",
     });
   }
 });

 module.exports = router;



// stops

module.exports = router;
