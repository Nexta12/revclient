const router = require("express").Router();
const User = require("../models/User");
const {
  ensureLoggedin,
  usernameToLowerCase,
  mustBeAdminOrStaff,
  numFomatter,
  sendEmail,
  messages
} = require("../middleware/authe");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const Assign = require("../models/Assign");
const Property = require("../models/Property");

router.get(
  "/customers/:page",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    let perPage = 10;
    let page = req.params.page || 1;

    try {
      const customers = await User.find({ role: "Customer" })
        .sort({ createdAt: 'desc' })
        .skip(perPage * page - perPage)
        .limit(perPage);
      const count = await User.count({ role: "Customer" });

      res.render("customer", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: Customers",
        customers,
        current: page,
        perPage,
        pages: Math.ceil(count / perPage),
        user: req.user,
      });
    } catch (error) {
      res.render("errors/500", {
        title: "Error",
      });
    }
  }
);

//get Add new customer page
router.get(
  "/add_new_customer",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      res.render("add_customer", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: Add New Customer",
        user,
      });
    } catch (error) {
      res.render("errors/500", {
        title: "Error",
      });
    }
  }
);

//  post or create new customer
router.post(
  "/add_new_customer",
  ensureLoggedin,
  mustBeAdminOrStaff,
  usernameToLowerCase,
  [
    check("username")
      .trim()
      .toLowerCase()
      .notEmpty()
      .withMessage("Username cannot be empty !!! ")
      .custom((value, { req }) => {
        return User.findOne({ username: req.body.username }).then((user) => {
          if (user) {
            return Promise.reject("This Username Already Exists");
          }
        });
      })
      .isLength({ min: 4 })
      .withMessage("Username is too Short"),
    check("email")
      .trim()
      .toLowerCase()
      .isEmail()
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: req.body.email }).then((user) => {
          if (user) {
            return Promise.reject("This Email is Already Registered");
          }
        });
      }),
    check("password")
      .notEmpty()
      .withMessage("Please Provide Password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 Characters Long")
      .trim(),
    // check("password2")
    //   .exists()
    //   .custom((value, { req }) => {
    //     if (value !== req.body.password) {
    //       throw new Error("The passwords is not same!!!");
    //     }
    //     return true;
    //   }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const {
        name,
        phone,
        address,
        email,
        username,
        nameOfKin,
        emailOfKin,
        phoneOfKin,
        kinAddress,
      } = req.body;

      const errorAlert = errors.array();
      const user = await User.findById(req.user.id);
      res.render("add_customer", {
        errorAlert,
        user,
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: Add New Customer",
        name,
        phone,
        address,
        email,
        username,
        nameOfKin,
        emailOfKin,
        phoneOfKin,
        kinAddress,
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      try {
        const newUser = await User.create({
          name: req.body.name,
          phone: req.body.phone,
          address: req.body.address,
          country: req.body.country,
          email: req.body.email,
          username: req.body.username,
          nameOfKin: req.body.nameOfKin,
          emailOfKin: req.body.emailOfKin,
          phoneOfKin: req.body.phoneOfKin,
          kinAddress: req.body.kinAddress,
          password: hashedPassword,
        });
       // Send Email
         sendEmail(
           newUser.email,
           "RevolutionPlus Portal Registration",
           messages.customerRegEmail(newUser.name, newUser.username, req.body.password)
         );
        req.flash("success_msg", "Your registration was successful");
        res.redirect("/api/v2/customers/add_new_customer");
      } catch (error) {
        req.flash(
          "error_msg",
          "A little Server Error, Please Refresh Browser and try again"
        );
        res.redirect("/api/v2/customers/add_new_customer");
      }
    }
  }
);

// edit customer  page
router.get(
  "/edit/:id",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const singleUserContent = await User.findById(req.params.id);
      res.render("edit_customer", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: Customer Edit",
        user,
        singleUserContent,
      });
    } catch (error) {
      res.render("errors/500", {
        title: "Error",
      });
    }
  }
);

// updating a Customer detail
router.put("/:id", ensureLoggedin, mustBeAdminOrStaff, async (req, res) => {
 
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
  try {
    await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    req.flash("success_msg", "Update Successfull");
    res.redirect("/api/v2/customers/customers/1");
  } catch (error) {
    console.log(error)
  }

});

// get one customer properties
router.get("/:id", ensureLoggedin, async (req, res) => {
  if (
    req.user.id === req.params.id ||
    req.user.role === "Admin" ||
    req.user.role === "Staff"
  ) {
    try {
      let singleUserProperty = await User.aggregate([
        { $unwind: "$properties" },
        { $match: { "properties.id": req.params.id } },
        { $group: { _id: "$_id", properties: { $push: "$properties" } } },
      ]); // the above matches the customer id with his properties id

      let property = [];
      for (let i = 0; i < singleUserProperty.length; i++) {
        property.push(singleUserProperty[i].properties);
      }
      let objJson1 = property[0]; // this returns all his properties in the properties array
      const singleUser = await User.findById(req.params.id); //returns the owner of the properties
      const user = await User.findById(req.user.id); // returns the current user of the page for dashboard
      if (singleUser) {
        res.render("single_customer", {
          layout: "../layouts/dashboardLayout",
          title: "RevolutionPlus: Customer view",
          singleUser,
          user,
          objJson1,
          numFomatter,
        });
      } else {
        res.render("errors/404", {
          title: "Error",
        });
      }
    } catch (error) {
      res.render("errors/500", {
        title: "Error",
      });
    }
  } else {
    res.render("errors/403", {
      title: "Error",
    });
  }
});

//  get one Customer property purchase details

router.get("/single/:id/:propeId/:uuid", ensureLoggedin, async (req, res) => {
  try {
    const propeType = await Property.findById(req.params.propeId); //get type of property for display only
    const propertyOwner = await User.findById(req.params.id); // get property owner to grant access/get his purchase details
     
    let proDetail; // this will set each property purchase detail
     propertyOwner.properties.forEach(item=>{
      if(item.uuid == req.params.uuid){
         proDetail = item
      }
     })

    if (
      req.user.id == propertyOwner.id ||
      req.user.role == "Admin" ||
      req.user.role == "Staff"
    ) {

      
      res.render("purchase-details", {
        title: "RevolutionPlus: Purchase details",
        layout: "../layouts/dashboardLayout",
        user: req.user,
        propertyOwner,
        proDetail,
        numFomatter,
        propeType,
      });
    } else {
      res.render("errors/403", {
        title: "Error",
      });
    }
  } catch (error) {
    res.render("errors/500", {
      title: "Error",
    });
  }
});

router.get(
  "/testtable",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    console.log("Hello");
  }
);

// deleting a customer
router.delete(
  "/delete/:id",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    if (req.user.role == "Admin") {
      try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect("/api/v2/customers/customers/1");
      } catch (error) {
        res.render("errors/500", {
          title: "Error",
        });
      }
    } else {
      res.render("errors/403", {
        title: "Error",
      });
    }
  }
);

// searching for customers using Ajax LiveSearch

router.post("/getCustomers", async (req, res) => {
  let payload = req.body.payload.trim(); //input in the search bar
  let search = await User.find({
    role: "Customer",
    name: { $regex: new RegExp(".*" + payload + ".*", "i") },
  });
  //  limit search Result to 10
  search = search.slice(0, 10);
  res.send({ payload: search });
});

module.exports = router;
